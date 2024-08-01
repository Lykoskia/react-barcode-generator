import React, { useState, useEffect, useRef } from 'react';

export default function AmountInput({ value, handleValueChange, visited, errors, handleBlur }) {
    const inputRef = useRef(null);
    const [formattedValue, setFormattedValue] = useState('');

    // Function to parse Croatian formatted numbers to float
    const parseCroatianNumber = (input) => parseFloat(input.replace(/\./g, '').replace(',', '.'));

    // Function to format number to Croatian standard
    const formatCroatianNumber = (number) => isNaN(number) ? number : number.toLocaleString('hr-HR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    useEffect(() => {
        setFormattedValue(formatCroatianNumber(value));
    }, [value]);

    const handleInputChange = (e) => {
        let inputValue = e.target.value;

        // Parse the input value into a number
        let numericValue = parseCroatianNumber(inputValue);

        // Cap the numeric value to 999999.99 if it exceeds this limit
        if (numericValue > 999999.99) {
            numericValue = 999999.99;
        }

        // Set the state with the raw numeric value and the formatted display value
        setFormattedValue(formatCroatianNumber(numericValue));
        handleValueChange(numericValue);
    };

    const handleAmountBlur = () => {
        // Ensure value is not above 999999.99 after user leaves the field
        let numericValue = parseCroatianNumber(formattedValue);

        if (numericValue > 999999.99) {
            numericValue = '';
            setFormattedValue('');
        } else {
            setFormattedValue(formatCroatianNumber(numericValue));
        }
        handleValueChange(numericValue);
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
