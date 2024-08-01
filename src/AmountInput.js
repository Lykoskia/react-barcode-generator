import React, { useState, useEffect, useRef } from 'react';
import { formatNumeral, registerCursorTracker } from 'cleave-zen';

export default function AmountInput({ value, handleValueChange, visited, errors, handleBlur }) {
    const inputRef = useRef(null);
    const [formattedValue, setFormattedValue] = useState('');

    useEffect(() => {
        setFormattedValue(formatNumeral(value, { delimiter: '.', numeralDecimalMark: ',', numeralDecimalScale: 2 }));
    }, [value]);

    useEffect(() => {
        return registerCursorTracker({ input: inputRef.current, delimiter: '.' });
    }, []);

    const handleInputChange = (e) => {
        let rawValue = e.target.value.replace(/\./g, '').replace(',', '.');

        if (parseFloat(rawValue) > 999999.99) {
            rawValue = '999999.99';
        }

        const newFormattedValue = formatNumeral(rawValue, { delimiter: '.', numeralDecimalMark: ',', numeralDecimalScale: 2 });
        setFormattedValue(newFormattedValue);
        handleValueChange(rawValue);
    };

    const handleAmountBlur = () => {
        const formattedForCheck = formatNumeral(formattedValue, { delimiter: '', numeralDecimalMark: '.', numeralDecimalScale: 2 });
        if (parseFloat(formattedForCheck) > 999999.99) {
            handleValueChange('');
            setFormattedValue('');
        } else {
            handleValueChange(formattedForCheck);
        }
        handleBlur('amount');
    };

    return (
        <input
            ref={inputRef}
            type="text"
            value={formattedValue}
            onChange={handleInputChange}
            onBlur={handleAmountBlur}
            className={visited['amount'] ? (errors.amount === '' ? 'valid' : 'invalid') : 'unvisited'}
            placeholder="max 999.999,99"
            maxLength={10}
        />
    );
}
