export const columns: {
  key: string;
  align?: 'left' | 'center' | 'right' | 'justify' | 'inherit';
  width: number;
}[] = [
  {
    key: 'symbol',
    width: 20,
  },
  {
    key: 'token',
    width: 20,
  },
  {
    key: 'available',
    width: 20,
    align: 'right',
  },
  {
    key: 'reward',
    width: 20,
    align: 'right',
  },
  {
    key: 'commission',
    width: 20,
    align: 'right',
  },
];
