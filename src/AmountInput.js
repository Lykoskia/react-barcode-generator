import React, { useState, useRef, useEffect } from 'react';
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
        const rawValue = e.target.value.replace(/\./g, '').replace(',', '.'); // Convert to a numerical format
        const newFormattedValue = formatNumeral(rawValue, { delimiter: '.', numeralDecimalMark: ',', numeralDecimalScale: 2 });
        setFormattedValue(newFormattedValue);
        handleValueChange(rawValue); // Store the raw numerical value
    };

    const handleAmountBlur = () => {
        const regex = /^\d{1,3}(\.\d{3})*,\d{2}$/;
        if (!regex.test(formattedValue)) {
            handleValueChange('');
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
