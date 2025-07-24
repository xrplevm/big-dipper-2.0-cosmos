import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import useAppTranslation from '@/hooks/useAppTranslation';
import { FC } from 'react';
import { formatNumber, formatSymbol } from '@/utils/format_token';
import type { OtherTokenType } from '@/screens/account_details/types';
import { columns } from '@/screens/account_details/components/other_tokens/components/desktop/utils';
import { Link } from '@mui/material';
import chainConfig from '@/chainConfig';

const explorerUrl = chainConfig().endpoints.blockExplorer;
type DesktopProps = {
  className?: string;
  items?: OtherTokenType[];
};

const Desktop: FC<DesktopProps> = ({ className, items }) => {
  const { t } = useAppTranslation('accounts');

  const formattedItems = items?.map((x, i) => ({
    key: i,
    token: x.denom.toUpperCase(),
    symbol: formatSymbol(x.parsedDenom),
    commission: x.commission ? formatNumber(x.commission.value, x.commission.exponent) : '',
    available: formatNumber(x.available.value, x.available.exponent),
    reward: x.reward ? formatNumber(x.reward.value, x.reward.exponent) : '',
    erc20Address: x.erc20Address,
  }));

  return (
    <div className={className}>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell
                key={column.key}
                align={column.align}
                style={{ width: `${column.width}%` }}
              >
                {t(column.key)}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {formattedItems?.map((row) => (
            <TableRow key={`holders-row-${row.key}`}>
              {columns.map((column) => {
                if (column.key === 'symbol') {
                  return (
                    <TableCell key={column.key} align={column.align}>
                      {row.symbol}
                    </TableCell>
                  );
                }

                if (column.key === 'token') {
                  return (
                    <TableCell key={column.key} align={column.align}>
                      {row.erc20Address ? (
                        <Link
                          href={`${explorerUrl}/token/${row.erc20Address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {row.token}
                        </Link>
                      ) : (
                        <span>{row.token}</span>
                      )}
                    </TableCell>
                  );
                }

                return (
                  <TableCell
                    key={column.key}
                    align={column.align}
                    style={{ width: `${column.width}%` }}
                  >
                    {row[column.key as keyof typeof row]}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
export default Desktop;
