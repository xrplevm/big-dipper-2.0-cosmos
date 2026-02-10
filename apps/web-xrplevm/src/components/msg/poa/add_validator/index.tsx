import { MsgAddValidator } from '@/models';
import AppTrans from 'ui/src/components/AppTrans';
import Tag from 'ui/src/components/tag';
import { getMiddleEllipsis } from 'ui/src/utils/get_middle_ellipsis';

const AddValidator = (props: { message: MsgAddValidator }) => {
  const { message } = props;

  return (
    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
      <AppTrans
        i18nKey="message_contents:MsgAddValidator"
        components={[
          <Tag
            value={getMiddleEllipsis(message.pubkey.key, { beginning: 8, ending: 8 })}
            theme="ten"
          />,
        ]}
        values={{
          moniker: message.description.moniker,
          address: message.validator_address,
          pubkey: message.pubkey.key,
        }}
      />
    </div>
  );
};

export default AddValidator;
