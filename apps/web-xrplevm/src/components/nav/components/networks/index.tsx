import SingleNetwork from '@/components/nav/components/networks/components/single_network';
import useStyles from '@/components/nav/components/networks/styles';
import Typography from '@mui/material/Typography';
import Image from 'next/image';
import { FC } from 'react';

const Networks: FC<ComponentDefault> = ({ className }) => {
  const { classes } = useStyles();
  const networks = [
    {
      logo: 'https://livenet.xrpl.org/apple-touch-icon.png',
      name: 'XRPL Explorer',
      mainnet: [
        {
          chainId: 'xrpl-mainnet',
          url: 'https://livenet.xrpl.org/',
          name: 'Mainnet',
        },
      ],
      testnet: [
        {
          chainId: 'xrpl-testnet',
          url: 'https://testnet.xrpl.org/',
          name: 'Testnet',
        },
      ],
      retired: [],
      other: [
        {
          chainId: 'xrpl-devnet',
          url: 'https://devnet.xrpl.org/',
          name: 'Devnet',
        },
      ],
    },
  ];
  return (
    <div className={className}>
      {networks.map((x) => (
        <div className={classes.networkList} key={x.name}>
          <Image width={0} height={0} className={classes.img} src={x.logo} alt="logo" unoptimized />
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
            {x.retired.map((network) => (
              <SingleNetwork
                className="retired"
                key={network.chainId}
                url={network.url}
                name={network.name}
                chainId={network.chainId}
              />
            ))}
            {x.other.map((network) => (
              <SingleNetwork
                className="other"
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
