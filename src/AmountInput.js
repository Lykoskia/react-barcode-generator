import React, { useEffect, useRef } from 'react';
import AutoNumeric from 'autonumeric';

export default function AmountInput({ handleInputChange, inputData, visited, errors, handleBlur }) {

    const inputRef = useRef(null);
    
    useEffect(() => {
        const currentRef = inputRef.current;
        let autoNumericInstance;

        if (currentRef) {
            autoNumericInstance = new AutoNumeric(currentRef, {
                decimalCharacter: ',',
                digitGroupSeparator: '.',
                decimalPlaces: 2,
                maximumValue: '999999.99',
                minimumValue: '0',
                modifyValueOnWheel: false
            });

            const urlParams = new URLSearchParams(window.location.search);
            let amountFromURL = urlParams.get('amount');
    
            if (amountFromURL) {
                let numericAmount = Number(amountFromURL) / 100;
                let formattedAmount = numericAmount.toLocaleString('hr-HR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });
    
                autoNumericInstance.set(formattedAmount);
                handleInputChange('inputData', 'amount', formattedAmount);
    
                setTimeout(() => {
                    if (inputRef && inputRef.current) {
                        inputRef.current.focus();
                        inputRef.current.blur();
                    }
                }, 1000);
            }
        }
    
        return () => {
            if (autoNumericInstance) {
                autoNumericInstance.remove();
            }
        };
    }, []);
    
    return (
        <input
            type="text"
            ref={inputRef}
            id="payment_amount"
            name="amount"
            value={inputData.amount}
            className={visited['amount'] ? (errors.amount === '' ? 'valid' : 'invalid') : 'unvisited'}
            onChange={handleInputChange}
            onBlur={() => handleBlur('amount')}
            placeholder="od 1 do 999.999,99"
            maxLength={8}
        />
    );
}
