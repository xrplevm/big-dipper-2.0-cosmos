import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()(() => ({
  link: {
    '&:hover': {
      textDecoration: 'underline',
    },
  },
}));

export default useStyles;
