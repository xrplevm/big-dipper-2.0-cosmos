// ─── Types ────────────────────────────────────────────────────────────────────

export type ConsensusMode = 'ws' | 'rpc' | 'mixed';

export type ConsensusClientConfig = {
  wsUrl?: string;
  rpcUrl?: string;
  mode?: ConsensusMode; // default: 'mixed'
  pollInterval?: number; // ms, default: 3000
  wsTimeoutMs?: number; // ms to wait for WS open before falling back (mixed only)
};

type ConsensusEvents = {
  newRound: (data: unknown) => void;
  newStep: (data: unknown) => void;
  open: () => void;
  close: () => void;
};

type EventName = keyof ConsensusEvents;

// ─── Interface ────────────────────────────────────────────────────────────────

export interface IConsensusTransport {
  on<K extends EventName>(event: K, listener: ConsensusEvents[K]): () => void;
  start(): void;
  stop(): void;
}

// ─── Shared emitter mixin ─────────────────────────────────────────────────────

class ConsensusEmitter implements IConsensusTransport {
  protected listeners: { [K in EventName]: Set<ConsensusEvents[K]> } = {
    newRound: new Set(),
    newStep: new Set(),
    open: new Set(),
    close: new Set(),
  };

  on<K extends EventName>(event: K, listener: ConsensusEvents[K]): () => void {
    (this.listeners[event] as Set<ConsensusEvents[K]>).add(listener);
    return () => (this.listeners[event] as Set<ConsensusEvents[K]>).delete(listener);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  start(): void {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  stop(): void {}

  protected emit<K extends EventName>(event: K, ...args: Parameters<ConsensusEvents[K]>) {
    (this.listeners[event] as Set<(...a: unknown[]) => void>).forEach((l) => l(...args));
  }
}

// ─── ConsensusWSClient ────────────────────────────────────────────────────────

const WS_KEEP_ALIVE = 30 * 1000;

export class ConsensusWSClient extends ConsensusEmitter {
  private readonly wsUrl: string;
  private ws: WebSocket | null = null;
  private keepAliveTimer: ReturnType<typeof setInterval> | null = null;

  constructor(wsUrl: string) {
    super();
    this.wsUrl = wsUrl;
  }

  start() {
    console.log('[ConsensusWSClient] connecting to', this.wsUrl);
    const ws = new WebSocket(this.wsUrl);
    this.ws = ws;

    ws.onopen = () => {
      console.log('[ConsensusWSClient] opened');
      ws.send(
        JSON.stringify({
          jsonrpc: '2.0',
          method: 'subscribe',
          id: 0,
          params: { query: "tm.event='NewRoundStep'" },
        })
      );
      ws.send(
        JSON.stringify({
          jsonrpc: '2.0',
          method: 'subscribe',
          id: 0,
          params: { query: "tm.event='NewRound'" },
        })
      );
      console.log('[ConsensusWSClient] subscribed to NewRoundStep and NewRound');
      this.keepAliveTimer = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: 'ping' }));
      }, WS_KEEP_ALIVE);
      this.emit('open');
    };

    ws.onmessage = (e) => {
      if (ws !== this.ws) return;
      try {
        const msg = JSON.parse(e.data as string);
        const type: string = msg?.result?.data?.type ?? '';
        console.log('[ConsensusWSClient] message received, type:', type || '(empty)');
        if (type === 'tendermint/event/NewRound') this.emit('newRound', msg);
        else if (type === 'tendermint/event/RoundState') this.emit('newStep', msg);
      } catch (err) {
        console.error('[ConsensusWSClient] failed to parse message', err);
      }
    };

    ws.onerror = (err) => {
      console.error('[ConsensusWSClient] error', err);
    };

    ws.onclose = (e) => {
      this.clearKeepAlive();
      console.warn(`[ConsensusWSClient] closed (code=${e.code} reason="${e.reason}")`);
      this.emit('close');
    };
  }

  stop() {
    this.clearKeepAlive();
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.close();
      this.ws = null;
    }
  }

  private clearKeepAlive() {
    if (this.keepAliveTimer) {
      clearInterval(this.keepAliveTimer);
      this.keepAliveTimer = null;
    }
  }
}

// ─── ConsensusRPCClient ───────────────────────────────────────────────────────

const DEFAULT_POLL_INTERVAL = 500;

// Reverse map: numeric step from RPC -> step name used by WS events
const STEP_NAME: Record<number, string> = {
  1: 'RoundStepNewHeight',
  2: 'RoundStepPropose',
  3: 'RoundStepPrevote',
  4: 'RoundStepPrecommit',
  5: 'RoundStepCommit',
};

