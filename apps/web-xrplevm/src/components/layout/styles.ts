import { CSSObject } from '@emotion/react';
import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()((theme) => ({
  root: {
    [theme.breakpoints.up('lg')]: {
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
    },
  },
  contentWrapper: {
    [theme.breakpoints.up('lg')]: {
      display: 'flex',
      flex: 1,
    },
  },
  footer: {
    [theme.breakpoints.up('lg')]: {
      position: 'relative',
      zIndex: 1299,
      background: 'transparent',
      backdropFilter: 'blur(8px)',
    },
    '& .footer__logo--container': {
      display: 'none',
    },
  },
  appBarPlaceholder: {
    '@media (min-width: 1280px)': {
      height: '4.8rem',
      overflow: 'hidden',
    },
  },
  children: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    '& .main-content': {
      width: '100%',
      flex: 1,
    },
  },
  content: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    textAlign: 'center',
    color: theme.palette.custom.fonts.fontOne,
    backgroundColor: theme.palette.custom.wallet.backgroundTwo,
    padding: theme.spacing(1.5),
    marginTop: theme.spacing(2),
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  backgroundLeft: {
    backgroundImage:
      "url('https://governance.xrplevm.org/xrp/_next/static/media/bg-top.54b41bbe.png')",
    backgroundPosition: 'left top',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'contain',
    position: 'absolute',
    height: '505px',
    width: '325px',
    zIndex: -2,
    top: 0,
    [theme.breakpoints.down('lg')]: {
      left: 0,
      top: '212px',
    },
  },
  backgroundRight: {
    backgroundImage:
      "url('https://governance.xrplevm.org/xrp/_next/static/media/bg-bottom.b0d91a03.png')",
    backgroundPosition: 'right bottom',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'contain',
    position: 'absolute',
    height: '505px',
    width: ' 288px',
    zIndex: -2,
    bottom: 0,
    right: 0,
  },
}));

export default useStyles;
