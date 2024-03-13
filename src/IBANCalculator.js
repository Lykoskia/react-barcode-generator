import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import {
    validateIBAN,
    generateIBAN,
    croatianBanks,
    serviceIBANMapping
} from './Data';
import './incl/css/master.css';

export default function IBANCalculator({ handleIBANChange, generateModalIsOpen, setGenerateModalIsOpen, selectModalIsOpen, setSelectModalIsOpen, showToast, dismissToast, darkMode }) {

    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [selectedBank, setSelectedBank] = useState('');
    const [bankCode, setBankCode] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [isAccountNumberValid, setIsAccountNumberValid] = useState(true);
    const [selectedService, setSelectedService] = useState('');
    const [selectedIBAN, setSelectedIBAN] = useState('');

    /* LISTEN FOR RESIZE FOR MODAL DIMENSIONS */

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    /*
    ************************************************************************************************** 
    FIRST MODAL (GET BANK CODE FROM BANK NAME AND GENERATE IBAN BASED ON BANK CODE AND ACCOUNT NUMBER) 
    **************************************************************************************************
    */

    /* EMPTY BANK CODE VALUE IF NAME FIELD DOESN'T MATCH A VALID CODE */

    useEffect(() => {
        if (selectedBank) {
            const bank = croatianBanks.find(b => b.name === selectedBank);
            setBankCode(bank ? bank.code : '');
        }
    }, [selectedBank]);

    /* IBAN GENERATOR RESET BUTTON */

    const handleReset = () => {
        setSelectedBank('');
        setBankCode('');
        setAccountNumber('');
    };

    /* BANK NAME INPUT */

    const handleBankNameChange = (e) => {
        const input = e.target.value;
        setSelectedBank(input);
    };

    /* GENERATE IBAN BUTTON */

    const handleGenerateIBAN = () => {
        const generatedIBAN = generateIBAN(bankCode, accountNumber);
        if (validateIBAN(generatedIBAN)) {
            handleIBANChange(generatedIBAN);
            showToast(`IBAN: ${generatedIBAN} `, 'darkgreen');
            setGenerateModalIsOpen(false);
        } else {
            showToast('Generirani IBAN je neispravan, provjerite podatke! ', 'darkred');
        }
    };

    /* INPUT VALIDATION FOR ACCOUNT NUMBER FIELD */

    const handleKeyDown = (event) => {
        const pressedKey = event.key;
        if (
            ['Tab', 'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'F5'].includes(event.key) ||
            (event.ctrlKey && (pressedKey === 'c' || pressedKey === 'v' || pressedKey === 'a'
                || pressedKey === 'C' || pressedKey === 'V' || pressedKey === 'A'))
        ) {
            return;
        }
        if ((event.keyCode >= 48 && event.keyCode <= 57) || (event.keyCode >= 96 && event.keyCode <= 105)) {
            return;
        }
        event.preventDefault();
    };

    /* ACCOUNTNUMBER CONTROL DIGIT VALIDATION ALGORITHM AND EFFECT */

    const isControlDigitValid = (accountNumber) => {
        if (accountNumber.length !== 10) return false;

        const reducer = (intermediateRemainder, digit) => {
            digit = parseInt(digit);

            intermediateRemainder += digit;
            intermediateRemainder = intermediateRemainder % 10 || 10;

            intermediateRemainder *= 2;
            intermediateRemainder = intermediateRemainder % 11;

            return intermediateRemainder;
        };

        const intermediateRemainder = Array.from(accountNumber.slice(0, 9)).reduce(reducer, 10);
        let controlDigit = 11 - intermediateRemainder;
        if (controlDigit === 10) controlDigit = 0;

        return controlDigit === parseInt(accountNumber[9]);
    };

    useEffect(() => {
        if (accountNumber.length === 10 && !isControlDigitValid(accountNumber)) {
            showToast('Neispravan broj računa! ', 'darkred');
        }
    }, [accountNumber]);

    /* ACCOUNT NUMBER INPUT (AND VALIDATION IF FILLED) */

    const handleAccountNumberChange = (e) => {
        const accNum = e.target.value;
        setAccountNumber(accNum);
        if (accNum.length === 10) {
            setIsAccountNumberValid(isControlDigitValid(accNum));
        }
    }

    /* CHECK IF THE RETURNED BANK CODE CONTAINS 7 DIGITS AND THE ACCOUNT NUMBER IS VALID */

    const isInputValid = bankCode.length === 7 && isControlDigitValid(accountNumber);

    /* PREVENT PASTING BAD DATA INTO ACCOUNT NUMBER FIELD */

    const handlePaste = (event) => {
        event.preventDefault();
        const currentValue = accountNumber || "";
        const clipboardData = event.clipboardData.getData('Text');
        const selectionStart = event.target.selectionStart;
        const selectionEnd = event.target.selectionEnd;
        const newValue = currentValue.slice(0, selectionStart) + clipboardData + currentValue.slice(selectionEnd);

        if (newValue.length <= 10 && /^[\d]*$/.test(newValue)) {
            setAccountNumber(newValue);
            if (newValue.length === 10) {
                setIsAccountNumberValid(isControlDigitValid(newValue));
            }
        } else {
            showToast('Neispravan broj računa! ', 'darkred');
        }
    };

    /*
    ********************************************************************************************** 
    SECOND MODAL (RETRIEVE AN IBAN BY SELECTING A KNOWN SERVICE WITH AN ASSIGNED IBAN FROM A LIST) 
    **********************************************************************************************
    */

    /* EMPTY IBAN VALUE IF SERVICE FIELD DOESN'T MATCH A VALID SERVICE */

    useEffect(() => {
        if (selectedIBAN) {
            const currentServiceIBAN = serviceIBANMapping.find(e => e.service === selectedService)?.IBAN;
            if (currentServiceIBAN !== selectedIBAN) {
                setSelectedIBAN('');
            }
        }
    }, [selectedService, selectedIBAN]);

    /* IBAN LOOKUP BASED ON SELECTED SERVICE */

    const getIBANForService = (serviceName) => {
        const serviceObj = serviceIBANMapping.find(obj => obj.service === serviceName);
        return serviceObj ? serviceObj.IBAN : '';
    };

    /* AFTER SELECTING A SERVICE, CONTNUE BUTTON */

    const handleProceedClick = () => {
        handleIBANChange(selectedIBAN);
        showToast(`IBAN: ${selectedIBAN} `, 'darkgreen');
        setSelectModalIsOpen(false);
    };

    /* INPUT HANDLER FOR THE FILTER OF THE SELECTION MODAL */

    const handleServiceInputChange = (e) => {
        const service = e.target.value;
        setSelectedService(service);

        const correspondingIBAN = getIBANForService(service);
        setSelectedIBAN(correspondingIBAN || '');
    };

    /* RESET BUTTON IN THE SELECTION MODAL */

    const handleClearClick = () => {
        setSelectedService('');
        setSelectedIBAN('');
    };

    /* ASSIGN IBAN BASED ON SELECTED SERVICE */

    useEffect(() => {
        if (selectedService) {
            const correspondingIBAN = getIBANForService(selectedService);
            if (correspondingIBAN) {
                setSelectedIBAN(correspondingIBAN);
            }
        }
    }, [selectedService]);

    /* VALIDATION FOR CONTINUING AFTER SELECTING A SERVICE */

    const isIBANSelected = (iban) => {
        return serviceIBANMapping.some(obj => obj.IBAN === iban);
    };

    const modalStyles = {
        content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: darkMode ? '#222222' : '#AAAAAA',
            width:
                windowWidth < 600 ? 'calc(100% - 40px)' :
                    windowWidth < 800 ? 'calc(100% - 80px)' :
                        windowWidth < 1000 ? 'calc(100% - 160px)' :
                            windowWidth < 1200 ? 'calc(100% - 240px)' :
                                windowWidth < 1400 ? 'calc(100% - 300px)' :
                                    '60%',
            height: '60vh'
        }
    };

    return (
        <React.Fragment>
            <p style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', marginTop: '0px', marginBottom: '20px' }}>Generirajte ili odaberite IBAN:</p>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px' }}>
                <button type="button" onClick={() => setGenerateModalIsOpen(true)}>
                    Generirajte
                </button>
                <button type="button" onClick={() => setSelectModalIsOpen(true)} style={{ marginLeft: '20px' }}>
                    Odaberite
                </button>
            </div>
            <Modal
                isOpen={generateModalIsOpen}
                onRequestClose={() => setGenerateModalIsOpen(false)}
                style={modalStyles}
            >
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <strong>Generirajte IBAN putem BIC-a i BBAN-a</strong>
                </div>
                <button
                    type="button"
                    onClick={() => setGenerateModalIsOpen(false)}
                    style={{ position: 'absolute', top: '10px', right: '10px', padding: '4px 8px' }}
                >
                    X
                </button>
                <div style={{ paddingTop: '30px', paddingLeft: '30px', paddingRight: '30px' }}>
                    <label htmlFor="bankNameInput" style={{ display: 'block', marginBottom: '5px' }}>Naziv banke</label>
                    <div style={{ display: 'flex', marginBottom: '20px' }}>
                        <input
                            id="bankNameInput"
                            list="bankNames"
                            value={selectedBank}
                            onChange={handleBankNameChange}
                            placeholder="Pretražite po nazivu banke"
                            style={{ flex: 1, marginRight: '10px' }}
                        />
                        <datalist id="bankNames">
                            {croatianBanks.map(bank => (
                                <option key={bank.code} value={bank.name} />
                            ))}
                        </datalist>
                        <input
                            type="text"
                            value={bankCode}
                            placeholder="VBDI banke će se ovdje prikazati"
                            readOnly
                            style={{ flex: 1, backgroundColor: darkMode ? (bankCode ? '#333333' : 'black') : (bankCode ? '#dadada' : '#bababa') }}
                        />
                    </div>
                    <label htmlFor="accountNumberInput" style={{ display: 'block', marginBottom: '5px' }}>Broj računa</label>
                    <input
                        id="accountNumberInput"
                        type="text"
                        value={accountNumber}
                        onKeyDown={handleKeyDown}
                        onChange={handleAccountNumberChange}
                        onPaste={handlePaste}
                        maxLength={10}
                        placeholder="Upišite broj računa"
                        style={{ width: '100%', borderColor: isAccountNumberValid ? '' : 'red', marginBottom: '20px' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <button
                            disabled={!isInputValid}
                            onClick={handleGenerateIBAN}
                            style={{
                                marginRight: '10px',
                                opacity: isInputValid ? 1 : 0.5,
                                cursor: isInputValid ? 'pointer' : 'not-allowed'
                            }}
                        >
                            {isInputValid ? 'Generirajte' : 'Fale podaci'}
                        </button>
                        <button onClick={handleReset} style={{ marginLeft: '10px' }}>Resetirajte</button>
                    </div>
                </div>
            </Modal>
            <Modal
                isOpen={selectModalIsOpen}
                onRequestClose={() => setSelectModalIsOpen(false)}
                style={modalStyles}
            >
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <strong>Odaberite uslugu</strong>
                </div>
                <button
                    type="button"
                    onClick={() => setSelectModalIsOpen(false)}
                    style={{ position: 'absolute', top: '10px', right: '10px', padding: '4px 8px' }}
                >
                    X
                </button>
                <div style={{ paddingTop: '30px', paddingLeft: '30px', paddingRight: '30px' }}>
                    <label htmlFor="serviceSelectionInput" style={{ display: 'block', marginBottom: '5px' }}>Pretražite usluge</label>
                    <div style={{ display: 'flex', marginBottom: '20px' }}>
                        <input
                            id="serviceSelectionInput"
                            list="services"
                            type="text"
                            value={selectedService}
                            onChange={handleServiceInputChange}
                            placeholder="Pretražite usluge"
                            style={{ flex: 1, marginRight: '10px' }}
                        />
                        <datalist id="services">
                            {serviceIBANMapping
                                .slice()
                                .sort((a, b) => a.service.localeCompare(b.service))
                                .map(serviceObj => (
                                    <option key={serviceObj.service} value={serviceObj.service} />
                                ))}
                        </datalist>
                        <input
                            type="text"
                            value={selectedIBAN}
                            readOnly
                            placeholder="Odabrani IBAN će se ovdje prikazati"
                            style={{ flex: 1, backgroundColor: darkMode ? (isIBANSelected(selectedIBAN) ? '#333333' : 'black') : (isIBANSelected(selectedIBAN) ? '#dadada' : '#bababa') }}
                        />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <button
                            disabled={!isIBANSelected(selectedIBAN)}
                            onClick={handleProceedClick}
                            style={{
                                marginRight: '10px',
                                opacity: isIBANSelected(selectedIBAN) ? 1 : 0.5,
                                cursor: isIBANSelected(selectedIBAN) ? 'pointer' : 'not-allowed'
                            }}
                        >
                            {isIBANSelected(selectedIBAN) ? 'Odaberite' : 'Fale podaci'}
                        </button>
                        <button onClick={handleClearClick} style={{ marginLeft: '10px' }}>Resetirajte</button>
                    </div>
                </div>
            </Modal>
        </React.Fragment>
    );
}