export class ConsensusRPCClient extends ConsensusEmitter {
  private readonly rpcUrl: string;
  private readonly pollInterval: number;
  private pollTimer: ReturnType<typeof setInterval> | null = null;

  constructor(rpcUrl: string, pollInterval = DEFAULT_POLL_INTERVAL) {
    super();
    this.rpcUrl = rpcUrl;
    this.pollInterval = pollInterval;
  }

  start() {
    if (this.pollTimer) return;
    this.fetch();
    this.pollTimer = setInterval(() => this.fetch(), this.pollInterval);
  }

  stop() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  private async fetch() {
    try {
      const res = await fetch(`${this.rpcUrl}/consensus_state`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const roundState = json?.result?.round_state;
      if (!roundState) throw new Error('missing round_state');

      const [height, roundStr, stepStr] = (roundState['height/round/step'] as string).split('/');
      const round = parseInt(roundStr, 10);
      const step = STEP_NAME[parseInt(stepStr, 10)] ?? 'RoundStepNewHeight';
      const proposer = roundState.proposer ?? { address: '', index: 0 };

      this.emit('newRound', {
        result: {
          data: { type: 'tendermint/event/NewRound', value: { height, round, step, proposer } },
        },
      });
      this.emit('newStep', {
        result: { data: { type: 'tendermint/event/RoundState', value: { height, round, step } } },
      });
    } catch (err) {
      console.error('[ConsensusRPCClient] fetch failed', err);
    }
  }
}

// ─── ConsensusClient (orchestrator) ──────────────────────────────────────────

export class ConsensusClient extends ConsensusEmitter {
  private readonly config: ConsensusClientConfig;
  private readonly mode: ConsensusMode;
  private ws: ConsensusWSClient | null = null;
  private rpc: ConsensusRPCClient | null = null;
  private wsTimeoutTimer: ReturnType<typeof setTimeout> | null = null;
  private wsReconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private destroyed = false;

  constructor(config: ConsensusClientConfig) {
    super();
    this.config = config;
    this.mode = config.mode ?? 'mixed';
  }

  start() {
    if (this.mode === 'rpc' || this.mode === 'mixed') this.startRpc();
    if (this.mode === 'ws' || this.mode === 'mixed') this.startWs();
  }

  stop() {
    this.destroyed = true;
    this.clearTimers();
    this.ws?.stop();
    this.rpc?.stop();
  }

  // ── RPC ──────────────────────────────────────────────────────────────────

  private startRpc() {
    if (!this.config.rpcUrl) {
      console.warn('[ConsensusClient] rpcUrl not set, skipping RPC');
      return;
    }
    if (this.rpc) {
      this.rpc.start();
      return;
    }
    this.rpc = new ConsensusRPCClient(this.config.rpcUrl, this.config.pollInterval);
    this.rpc.on('newRound', (data) => this.emit('newRound', data));
    this.rpc.on('newStep', (data) => this.emit('newStep', data));
    this.rpc.start();
  }

  private stopRpc() {
    this.rpc?.stop();
  }

  // ── WS ───────────────────────────────────────────────────────────────────

  private startWs() {
    if (!this.config.wsUrl) {
      console.warn('[ConsensusClient] wsUrl not set, skipping WS');
      return;
    }

    if (this.mode === 'mixed' && this.config.wsTimeoutMs) {
      this.wsTimeoutTimer = setTimeout(() => {
        console.warn('[ConsensusClient] WS timed out, staying on RPC');
      }, this.config.wsTimeoutMs);
    }

    this.ws = new ConsensusWSClient(this.config.wsUrl);
    this.ws.on('newRound', (data) => this.emit('newRound', data));
    this.ws.on('newStep', (data) => this.emit('newStep', data));
    this.ws.on('open', () => {
      this.clearWsTimeout();
      if (this.mode === 'mixed') this.stopRpc();
    });
    this.ws.on('close', () => {
      if (this.destroyed) return;
      if (this.mode === 'mixed') this.startRpc();
      this.wsReconnectTimer = setTimeout(() => {
        if (!this.destroyed) this.startWs();
      }, 3000);
    });
    this.ws.start();
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private clearWsTimeout() {
    if (this.wsTimeoutTimer) {
      clearTimeout(this.wsTimeoutTimer);
      this.wsTimeoutTimer = null;
    }
  }

  private clearTimers() {
    this.clearWsTimeout();
    if (this.wsReconnectTimer) {
      clearTimeout(this.wsReconnectTimer);
      this.wsReconnectTimer = null;
    }
  }
}
