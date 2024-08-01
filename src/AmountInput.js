import React from 'react';
import { NumericFormat } from 'react-number-format';

export default function AmountInput({ value, handleValueChange, visited, errors, handleBlur }) {
    
    const onValueChange = (values) => {
        const { formattedValue, value } = values;
        handleValueChange(value);
    };

    return (
        <NumericFormat
            thousandSeparator="."
            decimalSeparator=","
            valueIsNumericString={true}
            fixedDecimalScale={true}
            decimalScale={2}
            value={value}
            onValueChange={(values) => {
                const { formattedValue } = values;
                if (/^\d{0,3}(\.\d{3})*,\d{2}$/.test(formattedValue) || formattedValue === "") {
                    handleValueChange(formattedValue);
                }
            }}
            onBlur={() => handleBlur('amount')}
            className={visited['amount'] ? (errors.amount === '' ? 'valid' : 'invalid') : 'unvisited'}
            placeholder="max 999.999,99"
            maxLength={10}
        />
    );
}
