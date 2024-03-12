import React, { useState, useEffect, useRef } from 'react';
import { useCookies } from 'react-cookie';
import { useLocation } from 'react-router-dom';
import PlaceLookup from './PlaceLookup';
import AmountInput from './AmountInput';
import IBANCalculator from './IBANCalculator';
import './incl/css/normalize.css';
import './incl/css/master.css';
import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import {
    purposeValues,
    placeValues,
    ibanPattern,
    modelPattern,
    validateIBAN
} from './Data';
import bwipjs from 'bwip-js';
import { SiGithub } from 'react-icons/si';

export default function App() {

    const [barcodeURL, setBarcodeURL] = useState('');
    const [visited, setVisited] = useState(false);
    const [cookies, setCookie, removeCookie] = useCookies(['formData', 'cookieConsent']);
    const [showCookieConsent, setShowCookieConsent] = useState(false);
    const [isFormSubmitted, setIsFormSubmitted] = useState(false);
    const [countdown, setCountdown] = useState(59);
    const [errorMessages, setErrorMessages] = useState(false);
    const [savedReceivers, setSavedReceivers] = useState([]);
    const [selectedReceiver, setSelectedReceiver] = useState('');
    const [generateModalIsOpen, setGenerateModalIsOpen] = useState(false);
    const [selectModalIsOpen, setSelectModalIsOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(true);
    const [importedSender, setImportedSender] = useState(false);
    const [importedReceiver, setImportedReceiver] = useState(false);
    const [toasts, setToasts] = useState([]);
    const [lastValidIBAN, setLastValidIBAN] = useState('');
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    const canvasRef = useRef(null);

    /* DARK MODE TOGGLER */

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
        document.body.classList.toggle('dark', !darkMode);
        document.body.classList.toggle('light', darkMode);
    };

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    /* SUBMIT COOLDOWN */

    useEffect(() => {
        let intervalId;
        if (isFormSubmitted) {
            intervalId = setInterval(() => {
                setCountdown(prevCountdown => prevCountdown - 1);
            }, 1000);
        }
        return () => {
            clearInterval(intervalId);
        };
    }, [isFormSubmitted]);

    useEffect(() => {
        if (countdown === 0) {
            setIsFormSubmitted(false);
        }
    }, [countdown]);

    const [inputData, setInputData] = useState(
        {
            amount: '',
            currency: 'EUR',
            sender: {
                name: '',
                street: '',
                postcode: '',
                city: '',
                place: '',
            },
            receiver: {
                name: '',
                street: '',
                postcode: '',
                city: '',
                place: '',
                model: '00',
                iban: 'HR',
                reference: '',
            },
            purpose: 'OTHR',
            description: ''
        }
    );

    /* FORMAT THE DATA ACCORDING TO THE HUB3 SPECIFICATION */

    const formatHUB3Data = (data) => {
        const amountString = data.amount.toString().padStart(15, '0');

        return [
            'HRVHUB30',
            data.currency,
            amountString,
            data.sender.name,
            data.sender.street,
            data.sender.place,
            data.receiver.name,
            data.receiver.street,
            data.receiver.place,
            data.receiver.iban,
            `HR${data.receiver.model}`,
            data.receiver.reference,
            data.purpose,
            data.description,
        ].join('\n');
    };

    /* IF THE BARCODE HASN'T BEEN GENERATED YET, ADJUST THE BACKGROUND TO CHANGES IN DARK MODE */

    const clearCanvas = () => {
        if (canvasRef.current && (!barcodeURL)) {
            const ctx = canvasRef.current.getContext('2d');
            ctx.fillStyle = `${darkMode ? "#222222" : "#e1e1e1"}`;
            ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
    };

    useEffect(() => {
        clearCanvas();
        const canvas = canvasRef.current;
        if (barcodeURL) {
            canvas.style.boxShadow = `${darkMode ? '5px 5px 10px rgba(255, 255, 255, 0.5)' : '5px 5px 10px rgba(0, 0, 0, 0.5)'}`;
        }
    }, [darkMode]);

    const drawBarcode = () => {

        const canvas = canvasRef.current;

        bwipjs.toCanvas(canvas, {
            bcid: 'pdf417',
            text: formatHUB3Data(inputData),
            scale: 1,
            padding: 10,
            width: 0.254,
            ratio: 3,
            cols: 9,
            includetext: true,
            textxalign: 'center',
            eclevel: 4
        });

        canvas.style.boxShadow = `${darkMode ? '5px 5px 10px rgba(255, 255, 255, 0.5)' : '5px 5px 10px rgba(0, 0, 0, 0.5)'}`;

        const barcodeDataURL = canvas.toDataURL("image/jpg");
        setBarcodeURL(barcodeDataURL);
    };

    /* SUBMISSION LOGIC */

    const handleSubmit = (e) => {
        e.preventDefault();
        const allFieldsVisited = Object.keys(visited).reduce((acc, fieldName) => {
            acc[fieldName] = true;
            return acc;
        }, {});
        setVisited(allFieldsVisited); // VISIT EVERYTHING TO FORCE ALL VALIDATIONS
        const validateAllFields = (data, prefix = '') => {
            Object.keys(data).forEach(field => {
                const fullPath = prefix ? `${prefix}.${field}` : field;
                handleBlur(fullPath);
                if (typeof data[field] === 'object') {
                    validateAllFields(data[field], fullPath);
                }
            });
        };
        validateAllFields(inputData); // VALIDATE EVERYTHING BEFORE SUBMISSION
        setIsFormSubmitted(true);
        setCountdown(59);
        const serializedFormData = JSON.stringify({
            sender: {
                name: inputData.sender.name,
                street: inputData.sender.street,
                postcode: inputData.sender.postcode,
                city: inputData.sender.city,
                place: inputData.sender.place
            }
        });
        const encodedFormData = encodeURIComponent(serializedFormData);
        if (cookies.cookieConsent === 'true' || cookies.cookieConsent === true) {
            setCookie('formData', encodedFormData, { path: '/', maxAge: 365 * 24 * 60 * 60 }); // SET COOKIES IF CONSENT IS GIVEN
            setShowCookieConsent(false);
        }

        if (validateForm()) {
            drawBarcode();
            setErrorMessages(false);
        } else {
            setErrorMessages(true);
        }
    }

    /* VALIDATE IMPORTED SENDER DATA FROM SAVED COOKIE, IF SET */

    useEffect(() => {
        if (importedSender && inputData && (!prevInputData || !_.isEqual(inputData.sender, prevInputData.sender))) {

            setVisited(prevVisited => ({
                ...prevVisited,
                'sender.name': true,
                'sender.street': true,
                'sender.postcode': true,
                'sender.city': true,
            }));

            validateForm();

        }
        setPrevInputData(inputData);
        setImportedSender(false);
    }, [inputData.sender, importedSender]);

    /* VALIDATE IMPORTED RECEIVER DATA FROM SAVED RECEIVERS IN LOCAL STORAGE, IF SET */

    useEffect(() => {
        if (importedReceiver && inputData && (!prevInputData || !_.isEqual(inputData.receiver, prevInputData.receiver))) {

            setVisited(prevVisited => ({
                ...prevVisited,
                'receiver.name': true,
                'receiver.street': true,
                'receiver.postcode': true,
                'receiver.city': true,
                'receiver.iban': true,
                'receiver.model': true,
            }));

            validateForm();
        }
        setPrevInputData(inputData);
        setImportedReceiver(false);
    }, [inputData.receiver, importedReceiver]);

    /* VALIDATE IBAN CORRECTLY AFTER RECEIVING STATE FROM THE CALCULATION MODALS */

    useEffect(() => {
        if (inputData && inputData.receiver && inputData.receiver.iban && inputData.receiver.iban !== 'HR') {
            setVisited(prevVisited => ({
                ...prevVisited,
                'receiver.iban': true,
            }));

            validateForm();
        }
    }, [inputData.receiver?.iban]);

    const [prevInputData, setPrevInputData] = useState(null);

    /* FILL IN SENDER DATA IF COOKIE CONSENT IS GIVEN AND IF THERE ARE NO SENDER SEARCH PARAMS */

    const location = useLocation();
    
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        let hasSenderUrlParams = false;
    
        const senderParams = ["sender.name", "sender.street", "sender.postcode", "sender.city"];
    
        for (let param of senderParams) {
            if (searchParams.has(param)) {
                hasSenderUrlParams = true;
                break;
            }
        }
    
        if (!hasSenderUrlParams) {
            const boolCookieConsent = (cookies.cookieConsent === 'true');
            if (boolCookieConsent && cookies.formData) {
                try {
                    const decodedFormData = decodeURIComponent(cookies.formData);
                    const parsedFormData = JSON.parse(decodedFormData);
                    if (parsedFormData && parsedFormData.sender) {
                        setInputData(prevInputData => {
                            const isNewData = JSON.stringify(prevInputData.sender) !== JSON.stringify(parsedFormData.sender);
                            if (isNewData) {
                                return {
                                    ...prevInputData,
                                    sender: {
                                        name: parsedFormData.sender.name,
                                        street: parsedFormData.sender.street,
                                        postcode: parsedFormData.sender.postcode,
                                        city: parsedFormData.sender.city,
                                        place: parsedFormData.sender.place
                                    }
                                };
                            }
                            return prevInputData;
                        });
                        setImportedSender(true);
                    }
                } catch (error) {
                    console.error('Error parsing formData:', error);
                }
            } else if (cookies.cookieConsent === 'false') {
                removeCookie('formData');
            } else {
                setShowCookieConsent(true);
            }
        }
    }, [cookies.formData, cookies.cookieConsent, location.search]);

    const handleAcceptCookies = () => {
        setCookie('cookieConsent', true, { path: '/', maxAge: 365 * 24 * 60 * 60 });
        setShowCookieConsent(false);
    };

    const handleRejectCookies = () => {
        setCookie('cookieConsent', false, { path: '/', maxAge: 365 * 24 * 60 * 60 });
        removeCookie('formData');
        setShowCookieConsent(false);
    };

    const [errors, setErrors] = useState(
        {
            amount: '',
            currency: '',
            sender: {
                name: '',
                street: '',
                postcode: '',
                city: '',
                place: ''
            },
            receiver: {
                name: '',
                street: '',
                postcode: '',
                city: '',
                place: '',
                model: '',
                iban: '',
                reference: '',
            },
            purpose: '',
            description: ''
        }
    );

    const updatedErrors = {

        amount: '',
        currency: '',
        sender: {
            name: '',
            street: '',
            postcode: '',
            city: '',
            place: ''
        },
        receiver: {
            name: '',
            street: '',
            postcode: '',
            city: '',
            place: '',
            model: '',
            iban: '',
            reference: '',
        },
        purpose: '',
        description: ''
    };

    /* VALIDATION LOGIC */

    const validateForm = () => {
        if (inputData.amount.toString() === '' || isNaN(parseFloat(inputData.amount.replace(/\./g, '').replace(',', '.')))) {
            updatedErrors.amount += 'Unesite ispravan iznos.\n';
        } else {
            if (parseFloat(inputData.amount.replace(/\./g, '').replace(',', '.')) <= 0) {
                updatedErrors.amount += 'Iznos mora biti veći od 0.\n'
            }
        }
        if (inputData.currency.trim() !== 'EUR') {
            updatedErrors.currency += 'Valuta mora biti EUR.\n'
        }
        if (inputData.sender.name.trim().length === 0) {
            updatedErrors.sender.name += 'Unesite ime platitelja.\n'
        }
        if (inputData.sender.name.trim().length > 30) {
            updatedErrors.sender.name += 'Ime platitelja mora biti do 30 znakova.\n'
        }
        if (inputData.sender.street.trim().length === 0) {
            updatedErrors.sender.street += 'Unesite adresu platitelja.\n'
        }
        if (inputData.sender.street.trim().length > 27) {
            updatedErrors.sender.street += 'Ulica i kućni broj platitelja mora biti do 27 znakova.\n'
        }
        if (inputData.sender.postcode.trim().length === 0) {
            updatedErrors.sender.postcode += 'Poštanski broj platitelja je obavezan.\n'
        }
        if (inputData.sender.city.trim().length === 0) {
            updatedErrors.sender.city += 'Grad platitelja je obavezan.\n'
        }
        if (inputData.sender.city.trim().length > 21) {
            updatedErrors.sender.city += 'Grad platitelja mora biti do 21 znak.\n'
        }
        if (inputData.receiver.name.trim().length === 0) {
            updatedErrors.receiver.name += 'Unesite ime primatelja.\n'
        }
        if (inputData.receiver.name.trim().length > 25) {
            updatedErrors.receiver.name += 'Ime primatelja mora biti do 25 znakova.\n'
        }
        if (inputData.receiver.street.trim().length === 0) {
            updatedErrors.receiver.street += 'Unesite adresu primatelja.\n'
        }
        if (inputData.receiver.street.trim().length > 25) {
            updatedErrors.receiver.street += 'Ulica i kućni broj primatelja mora biti do 25 znakova.\n'
        }
        if (inputData.receiver.postcode.trim().length === 0) {
            updatedErrors.receiver.postcode += 'Poštanski broj primatelja je obavezan.\n'
        }
        if (inputData.receiver.city.trim().length === 0) {
            updatedErrors.receiver.city += 'Grad primatelja je obavezan.\n'
        }
        if (inputData.receiver.city.trim().length > 21) {
            updatedErrors.receiver.city += 'Grad primatelja mora biti do 21 znak.\n'
        }
        if (inputData.receiver.iban.trim().length === 0) {
            updatedErrors.receiver.iban += 'Unesite IBAN primatelja.\n'
        }
        if (inputData.receiver.iban.trim().length !== 21) {
            updatedErrors.receiver.iban += 'IBAN primatelja mora biti 21 znak.\n'
        }
        if (!ibanPattern.test(inputData.receiver.iban.trim())) {
            updatedErrors.receiver.iban += 'IBAN primatelja mora biti u obliku: HR+19 znamenki.\n'
        }
        if (!validateIBAN(inputData.receiver.iban.trim())) {
            updatedErrors.receiver.iban += 'Upisani IBAN nije ispravan, provjerite podatke sa bankom.\n'
        }
        if (inputData.receiver.model.trim().length < 2 || inputData.receiver.model.trim().length > 2) {
            updatedErrors.receiver.model += 'Model plaćanja mora biti dvoznamenkasti broj.\n'
        }
        if (!modelPattern.test(inputData.receiver.model.trim())) {
            updatedErrors.receiver.model += 'Dozvoljeni modeli: 00-19, 23-24, 26-31, 33-35, 40-43, 55, 62-65, 67-69 ili 99.\n'
        }
        if ((inputData.receiver.reference.trim().length === 0) && (inputData.receiver.model.trim() !== '99')) {
            updatedErrors.receiver.reference += 'Poziv na broj primatelja je obavezan za sve modele osim HR99.\n'
        }
        if (inputData.receiver.reference.trim().length > 22) {
            updatedErrors.receiver.reference += 'Poziv na broj primatelja mora biti do 22 znaka.\n'
        }
        const referenceValue = inputData.receiver.reference.trim();
        const hyphenPositions = [...referenceValue.matchAll(/-/g)].map(match => match.index);
        const consecutiveDigits = referenceValue.match(/\d{13,}/g);

        if (referenceValue.length > 0) {
            if (!/^[0-9-]+$/.test(referenceValue)) {
                updatedErrors.receiver.reference += 'Poziv na broj primatelja može sadržavati samo brojeve i crtice.\n';
            }

            if (referenceValue.startsWith('-') || referenceValue.endsWith('-')) {
                updatedErrors.receiver.reference += 'Poziv na broj primatelja ne smije počinjati ili završavati crticom.\n';
            }

            if (hyphenPositions.some((pos, index) => index > 0 && pos === hyphenPositions[index - 1] + 1)) {
                updatedErrors.receiver.reference += 'Poziv na broj primatelja ne smije sadržavati uzastopne crtice.\n';
            }

            if (consecutiveDigits && consecutiveDigits.some(digits => digits.length > 12)) {
                updatedErrors.receiver.reference += 'Poziv na broj primatelja ne smije sadržavati više od 12 uzastopnih znamenaka između crtica.\n';
            }
        }
        if (!purposeValues.includes(inputData.purpose.trim())) {
            updatedErrors.purpose += 'Odaberite validnu namjenu transakcije.\n'
        }
        if (inputData.description.trim().length === 0) {
            updatedErrors.description += 'Unesite opis plaćanja.\n'
        }
        if (inputData.description.trim().length > 35) {
            updatedErrors.description += 'Opis plaćanja mora biti do 35 znakova.\n'
        }
        const hasErrors = Object.values(updatedErrors).some(error => {
            if (typeof error === 'object') {
                return Object.values(error).some(nestedError => nestedError.trim() !== '');
            }
            return error.trim() !== '';
        });
        setErrors(updatedErrors);
        return !hasErrors;
    };

    /* DISPLAY EACH ERROR ONLY ONCE */

    const uniqueErrors = {};
    for (const field in errors) {
        if (typeof errors[field] === 'string') {
            uniqueErrors[field] = Array.from(new Set(errors[field].split('\n'))).join('\n');
        } else if (typeof errors[field] === 'object') {
            uniqueErrors[field] = {};
            for (const key in errors[field]) {
                uniqueErrors[field][key] = Array.from(new Set(errors[field][key].split('\n'))).join('\n');
            }
        }
    }

    /* JSX FOR RENDERING ERRORS */

    const errorParagraphs = (
        <div className="errorContainer">
            {Object.entries(uniqueErrors).map(([field, value]) => {
                if (typeof value === 'string' && value.trim() !== '') {
                    const errorLines = value.split('\n').filter(line => line.trim() !== '');
                    if (errorLines.length > 0) {
                        return (
                            <div className="errorField" key={field}>
                                {errorLines.map((line, index) => (
                                    <React.Fragment key={index}>
                                        &rarr; {line}
                                        <br />
                                    </React.Fragment>
                                ))}
                            </div>
                        );
                    }
                } else if (typeof value === 'object' && value !== null) {
                    const nestedErrorFields = Object.entries(value).map(([nestedField, nestedValue]) => {
                        const nestedErrorLines = nestedValue.split('\n').filter(line => line.trim() !== '');
                        if (nestedErrorLines.length > 0) {
                            return (
                                <div className="errorField" key={nestedField}>
                                    {nestedErrorLines.map((line, index) => (
                                        <React.Fragment key={index}>
                                            &rarr; {line}
                                            <br />
                                        </React.Fragment>
                                    ))}
                                </div>
                            );
                        } else {
                            return null;
                        }
                    });
                    if (nestedErrorFields.some(field => field !== null)) {
                        return (
                            <div className="errorFieldGroup" key={field}>
                                {nestedErrorFields}
                            </div>
                        );
                    }
                }
                return null;
            })}
        </div>
    );

    /* VALIDATEFIELD FOR SHOWING SPECIFIC TOAST MESSAGE ON BLUR */

    const validateField = (fieldName) => {
        let errorMessage = '';

        switch (fieldName) {
            case 'amount':
                if (inputData.amount.toString() === '' || isNaN(parseFloat(inputData.amount.replace(/\./g, '').replace(',', '.')))) {
                    errorMessage = 'Unesite ispravan iznos.\n';
                } else if (parseFloat(inputData.amount.replace(/\./g, '').replace(',', '.')) <= 0) {
                    errorMessage = 'Iznos mora biti veći od 0.\n';
                }
                break;
            case 'currency':
                if (inputData.currency.trim() !== 'EUR') {
                    errorMessage = 'Valuta mora biti EUR.\n';
                }
                break;
            case 'sender.name':
                if (inputData.sender.name.trim().length === 0) errorMessage = 'Unesite ime platitelja.\n';
                else if (inputData.sender.name.trim().length > 30) errorMessage = 'Ime platitelja mora biti do 30 znakova.\n';
                break;
            case 'sender.street':
                if (inputData.sender.street.trim().length === 0) errorMessage = 'Unesite adresu platitelja.\n';
                else if (inputData.sender.street.trim().length > 27) errorMessage = 'Ulica i kućni broj platitelja mora biti do 27 znakova.\n';
                break;
            case 'sender.postcode':
                if (inputData.sender.postcode.trim().length === 0) errorMessage = 'Poštanski broj platitelja je obavezan.\n';
                break;
            case 'sender.city':
                if (inputData.sender.city.trim().length === 0) errorMessage = 'Grad platitelja je obavezan.\n';
                else if (inputData.sender.city.trim().length > 21) errorMessage = 'Grad platitelja mora biti do 21 znak.\n';
                break;
            case 'receiver.name':
                if (inputData.receiver.name.trim().length === 0) errorMessage = 'Unesite ime primatelja.\n';
                else if (inputData.receiver.name.trim().length > 25) errorMessage = 'Ime primatelja mora biti do 25 znakova.\n';
                break;
            case 'receiver.street':
                if (inputData.receiver.street.trim().length === 0) errorMessage = 'Unesite adresu primatelja.\n';
                else if (inputData.receiver.street.trim().length > 25) errorMessage = 'Ulica i kućni broj primatelja mora biti do 25 znakova.\n';
                break;
            case 'receiver.postcode':
                if (inputData.receiver.postcode.trim().length === 0) errorMessage = 'Poštanski broj primatelja je obavezan.\n';
                break;
            case 'receiver.city':
                if (inputData.receiver.city.trim().length === 0) errorMessage = 'Grad primatelja je obavezan.\n';
                else if (inputData.receiver.city.trim().length > 21) errorMessage = 'Grad primatelja mora biti do 21 znak.\n';
                break;
            case 'receiver.iban':
                if (inputData.receiver.iban.trim().length === 0) errorMessage = 'Unesite IBAN primatelja.\n';
                else if (inputData.receiver.iban.trim().length !== 21) errorMessage = 'IBAN primatelja mora biti 21 znak.\n';
                else if (!ibanPattern.test(inputData.receiver.iban.trim())) errorMessage = 'IBAN primatelja mora biti u obliku: HR+19 znamenki.\n';
                else if (!validateIBAN(inputData.receiver.iban.trim())) errorMessage = 'Upisani IBAN nije ispravan, provjerite podatke sa bankom.\n';
                break;
            case 'receiver.model':
                if (inputData.receiver.model.trim().length !== 2) errorMessage = 'Model plaćanja mora biti dvoznamenkasti broj.\n';
                else if (!modelPattern.test(inputData.receiver.model.trim())) errorMessage = 'Dozvoljeni modeli: 00-19, 23-24, 26-31, 33-35, 40-43, 55, 62-65, 67-69 ili 99.\n';
                break;
            case 'receiver.reference':
                if ((inputData.receiver.reference.trim().length === 0) && (inputData.receiver.model.trim() !== '99')) {
                    errorMessage = 'Poziv na broj primatelja je obavezan za sve modele osim HR99.\n';
                } else if (inputData.receiver.reference.trim().length > 22) {
                    errorMessage = 'Poziv na broj primatelja mora biti do 22 znaka.\n';
                } else {
                    const referenceValue = inputData.receiver.reference.trim();
                    const hyphenPositions = [...referenceValue.matchAll(/-/g)].map(match => match.index);
                    const consecutiveDigits = referenceValue.match(/\d{13,}/g);

                    if (referenceValue.length > 0) {
                        if (!/^[0-9-]+$/.test(referenceValue)) {
                            errorMessage += 'Poziv na broj primatelja može sadržavati samo brojeve i crtice.\n';
                        }

                        if (referenceValue.startsWith('-') || referenceValue.endsWith('-')) {
                            errorMessage += 'Poziv na broj primatelja ne smije počinjati ili završavati crticom.\n';
                        }

                        if (hyphenPositions.some((pos, index) => index > 0 && pos === hyphenPositions[index - 1] + 1)) {
                            errorMessage += 'Poziv na broj primatelja ne smije sadržavati uzastopne crtice.\n';
                        }

                        if (consecutiveDigits && consecutiveDigits.some(digits => digits.length > 12)) {
                            errorMessage += 'Poziv na broj primatelja ne smije sadržavati više od 12 uzastopnih znamenaka između crtica.\n';
                        }
                    }
                }
                break;
            case 'purpose':
                if (!purposeValues.includes(inputData.purpose.trim())) errorMessage = 'Odaberite validnu namjenu transakcije.\n';
                break;
            case 'description':
                if (inputData.description.trim().length === 0) errorMessage = 'Unesite opis plaćanja.\n';
                else if (inputData.description.trim().length > 35) errorMessage = 'Opis plaćanja mora biti do 35 znakova.\n';
                break;

            default:
                errorMessage = '';
        }

        return errorMessage;
    };

    /* ONCHANGE LOGIC THAT DEALS WITH REGULAR REACT EVENTS AND NESTED OBJECTS */

    const handleInputChange = (arg1, arg2, arg3) => {
        console.log(`handleInputChange called with: section=${arg1}, field=${arg2}, value=${arg3}`);
        let section, field, value;
        if (arg1 && arg1.target) {
            const { name, value: inputValue } = arg1.target; // regular React event
            console.log(`Event change: name=${name}, value=${inputValue}`);
            const nameParts = name.split('.');
            section = nameParts[0];
            field = nameParts[1];
            value = inputValue;
        } else {
            section = arg1;
            field = arg2;
            value = arg3;
            console.log(`Manual change: section=${section}, field=${field}, value=${value}`);
        }

        setInputData((prevInputData) => {
            if (field) {
                const updatedSection = { ...prevInputData[section], [field]: value };

                if (section === 'receiver' && field === 'reference') {
                    let updatedModel;
                    if (value.trim() === '') {
                        updatedModel = '99';
                    } else if (prevInputData.receiver.model !== '99') {
                        updatedModel = prevInputData.receiver.model;
                    } else {
                        updatedModel = '00';
                    }
                    updatedSection.model = updatedModel;
                } else if (section === 'receiver' && field === 'model') {
                    const updatedReference = value === '99' ? '' : prevInputData.receiver.reference;
                    updatedSection.reference = updatedReference;
                }

                if (['sender', 'receiver'].includes(section)) {
                    updatedSection.place = `${updatedSection.postcode} ${updatedSection.city}`;
                }

                return {
                    ...prevInputData,
                    [section]: updatedSection,
                };
            } else {
                return {
                    ...prevInputData,
                    [section]: value,
                };
            }
        });
    };

    /* REACT NUMBER FORMAT FUNCTION FOR HANDLING CHANGES TO THE AMOUNT FIELD IN THE PARENT COMPONENT */

    const handleAmountChange = (field, numericValue, formattedValue) => {
        setInputData(prevInputData => {
            const updatedInputData = {
                ...prevInputData,
                [field]: numericValue.toString(),
                formattedAmount: formattedValue
            };
            return updatedInputData;
        });
    };

    /* SET FIELD TO VISITED AFTER LOSING FOCUS
    VALIDATE FIELD UPON LEAVING IT */

    const handleBlur = (field) => {
        setVisited((prevVisited) => ({
            ...prevVisited,
            [field]: true,
        }));
        validateForm();
        const errorMessage = validateField(field);

        if (errorMessage) {
            showToast(errorMessage, 'darkred');
        }
    };

    /* PREVENT ANYTHING THAT DOESN'T BELONG IN AN IBAN TO BE TYPED */

    const handleKeyDownIBAN = (event) => {
        const pressedKey = event.key.toUpperCase();
        const currentValue = event.target.value;
        const cursorPosition = event.target.selectionStart;

        const allowedKeys = ['TAB', 'BACKSPACE', 'DELETE', 'ARROWLEFT', 'ARROWRIGHT', 'F5'];

        if (allowedKeys.includes(pressedKey) || (event.ctrlKey && ['C', 'V', 'A'].includes(pressedKey))) {
            return;
        }
        if (cursorPosition < 2) {
            event.preventDefault();
            if (cursorPosition === 0 && pressedKey === 'H') {
                event.target.value = 'H' + currentValue.slice(1);
                event.target.setSelectionRange(1, 1);
            } else if (cursorPosition === 1 && pressedKey === 'R' && currentValue.charAt(0) === 'H') {
                event.target.value = 'HR' + currentValue.slice(2);
                event.target.setSelectionRange(2, 2);
            }
            return;
        }
        if (cursorPosition >= 2 && currentValue.length < 21) {
            if (!isNaN(pressedKey)) {
                return;
            }
        }
        event.preventDefault();
    };

    /* PREVENT INPUT OF INVALID REFERENCE NUMBERS */

    const handleKeyDownReference = (event) => {
        const pressedKey = event.key;
        const currentValue = event.target.value;
        const cursorPosition = event.target.selectionStart;

        const allowedKeys = ['Tab', 'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'F5'];

        if (allowedKeys.includes(pressedKey) || (event.ctrlKey && ['c', 'v', 'a'].includes(pressedKey.toLowerCase()))) {
            return;
        }

        if (pressedKey === '-') {
            const hyphenCount = currentValue.split('-').length - 1;

            if (cursorPosition === 0 || currentValue[cursorPosition - 1] === '-' || hyphenCount >= 2) {
                event.preventDefault();
                return;
            }
            return;
        }

        if (pressedKey.match(/^\d$/)) {
            // Check if overall length with new digit exceeds 22 characters
            if (currentValue.length >= 22) {
                event.preventDefault();
                return;
            }

            // Split the currentValue into segments separated by hyphens
            const parts = currentValue.split('-');
            let accumulatedLength = 0;
            let segmentIndex = -1;

            // Identify the segment where the cursor is located
            for (let i = 0; i < parts.length; i++) {
                if (cursorPosition <= accumulatedLength + parts[i].length) {
                    segmentIndex = i;
                    break;
                }
                accumulatedLength += parts[i].length + 1; // +1 for the hyphen
            }

            // If a valid segment is found and the digit doesn't result in more than 12 consecutive digits
            if (segmentIndex !== -1) {
                let segment = parts[segmentIndex];
                let beforeCursor = segment.substring(0, cursorPosition - accumulatedLength);
                let afterCursor = segment.substring(cursorPosition - accumulatedLength);
                if ((beforeCursor + pressedKey + afterCursor).match(/^\d{13,}$/)) {
                    event.preventDefault();
                    return;
                }
            }
        } else {
            event.preventDefault();
        }
    };

    /* MANUALLY TYPING IBAN ON VIRTUAL KEYBOARDS (NO KEYDOWN EVENTS) -- MOBILE FIX -- CURRENTLY STILL BUGGED */

    const handleInput = (event) => {
        const currentValue = event.target.value.toUpperCase();
        const regex = /^(H|h)(R|r)?[0-9]{0,19}$/;

        if (regex.test(currentValue)) {
            setInputData({ ...inputData, receiver: { ...inputData.receiver, iban: currentValue } });
            setLastValidIBAN(currentValue);
        } else {
            setInputData({ ...inputData, receiver: { ...inputData.receiver, iban: lastValidIBAN } });
        }
    };

    /* DISABLE RIGHT-CLICK (CONTEXT MENU) */

    const handleContextMenu = (event) => {
        event.preventDefault();
    };

    /* VALIDATE THE RESULT OF PASTING AS A VALID IBAN 
    TAKING INTO ACCOUNT POSSIBLE SELECTIONS */

    const handlePaste = (event) => {
        const pastedContent = event.clipboardData.getData('text/plain');
        const currentValue = event.target.value;
        const selectionStart = event.target.selectionStart;
        const selectionEnd = event.target.selectionEnd;

        const newValue =
            currentValue.substring(0, selectionStart) +
            pastedContent +
            currentValue.substring(selectionEnd);

        if (!ibanPattern.test(newValue) || newValue.length > 21) { // PREVENT IF IT DOESN'T MATCH THE PATTERN OR IS TOO LONG
            event.preventDefault();
        }
    };

    /* DOWNLOAD BARCODE */

    const handleDownload = () => {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvasRef.current.width;
        tempCanvas.height = canvasRef.current.height;
        const ctx = tempCanvas.getContext('2d');

        ctx.globalCompositeOperation = 'copy';

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

        ctx.globalCompositeOperation = 'source-over';

        ctx.drawImage(canvasRef.current, 0, 0);

        const barcodeDataURL = tempCanvas.toDataURL('image/jpeg', 1.0);

        const link = document.createElement('a');
        link.href = barcodeDataURL;
        link.download = 'barcode.jpg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    /* SHARE THE BLOB THROUGH THE WEBSHARE API */

    const handleShare = async () => {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvasRef.current.width;
        tempCanvas.height = canvasRef.current.height;
        const ctx = tempCanvas.getContext('2d');

        ctx.globalCompositeOperation = 'copy';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(canvasRef.current, 0, 0);

        tempCanvas.toBlob(async (blob) => {
            if (blob) {
                try {
                    if (navigator.share) {
                        await navigator.share({
                            files: [new File([blob], 'barcode.jpeg', { type: 'image/jpeg' })],
                        });
                    } else {
                        console.error('Web Share API is not supported on this device.');
                    }
                } catch (error) {
                    console.error('Error sharing the image:', error);
                }
            }
        }, 'image/jpeg');
    };

    /* UPDATE THE LIST OF RECEIVERS */

    const updateSavedReceivers = () => {
        const keys = Object.keys(localStorage);
        const receivers = keys.filter(key => key.startsWith("receiver:"));
        setSavedReceivers(receivers.map(key => key.split(":")[1]));
    };

    useEffect(() => {
        updateSavedReceivers();
    }, []);

    /* FILL IN THE FORM WITH DATA FROM THE SELECTED RECEIVER */

    const handleSelectReceiver = (e) => {
        const selectedReceiver = e.target.value;
        setSelectedReceiver(selectedReceiver);
        const savedReceiverData = localStorage.getItem(`receiver:${selectedReceiver}`);
        if (savedReceiverData) {
            const parsedData = JSON.parse(savedReceiverData);
            parsedData.reference = '';
            setInputData(prevState => ({
                ...prevState,
                receiver: parsedData
            }));
            setImportedReceiver(true);
        }
    };

    /* STORE RECEIVER DATA (EXCEPT REFERENCE) FOR FUTURE REUSE */

    const saveReceiverData = () => {
        if (inputData.receiver.name) {
            const receiverDataToSave = { ...inputData.receiver };
            delete receiverDataToSave.reference;
            localStorage.setItem(`receiver:${inputData.receiver.name}`, JSON.stringify(receiverDataToSave));
            updateSavedReceivers();
            showToast('Uspješno spremljen primatelj! ', 'darkgreen');
        }
    };

    /* THE FORM HAS POSTCODE AND CITY FIELDS, BUT THE API EXPECTS PLACE
    UPDATE PLACE STATE FROM CHANGES TO POSTCODE AND CITY */

    useEffect(() => {
        setInputData(prevInputData => ({
            ...prevInputData,
            sender: {
                ...prevInputData.sender,
                place: `${prevInputData.sender.postcode} ${prevInputData.sender.city}`
            },
            receiver: {
                ...prevInputData.receiver,
                place: `${prevInputData.receiver.postcode} ${prevInputData.receiver.city}`
            }
        }));
    }, [inputData.sender.postcode, inputData.sender.city, inputData.receiver.postcode, inputData.receiver.city]);

    /* FILL IN IBAN FROM MODAL SUBMISSION */

    const handleIBANChange = (IBAN) => {
        handleInputChange('receiver', 'iban', IBAN);
        setVisited((prevVisited) => ({
            ...prevVisited,
            'receiver.iban': true,
        }));
    };

    /* TREAT EACH TOAST REF SEPARATELY TO REFRESH THE DURATION */

    const toastTimeoutRef = useRef();

    /* ERROR TOAST FOR SPECIFIC FIELD IF INVALID ON BLUR */

    const showToast = (content, color) => {
        const id = uuidv4();
        setToasts((prevToasts) => [
            ...prevToasts,
            { id, content, color, show: false }
        ]);

        setTimeout(() => {
            setToasts((prevToasts) =>
                prevToasts.map((toast) =>
                    toast.id === id ? { ...toast, show: true } : toast
                )
            );
        }, 10);

        toastTimeoutRef.current = setTimeout(() => {
            setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
        }, 20000);
    };

    /* DISMISS OPTION FOR EACH TOAST */

    const dismissToast = (id) => {
        setToasts((prevToasts) =>
            prevToasts.map((toast) =>
                toast.id === id ? { ...toast, show: false, dismiss: true } : toast
            )
        );
    
        setTimeout(() => {
            setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
        }, 500);
    };

    /* FIELDS IMPORTED FROM URL PARAMS SHOULD BE TREATED AS VISITED
    WHICH MEANS THEY SHOULD BE VALIDATED IMMEDIATELY AFTER BEING IMPORTED */

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        let urlInputData = { ...inputData };
        let shouldUpdateState = false;
    
        searchParams.forEach((value, key) => {
            const keyParts = key.split(".");
            if (keyParts.length === 2) {
                let [section, field] = keyParts;
                if (!urlInputData[section] && section !== 'amount') {
                    urlInputData[section] = {};
                }
                if (field === 'amount') {
                    value = value.replace(/\./g, '').replace(',', '.');
                }
                if (urlInputData[section][field] !== value) {
                    urlInputData[section][field] = value;
                    shouldUpdateState = true;
                }
            } else {
                value = key === 'amount' ? value.replace(/\./g, '').replace(',', '.') : value;
                if (urlInputData[key] !== value) {
                    urlInputData[key] = value;
                    shouldUpdateState = true;
                }
            }
        });
    
        if (shouldUpdateState) {
            setInputData(urlInputData);
            setVisited((prevVisited) => {
                let newVisited = { ...prevVisited };
                for (let key of searchParams.keys()) {
                    newVisited[key] = true;
                }
                return newVisited;
            });
        }
    }, [location.search]);

    const displayQueryParams = () => {
        const queryParams = `{
    "amount",
    "purpose",
    "description",
    "sender": {
        "name",
        "street",
        "postcode",
        "city",
    },
    "receiver": {
        "name",
        "street",
        "postcode",
        "city",
        "iban",
        "model",
        "reference",
    }
}`;
        const params = `
amount
purpose
description
    /* PLATITELJ */
sender.name
sender.street
sender.postcode
sender.city

    /* PRIMATELJ */
receiver.name
receiver.street
receiver.postcode
receiver.city
receiver.iban
receiver.model
receiver.reference
        `;

        const values = `
Iznos (npr 9.999,99)
Šifra (po ISO 20022)
Opis plaćanja

Ime i prezime|Naziv
Ulica i kućni broj
Poštanski broj
Grad/mjesto/naselje


Ime i prezime|Naziv
Ulica i kućni broj
Poštanski broj
Grad/mjesto/naselje
IBAN
Model (bez HR)
Poziv na broj
        `

        return (
            <div style={{ display: 'flex' }}>
                <pre
                    style={{
                        backgroundColor: 'black',
                        fontSize: '12px',
                        color: 'limegreen',
                        padding: '10px',
                        borderRadius: '5px',
                        margin: '5px',
                        overflowX: 'auto',
                        whiteSpace: 'pre-wrap',
                        wordWrap: 'break-word',
                        flexBasis: windowWidth < 625 ? '50%' : '33%',
                    }}
                >
                    {queryParams}
                </pre>
                <pre
                    style={{
                        backgroundColor: 'black',
                        fontSize: '12px',
                        color: 'darkgoldenrod',
                        padding: '10px',
                        borderRadius: '5px',
                        margin: '5px',
                        overflowX: 'auto',
                        whiteSpace: 'pre-wrap',
                        wordWrap: 'break-word',
                        flexBasis: windowWidth < 625 ? '50%' : '33%',
                    }}
                >
                    {params}
                </pre>
                <pre
                    style={{
                        backgroundColor: 'black',
                        fontSize: '12px',
                        color: 'red',
                        padding: '10px',
                        borderRadius: '5px',
                        margin: '5px',
                        overflowX: 'auto',
                        whiteSpace: 'pre-wrap',
                        wordWrap: 'break-word',
                        flexBasis: windowWidth < 625 ? '50%' : '33%',
                        display: windowWidth < 625 ? 'none' : 'block'
                    }}
                >
                    {values}
                </pre>
            </div>
        );
    };

    return (
        <section className={`${darkMode ? 'dark' : 'light'}`}>
            <button
                onClick={toggleDarkMode}
                style={{ position: 'fixed', right: '10px', top: '10px', padding: '2px', backgroundColor: darkMode ? '#222222' : '#e1e1e1' }}
            >
                {darkMode ? '☀️' : '🌙'}
            </button>
            <button
                style={{
                    position: 'fixed',
                    left: '10px',
                    top: '10px',
                    padding: '2px',
                    fontSize: '24px',
                    color: darkMode ? '#e1e1e1' : '#222222',
                    backgroundColor: darkMode ? '#222222' : '#e1e1e1',
                    border: 'none',
                    cursor: 'pointer',
                }}
            >
                <a
                    href="https://github.com/Lykoskia/react-barcode-generator/tree/master"
                    style={{
                        textDecoration: 'none',
                        color: 'inherit',
                    }}
                >
                    <SiGithub />
                </a>
            </button>
            {/* TITLE */}
            <section className="title">
                <div className="content">
                    <h1 className="title">Generirajte barkod za plaćanje</h1>
                    {!barcodeURL && <p className="description">Ispunite podatke i preuzmite barkod kojeg onda možete koristiti za plaćanje računa ili slanje novaca.</p>}
                    {savedReceivers.length > 0 && (
                        <section style={{ textAlign: 'center', color: 'gray' }}>
                            <p style={{ fontWeight: 'bolder', fontSize: window.innerWidth > 1000 ? '24px' : '16px' }}>Odaberite spremljenog primatelja:</p>
                            <select
                                value={selectedReceiver}
                                onChange={handleSelectReceiver}
                                style={{ border: '2px solid gray' }}
                            >
                                {(!selectedReceiver) && <option value="" disabled>Odaberite primatelja</option>}
                                {savedReceivers.map((name, index) => (
                                    <option
                                        key={index}
                                        value={name}
                                    >
                                        {name}
                                    </option>
                                ))}
                            </select>
                        </section>
                    )}
                </div>
            </section>
            <section className="generator">
                {/* FORM */}
                <form onSubmit={handleSubmit}>
                    <div className="content">
                        <div className="people">
                            <div className="payer">
                                <h2>Platitelj</h2>
                                <div className="field">
                                    <label htmlFor="payer_name">Ime i prezime<small className={visited['sender.name'] ? (errors.sender.name === '' ? 'val' : 'inval') : 'unvis'}>max. 30</small></label>
                                    <input
                                        type="text"
                                        id="payer_name"
                                        name="sender.name"
                                        className={visited['sender.name'] ? (errors.sender.name === '' ? 'valid' : 'invalid') : 'unvisited'}
                                        value={inputData.sender.name}
                                        onChange={handleInputChange}
                                        onBlur={() => handleBlur('sender.name')}
                                        placeholder="npr. Pero Perić"
                                        maxLength="30"
                                        autoFocus
                                    />
                                </div>
                                <div className="field">
                                    <label htmlFor="payer_address">Ulica i kućni broj<small className={visited['sender.street'] ? (errors.sender.street === '' ? 'val' : 'inval') : 'unvis'}>max. 27</small></label>
                                    <input
                                        type="text"
                                        id="payer_address"
                                        name="sender.street"
                                        className={visited['sender.street'] ? (errors.sender.street === '' ? 'valid' : 'invalid') : 'unvisited'}
                                        value={inputData.sender.street}
                                        onChange={handleInputChange}
                                        onBlur={() => handleBlur('sender.street')}
                                        placeholder="npr. Nikole Tesle 1"
                                        maxLength="27"
                                    />
                                </div>
                                <PlaceLookup
                                    section="sender"
                                    inputData={inputData}
                                    handleInputChange={handleInputChange}
                                    handleBlur={handleBlur}
                                    handleContextMenu={handleContextMenu}
                                    placeValues={placeValues}
                                    visited={visited}
                                    errors={errors}
                                />
                            </div>
                            <div className="payee">
                                <h2>Primatelj</h2>
                                <div className="field">
                                    <label htmlFor="payee_name">Ime i prezime<small className={visited['receiver.name'] ? (errors.receiver.name === '' ? 'val' : 'inval') : 'unvis'}>max. 25</small></label>
                                    <input
                                        type="text"
                                        id="payee_name"
                                        name="receiver.name"
                                        className={visited['receiver.name'] ? (errors.receiver.name === '' ? 'valid' : 'invalid') : 'unvisited'}
                                        value={inputData.receiver.name}
                                        onChange={handleInputChange}
                                        onBlur={() => handleBlur('receiver.name')}
                                        placeholder="npr. Ana Anić"
                                        maxLength="25"
                                    />
                                </div>
                                <div className="field">
                                    <label htmlFor="payee_address">Ulica i kućni broj<small className={visited['receiver.street'] ? (errors.receiver.street === '' ? 'val' : 'inval') : 'unvis'}>max. 25</small></label>
                                    <input
                                        type="text"
                                        id="payee_address"
                                        name="receiver.street"
                                        className={visited['receiver.street'] ? (errors.receiver.street === '' ? 'valid' : 'invalid') : 'unvisited'}
                                        value={inputData.receiver.street}
                                        onChange={handleInputChange}
                                        onBlur={() => handleBlur('receiver.street')}
                                        placeholder="npr. Stjepana Radića 2"
                                        maxLength="25"
                                    />
                                </div>
                                <PlaceLookup
                                    section="receiver"
                                    inputData={inputData}
                                    handleInputChange={handleInputChange}
                                    handleBlur={handleBlur}
                                    handleContextMenu={handleContextMenu}
                                    visited={visited}
                                    errors={errors}
                                />
                            </div>
                        </div>
                        <div className="payment">
                            {/* IBAN CALCULATOR MODAL */}
                            <IBANCalculator
                                handleIBANChange={handleIBANChange}
                                generateModalIsOpen={generateModalIsOpen}
                                setGenerateModalIsOpen={setGenerateModalIsOpen}
                                selectModalIsOpen={selectModalIsOpen}
                                setSelectModalIsOpen={setSelectModalIsOpen}
                                showToast={showToast}
                                dismissToast={dismissToast}
                                darkMode={darkMode}
                            />
                            <h2>Uplata</h2>
                            <div className="row">
                                <div className="field iban">
                                    <label htmlFor="payment_iban">IBAN<small className={visited['receiver.iban'] ? (errors.receiver.iban === '' ? 'val' : 'inval') : 'unvis'}>21</small></label>
                                    <input
                                        type="text"
                                        id="payment_iban"
                                        name="receiver.iban"
                                        className={visited['receiver.iban'] ? (errors.receiver.iban === '' ? 'valid' : 'invalid') : 'unvisited'}
                                        value={inputData.receiver.iban}
                                        onChange={handleInputChange}
                                        onBlur={() => handleBlur('receiver.iban')}
                                        onKeyDown={handleKeyDownIBAN}
                                        onContextMenu={handleContextMenu}
                                        onPaste={handlePaste}
                                        onInput={handleInput} // fix for mobile -- still doesn't work
                                        placeholder="npr. HR1234567890123456789"
                                        maxLength="21"
                                    />
                                </div>
                                <div className="field amount">
                                    <label htmlFor="payment_amount">Iznos<small className={visited['amount'] ? (errors.amount === '' ? 'val' : 'inval') : 'unvis'}>&lt; 1M</small></label>
                                    <AmountInput
                                        visited={visited}
                                        errors={errors}
                                        value={inputData.amount}
                                        handleValueChange={handleAmountChange}
                                        handleBlur={handleBlur}
                                    />
                                </div>
                                <div className="field currency">
                                    <label htmlFor="payment_currency">Valuta <small className='val'>EUR</small></label>
                                    <input
                                        type="text"
                                        id="payment_currency"
                                        name="currency"
                                        className="valid"
                                        value={inputData.currency}
                                        readOnly
                                        disabled
                                    />
                                </div>
                            </div>
                            <div className="row">
                                <div className="field model">
                                    <label htmlFor="payment_model">Model<small className={visited['receiver.model'] ? (errors.receiver.model === '' ? 'val' : 'inval') : 'unvis'}>Izbor</small></label>
                                    <select
                                        id="payment_model"
                                        name="receiver.model"
                                        className={visited['receiver.model'] ? (errors.receiver.model === '' ? 'valid' : 'invalid') : 'unvisited'}
                                        value={inputData.receiver.model}
                                        onChange={handleInputChange}
                                        onBlur={() => handleBlur('receiver.model')}
                                        placeholder="npr. HR00"
                                    >
                                        <option value="00">HR00</option>
                                        <option value="01">HR01</option>
                                        <option value="02">HR02</option>
                                        <option value="03">HR03</option>
                                        <option value="04">HR04</option>
                                        <option value="05">HR05</option>
                                        <option value="06">HR06</option>
                                        <option value="07">HR07</option>
                                        <option value="08">HR08</option>
                                        <option value="09">HR09</option>
                                        <option value="10">HR10</option>
                                        <option value="11">HR11</option>
                                        <option value="12">HR12</option>
                                        <option value="13">HR13</option>
                                        <option value="14">HR14</option>
                                        <option value="15">HR15</option>
                                        <option value="16">HR16</option>
                                        <option value="17">HR17</option>
                                        <option value="18">HR18</option>
                                        <option value="19">HR19</option>
                                        <option value="23">HR23</option>
                                        <option value="24">HR24</option>
                                        <option value="26">HR26</option>
                                        <option value="27">HR27</option>
                                        <option value="28">HR28</option>
                                        <option value="29">HR29</option>
                                        <option value="30">HR30</option>
                                        <option value="31">HR31</option>
                                        <option value="33">HR33</option>
                                        <option value="34">HR34</option>
                                        <option value="35">HR35</option>
                                        <option value="40">HR40</option>
                                        <option value="41">HR41</option>
                                        <option value="42">HR42</option>
                                        <option value="43">HR43</option>
                                        <option value="55">HR55</option>
                                        <option value="62">HR62</option>
                                        <option value="63">HR63</option>
                                        <option value="64">HR64</option>
                                        <option value="65">HR65</option>
                                        <option value="67">HR67</option>
                                        <option value="68">HR68</option>
                                        <option value="69">HR69</option>
                                        <option value="99">HR99</option>
                                    </select>
                                </div>
                                <div className="field reference">
                                    <label htmlFor="payment_reference">Poziv na broj<small className={visited['receiver.reference'] ? (errors.receiver.reference === '' ? 'val' : 'inval') : 'unvis'}>max. 22</small></label>
                                    <input
                                        type="text"
                                        id="payment_reference"
                                        name="receiver.reference"
                                        className={visited['receiver.reference'] ? (errors.receiver.reference === '' ? 'valid' : 'invalid') : 'unvisited'}
                                        value={inputData.receiver.reference}
                                        onChange={handleInputChange}
                                        onKeyDown={handleKeyDownReference}
                                        onContextMenu={handleContextMenu}
                                        onBlur={() => handleBlur('receiver.reference')}
                                        placeholder="npr. 00-000-00"
                                        maxLength="22"
                                    />
                                </div>
                                <div className="field purpose">
                                    <label htmlFor="payment_purpose">Namjena<small className={visited['purpose'] ? (errors.purpose === '' ? 'val' : 'inval') : 'unvis'}>Izbor</small></label>
                                    <select
                                        id="payment_purpose"
                                        name="purpose"
                                        className={visited['purpose'] ? (errors.purpose === '' ? 'valid' : 'invalid') : 'unvisited'}
                                        value={inputData.purpose}
                                        onChange={handleInputChange}
                                        onBlur={() => handleBlur('purpose')}
                                        placeholder="npr. OTHR"
                                    >
                                        {purposeValues.map((value, index) => (
                                            <option key={index} value={value}>{value}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="row">
                                <div className="field">
                                    <label htmlFor="payment_description">Opis plaćanja<small className={visited['description'] ? (errors.description === '' ? 'val' : 'inval') : 'unvis'}>max. 35</small></label>
                                    <input
                                        type="text"
                                        id="payment_description"
                                        name="description"
                                        className={visited['description'] ? (errors.description === '' ? 'valid' : 'invalid') : 'unvisited'}
                                        value={inputData.description}
                                        onChange={handleInputChange}
                                        onBlur={() => handleBlur('description')}
                                        placeholder="npr. plaćanje računa"
                                        maxLength="35"
                                    />
                                </div>
                            </div>
                        </div>
                        {/* CONDITIONAL ERROR RENDERING */}
                        {errorMessages && isFormSubmitted && (
                            <section className="content">
                                <div className="title">
                                    <p style={{ color: 'darkgoldenrod', fontWeight: 'bold' }}>Prije generiranja barkoda nužno je ispraviti podatke:</p>
                                    {errorParagraphs}
                                </div>
                            </section>)}
                        <div className="request" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            {isFormSubmitted && countdown > 0 && (
                                <div style={{ margin: '10px', fontSize: '22px', color: 'red' }}>
                                    <b> 00:00:{countdown.toString().padStart(2, '0')}</b>
                                </div>
                            )}
                            <p style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', margin: '0px' }}>Generiranje barkoda</p>
                            <p style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', margin: '0px' }}>Spremiti primatelja?</p>
                            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                                <button
                                    type="submit"
                                    disabled={isFormSubmitted}
                                    className={isFormSubmitted ? 'disabled' : ''}
                                >
                                    {isFormSubmitted ? 'Pričekajte...' : 'Generirajte'}
                                </button>
                                <button
                                    type="button"
                                    onClick={saveReceiverData}
                                    style={{ marginLeft: 20 }}
                                >
                                    Spremite
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
                <div className="content">
                    <div className="barcode-container">
                        <canvas
                            ref={canvasRef}
                            style={{
                                margin: '10px',
                                backgroundColor: barcodeURL ? '#FFFFFF' : (darkMode ? '#222222' : '#e1e1e1')
                            }}
                        ></canvas>
                    </div>
                    {barcodeURL &&
                        <section>
                            <div className="request" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <p><strong>Spremite ili podijelite barkod:</strong></p>
                                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                                    <button onClick={handleDownload}>Spremite</button>
                                    <button onClick={handleShare} style={{ marginLeft: 20 }}>Podijelite</button>
                                </div>
                            </div>
                        </section>
                    }
                </div>
            </section>
            {/* ABOUT */}
            <section className="content">
                <h2 className="title" style={{ marginTop: '20px', marginBottom: '20px' }}>Struktura URL query parametara:</h2>
                {displayQueryParams()}
                <p><strong>Napomene:</strong></p>
                <ul>
                    <li><strong>currency je <i><u>uvijek</u></i> EUR i ne može se mijenjati!</strong></li>
                    <li><strong>amount:</strong> <i><u>sve</u></i> znamenke i bar decimalni zarez
                        <ul>
                            <li>točka (separator za tisuće) opcionalna</li>
                            <li>npr: 0,01 / 123,45 / 1337,00 / 9.999,99</li>
                        </ul>
                    </li>
                    <li><strong>purpose:</strong> 4 velika slova
                        <ul>
                            <li>sukladno ISO 20022 standardu</li>
                            <li>opcionalno jer je zadan default: <strong>OTHR</strong></li>
                        </ul>
                    </li>
                    <li><strong>sender.postcode:</strong> hrvatski poštanski broj</li>
                    <li><strong>sender.city:</strong> pripadajući grad/mjesto/naselje</li>
                    <li><strong>receiver.postcode:</strong> hrvatski poštanski broj</li>
                    <li><strong>receiver.city:</strong> pripadajući grad/mjesto/naselje</li>
                    <li><strong>receiver.model:</strong> <i><u>samo</u></i> 2 znamenke (npr 00)</li>
                </ul>
            </section>
            <section className="about">
                <div className="content">
                    <h3>Ukratko o projektu</h3>
                    <p>Projekt je nastao iz potrebe da se na jednostavan način generira barkod za plaćanje, a u nedostatku kvalitetne alternative.</p>
                </div>
            </section>
            {/* COOKIES */}
            <div className={`modal-backdrop ${showCookieConsent ? 'show-backdrop' : ''}`}>
                <div className={`modal-container ${showCookieConsent ? 'show-modal' : ''}`}>
                    <div className="modal-content">
                        <p>Na ovoj stranici možete spremiti kolačić koji će zapamtiti upisane podatke o platitelju.</p>
                        <p>Kolačić služi <strong>isključivo</strong> da Vama olakša ispunjavanje podataka pri budućim posjetama.</p>
                        <p>Vaši podaci se ne prikupljaju, ne obrađuju, niti se pohranjuju na niti jedan drugi način.</p>
                        <hr />
                        <div className="modal-buttons">
                            <button onClick={handleAcceptCookies}>Zapamti</button>
                            <button onClick={handleRejectCookies}>Zaboravi</button>
                        </div>
                    </div>
                </div>
            </div>
            {/* ERROR TOAST */}
            <div className="toasts-container">
                {toasts.map((toast) => (
                    <div key={toast.id} className={`toast ${toast.show ? "show" : ""} ${toast.dismiss ? "dismiss" : ""}`} style={{ backgroundColor: toast.color, color: 'white', boxShadow: '4px 4px 2px black' }}>
                        {toast.content}
                        <button
                            onClick={() => dismissToast(toast.id)}
                            style={{ marginLeft: 'auto', color: 'white', backgroundColor: 'black', border: '2px solid goldenrod', padding: '4px' }}
                        >
                            X
                        </button>
                    </div>
                ))}
            </div>
        </section>
    );
}
