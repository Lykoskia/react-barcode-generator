import { NumericFormat } from 'react-number-format';

export default function AmountInput({ handleValueChange, value, visited, errors, handleBlur }) {
    const onValueChange = (values) => {
        const { formattedValue, floatValue } = values;
        if (floatValue !== undefined && (floatValue < 0.01 || floatValue > 999999.99)) {
            return;
        }
        handleValueChange('amount', formattedValue);
    };

    return (
        <NumericFormat
            thousandSeparator="."
            decimalSeparator=","
            isNumericString
            decimalScale={2}
            fixedDecimalScale
            value={value}
            onValueChange={onValueChange}
            onBlur={() => handleBlur('amount')}
            className={visited['amount'] ? (errors.amount === '' ? 'valid' : 'invalid') : 'unvisited'}
            placeholder="max 999.999,99"
            maxLength={10}
        />
    );
}
