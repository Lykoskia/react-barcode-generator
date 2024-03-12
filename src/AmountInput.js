import React from 'react';
import { NumericFormat } from 'react-number-format';

export default function AmountInput({ handleValueChange, visited, errors, handleBlur }) {
  
  const onValueChange = (values) => {
    const { formattedValue, value } = values;
    const numericValue = value ? parseFloat(value) : 0;

    handleValueChange('amount', numericValue, formattedValue);
  };

  const croatianNumberFormatter = (value) => {
    const numericValue = parseFloat(value.replace(/\./g, '').replace(',', '.'));
    if (isNaN(numericValue)) return "";

    return numericValue
      .toFixed(2)
      .replace('.', ',')
      .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  return (
    <NumericFormat
      thousandSeparator="."
      decimalSeparator=","
      isNumericString
      onValueChange={onValueChange}
      format={croatianNumberFormatter}
      onBlur={() => handleBlur('amount')}
      className={visited['amount'] ? (errors.amount === '' ? 'valid' : 'invalid') : 'unvisited'}
      placeholder="max 999.999,99"
      maxLength={10}
    />
  );
}
