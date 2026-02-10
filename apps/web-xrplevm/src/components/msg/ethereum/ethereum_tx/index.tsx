import chainConfig from '@/chainConfig';
import AppTrans from '@/components/AppTrans';
import Name from '@/components/name';
import { MsgEthereumTx } from '@/models';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import useAppTranslation from 'ui/src/hooks/useAppTranslation';
import useStyles from './styles';

const { endpoints } = chainConfig();

const EthereumTx = (props: { message: MsgEthereumTx }) => {
  const { message } = props;

  const { t: tHome } = useAppTranslation('home');
  const { classes } = useStyles();

  return (
    <>
      <Typography>
        <AppTrans
          i18nKey="message_contents:MsgEthereumTx"
          components={[
            <Name address={message.cosmosFrom} name={message.cosmosFrom} />,
            <Name address={message.cosmosTo} name={message.cosmosTo || 'contract creation'} />,
          ]}
          values={{
            value: message.value,
          }}
        />
      </Typography>
      {message.hash && endpoints.evmExplorer && (
        <Link
          href={`${endpoints.evmExplorer}/tx/${message.hash}`}
          target="_blank"
          rel="noreferrer"
          className={classes.link}
        >
          {tHome('seeMore')}
        </Link>
      )}
    </>
  );
};

export default EthereumTx;
