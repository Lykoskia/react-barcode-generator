import React, { useEffect, useRef } from 'react';
import AutoNumeric from 'autonumeric';

export default function AmountInput({ handleInputChange, inputData, visited, errors, handleBlur }) {
    const inputRef = useRef(null);
    const autoNumericInstance = useRef(null);

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
            
            const changeHandler = () => {
                const numericString = autoNumericInstance.current.getNumericString();
                console.log(`AmountInput changeHandler called with value: ${numericString}`);
                handleInputChange('amount', numericString);
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
      if (autoNumericInstance.current) {
        console.log(`Setting AutoNumeric value to: ${inputData.amount}`);
        const numericValue = autoNumericInstance.current.getNumericString();
        if (inputData.amount !== numericValue) {
          autoNumericInstance.current.set(inputData.amount || 0);
        }
      }
    }, [inputData.amount]);

    return (
        <input
            ref={inputRef}
            id="payment_amount"
            name="amount"
            className={visited['amount'] ? (errors.amount === '' ? 'valid' : 'invalid') : 'unvisited'}
            onBlur={() => handleBlur('amount')}
            placeholder="max 999.999,99"
            maxLength={10}
        />
    );
}
