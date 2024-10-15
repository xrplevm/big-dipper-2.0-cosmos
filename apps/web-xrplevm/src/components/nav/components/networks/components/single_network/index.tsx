import Typography from '@mui/material/Typography';
import useStyles from '@/components/nav/components/networks/components/single_network/styles';

const SingleNetwork = (props: {
  url: string;
  chainId: string;
  name: string;
  className: string;
  disabled?: boolean;
}) => {
  const { url, chainId, name, className, disabled } = props;
  const { classes, cx } = useStyles();

  const WrapperComponent = disabled ? 'div' : 'a';
  const wrapperProps = disabled ? {} : { href: url, target: '_blank', rel: 'noreferrer' };

  return (
    <WrapperComponent {...wrapperProps} className={classes.root}>
      <div className={classes.item}>
        <p>{chainId}</p>
        <Typography className={cx(className, classes.status)} component="div" variant="caption">
          {name}
        </Typography>
      </div>
    </WrapperComponent>
  );
};

export default SingleNetwork;
