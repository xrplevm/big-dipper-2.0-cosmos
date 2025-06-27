import SingleNetwork from '@/components/nav/components/networks/components/single_network';
import useStyles from '@/components/nav/components/networks/styles';
import Typography from '@mui/material/Typography';
import Image from 'next/image';
import { FC } from 'react';

const Networks: FC<ComponentDefault> = ({ className }) => {
  const { classes } = useStyles();

  interface NetworkUrl {
    chainId: string;
    url: string;
    name: string;
  }

  interface Network {
    logo: string;
    name: string;
    mainnet: NetworkUrl[];
    testnet: NetworkUrl[];
    devnet: NetworkUrl[];
  }

  const networks: Network[] = [
    {
      logo: '/xrplevm/images/xrpl-evm-logo.png',
      name: 'XRPL',
      mainnet: [
        {
          chainId: 'xrpl-mainnet',
          url: 'https://governance.xrplevm.org/',
          name: 'Mainnet',
        },
      ],
      testnet: [
        {
          chainId: 'xrpl-testnet',
          url: 'https://governance.testnet.xrplevm.org/',
          name: 'Testnet',
        },
      ],
      devnet: [
        {
          chainId: 'xrpl-devnet',
          url: 'https://governance.devnet.xrplevm.org/',
          name: 'Devnet',
        },
      ],
    },
  ];
  return (
    <div className={className}>
      {networks.map((x) => (
        <div className={classes.networkList} key={x.name}>
          <Image width={6} height={26} src={x.logo} alt="logo" unoptimized />
          <div className="network">
            <Typography variant="h4">{x.name}</Typography>
            {x.mainnet.map((network) => (
              <SingleNetwork
                className="mainnet"
                key={network.chainId}
                url={network.url}
                name={network.name}
                chainId={network.chainId}
              />
            ))}
            {x.testnet.map((network) => (
              <SingleNetwork
                className="testnet"
                key={network.chainId}
                url={network.url}
                name={network.name}
                chainId={network.chainId}
              />
            ))}
            {x.devnet.map((network) => (
              <SingleNetwork
                className="devnet"
                key={network.chainId}
                url={network.url}
                name={network.name}
                chainId={network.chainId}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Networks;
