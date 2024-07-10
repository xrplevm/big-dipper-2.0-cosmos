import { ReactNode } from 'react';
import { GithubIcon, TelegramIcon, TwitterIcon } from '@/components/icons';

export const socialMediaLinks: {
  component: ReactNode;
  className: string;
  url: string;
}[] = [
  {
    component: <TelegramIcon />,
    className: 'telegram',
    url: 'https://t.me/forbole',
  },
  {
    component: <TwitterIcon />,
    className: 'twitter',
    url: 'https://x.com/Peersyst ',
  },
  {
    component: <GithubIcon />,
    className: 'github',
    url: 'https://github.com/forbole',
  },
];
