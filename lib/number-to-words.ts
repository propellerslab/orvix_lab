// lib/number-to-words.ts

const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function convertLessThanOneThousand(n: number): string {
  let result = '';

  if (n >= 100) {
    result += ones[Math.floor(n / 100)] + ' Hundred ';
    n %= 100;
  }

  if (n >= 10 && n <= 19) {
    result += teens[n - 10] + ' ';
  } else if (n >= 20) {
    result += tens[Math.floor(n / 10)] + ' ';
    n %= 10;
  }

  if (n > 0 && n < 10) {
    result += ones[n] + ' ';
  }

  return result.trim();
}

/**
 * Converts a numeric amount to formal words in South Asian numbering (Lakhs & Crores / Thousands)
 */
export function numberToNepaliRupeesWords(amount: number): string {
  if (isNaN(amount) || amount === 0) return 'Zero Rupees Only';

  const parts = amount.toFixed(2).split('.');
  let num = parseInt(parts[0], 10);
  const paisa = parseInt(parts[1], 10);

  let words = '';

  // Crores (1,00,00,000)
  if (num >= 10000000) {
    const crore = Math.floor(num / 10000000);
    words += convertLessThanOneThousand(crore) + ' Crore ';
    num %= 10000000;
  }

  // Lakhs (1,00,000)
  if (num >= 100000) {
    const lakh = Math.floor(num / 100000);
    words += convertLessThanOneThousand(lakh) + ' Lakh ';
    num %= 100000;
  }

  // Thousands (1,000)
  if (num >= 1000) {
    const thousand = Math.floor(num / 1000);
    words += convertLessThanOneThousand(thousand) + ' Thousand ';
    num %= 1000;
  }

  // Hundreds & units
  if (num > 0) {
    words += convertLessThanOneThousand(num) + ' ';
  }

  let finalWords = words.trim() + ' Rupees';

  if (paisa > 0) {
    finalWords += ' and ' + convertLessThanOneThousand(paisa) + ' Paisa';
  }

  return finalWords.trim() + ' Only';
}
