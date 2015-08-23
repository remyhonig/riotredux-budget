import Numeral from 'numeral';

Numeral.language('nl', {
  delimiters: {
    thousands: '.',
    decimal  : ','
  },
  abbreviations: {
    thousand : 'k',
    million  : 'mln',
    billion  : 'mrd',
    trillion : 'bln'
  },
  ordinal : function (number) {
    var remainder = number % 100;
    return (number !== 0 && remainder <= 1 || remainder === 8 || remainder >= 20) ? 'ste' : 'de';
  },
  currency: {
    symbol: '€ '
  }
});

Numeral.language('nl');

export function formatMoney(amount) {
  return Numeral(amount).format('$0,0.00');
}