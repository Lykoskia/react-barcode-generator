import React, { useState, useEffect, useRef } from 'react';
import AutoNumeric from 'autonumeric';

export default function AmountInput({ handleInputChange, inputData, visited, errors, handleBlur }) {
    const inputRef = useRef(null);
    const autoNumericInstance = useRef(null);
    const [lastExternalValue, setLastExternalValue] = useState(inputData.amount || 0);

    useEffect(() => {
        if (inputRef.current && !autoNumericInstance.current) {
            autoNumericInstance.current = new AutoNumeric(inputRef.current, {
                decimalCharacter: ',',
                digitGroupSeparator: '.',
                decimalPlaces: 2,
                maximumValue: '999999.99',
                minimumValue: '0',
                modifyValueOnWheel: false,
                unformatOnSubmit: true
            });

            autoNumericInstance.current.set(inputData.amount || 0);

            const changeHandler = () => {
                const newValue = autoNumericInstance.current.getNumericString();
                handleInputChange('amount', newValue);
            };

            inputRef.current.addEventListener('autoNumeric:rawValueModified', changeHandler);

            return () => {
                inputRef.current.removeEventListener('autoNumeric:rawValueModified', changeHandler);
                if (autoNumericInstance.current) {
                    autoNumericInstance.current.remove();
                }
            };
        }
    }, []);

    useEffect(() => {
        const newAmount = inputData.amount || 0;
        if (autoNumericInstance.current && lastExternalValue !== newAmount) {
            autoNumericInstance.current.set(newAmount);
            setLastExternalValue(newAmount);
        }
    }, [inputData.amount, lastExternalValue]);

    return (
        <input
            ref={inputRef}
            id="payment_amount"
            name="amount"
            className={visited['amount'] ? (errors.amount === '' ? 'valid' : 'invalid') : 'unvisited'}
            defaultValue={inputData.amount}
            onKeyPress={(e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handleBlur('amount');
                }
            }}
            placeholder="max 999.999,99"
            maxLength={10}
        />
    );
}
