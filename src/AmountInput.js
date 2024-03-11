import React, { useState, useEffect, useRef } from 'react';
import AutoNumeric from 'autonumeric';

export default function AmountInput({ handleInputChange, inputData, visited, errors, handleBlur }) {
    const inputRef = useRef(null);
    const autoNumericInstance = useRef(null);
    const [isUserInteraction, setIsUserInteraction] = useState(false);

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
                setIsUserInteraction(true);
                handleInputChange('amount', autoNumericInstance.current.getNumericString());
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
        if (autoNumericInstance.current && !isUserInteraction) {
            autoNumericInstance.current.set(inputData.amount || 0);
        }
        setIsUserInteraction(false);
    }, [inputData.amount, isUserInteraction]);

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
