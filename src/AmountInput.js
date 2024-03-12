import React from 'react';
import { NumericFormat } from 'react-number-format';

export default function AmountInput({ value, handleValueChange, visited, errors, handleBlur }) {
  
    const onValueChange = (values) => {
        const { formattedValue, floatValue } = values;
        handleValueChange('amount', floatValue, formattedValue);
    };

    return (
        <NumericFormat
            thousandSeparator="."
            decimalSeparator=","
            isNumericString
            fixedDecimalScale={true}
            decimalScale={2}
            value={value} 
            onValueChange={onValueChange}
            onBlur={() => handleBlur('amount')}
            className={visited['amount'] ? (errors.amount === '' ? 'valid' : 'invalid') : 'unvisited'}
            placeholder="max 999.999,99"
            maxLength={10}
        />
    );
}
