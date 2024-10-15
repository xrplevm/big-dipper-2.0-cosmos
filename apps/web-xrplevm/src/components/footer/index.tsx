import SocialMedia from '@/components/footer/components/social_media';
import useStyles from '@/components/footer/styles';
import { donateLink } from '@/components/footer/utils';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';

import useAppTranslation from '@/hooks/useAppTranslation';
import { FC } from 'react';
import { PeersystIcon } from '@/components/icons';

const Footer: FC<{ className?: string }> = ({ className }) => {
  const { t } = useAppTranslation();
  const { classes, cx } = useStyles();

  return (
    <footer className={cx(classes.root, className)}>
      <div className="footer">
        {/* links */}
        {/* ============================= */}
        <div className="footer__links">
          <div>
            <PeersystIcon />
            <p className="xrp_text">
              Building the XRPLedger EVMSidechain and bridge solution for XRP with Ripple
            </p>
          </div>
          <div />
          {/* ============================= */}
          {/* social */}
          {/* ============================= */}
          <div className="footer__social">
            <h3>{t('common:community')}</h3>
            <SocialMedia />
            <div>
              <p className="footer__donate--excerpt" />
              <a href={donateLink.url} target="_blank" rel="noreferrer">
                <Button className="footer__donate-button" variant="contained" color="primary">
                  {t('common:donate')}
                </Button>
              </a>
            </div>
          </div>
          <div className="unColor" />
        </div>
      </div>
      <Divider />
    </footer>
  );
};

export default Footer;
