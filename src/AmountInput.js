import React, { useRef, useEffect } from 'react';
import AutoNumeric from 'autonumeric';

export default function AmountInput({ visited, errors, value, handleValueChange, handleBlur }) {
    const inputRef = useRef(null);

    useEffect(() => {
        const autoNumericInstance = new AutoNumeric(inputRef.current, {
            currencySymbol: '',
            decimalCharacter: ',',
            digitGroupSeparator: '.',
            decimalPlaces: 2,
            maximumValue: '999999.99',
            minimumValue: '0'
        });

        return () => {
            autoNumericInstance.remove();
        };
    }, []);

    const handleChange = (event) => {
        const newValue = event.target.value;
        handleValueChange(newValue);
    };

    return (
        <input
            ref={inputRef}
            type="text"
            id="payment_amount"
            name="amount"
            className={visited['amount'] ? (errors.amount === '' ? 'valid' : 'invalid') : 'unvisited'}
            value={value}
            onChange={handleChange}
            onBlur={() => handleBlur('amount')}
            placeholder="npr. 123,45"
        />
    );
};
