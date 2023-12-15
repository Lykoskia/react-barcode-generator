/*

First working draft, included for comparison with current code only.
Timeline of this version is mid June - early July 2023.
Code has since been upgraded to the deployed current version in mid-late August 2023 after a vacation hiatus.

Usually this would have been just an earlier commit, but I made a mistake and wiped the repo after a rebase gone wrong.
I have since extracted this code into a separate file for the sake of comparison, while starting a new repo with the current code (which may have since been updated further).

*/

import React, { useState } from 'react';
import './incl/css/normalize.css';
import './incl/css/master.css';
 
export default function App() {
   
    const [inputData, setInputData] = useState(
        {
            amount: '',
            currency: 'EUR',
            sender: {
                name: '',
                street: '',
                place: ''
            },
            receiver: {
                name: '',
                street: '',
                place: '',
                model: '00',
                iban: 'HR',
                reference: '',
            },
            purpose: 'OTHR',
            description: ''
        }
    );
 
    const [errors, setErrors] = useState({
            amount: '',
            currency: '',
            sender: {
                name: '',
                street: '',
                place: ''
            },
            receiver: {
                name: '',
                street: '',
                place: '',
                model: '',
                iban: '',
                reference: '',
            },
            purpose: '',
            description: ''
    });
 
    const [barcodeUrl, setBarcodeUrl] = useState('');
    const purposeValues = [ 'ACCT', 'ADCS', 'ADMG', 'ADVA', 'AEMP', 'AGRT', 'AIRB', 'ALLW', 'ALMY', 'AMEX', 'ANNI', 'ANTS', 'AREN', 'AUCO', 'B112', 'BBSC', 'BCDM', 'BCFG', 'BECH',
                            'BENE', 'BEXP', 'BFWD', 'BKDF', 'BKFE', 'BKFM', 'BKIP', 'BKPP', 'BLDM', 'BNET', 'BOCE', 'BOND', 'BONU', 'BR12', 'BUSB', 'CABD', 'CAEQ', 'CAFI', 'CASH',
                            'CBCR', 'CBFF', 'CBFR', 'CBLK', 'CBTV', 'CCHD', 'CCIR', 'CCPC', 'CCPM', 'CCRD', 'CCSM', 'CDBL', 'CDCB', 'CDCD', 'CDCS', 'CDDP', 'CDEP', 'CDOC', 'CDQC',
                            'CFDI', 'CFEE', 'CGDD', 'CHAR', 'CLPR', 'CMDT', 'COLL', 'COMC', 'COMM', 'COMP', 'COMT', 'CORT', 'COST', 'CPEN', 'CPKC', 'CPYR', 'CRDS', 'CRPR', 'CRSP',
                            'CRTL', 'CSDB', 'CSLP', 'CVCF', 'DBCR', 'DBTC', 'DCRD', 'DEPD', 'DEPT', 'DERI', 'DICL', 'DIVD', 'DMEQ', 'DNTS', 'DSMT', 'DVPM', 'ECPG', 'ECPR', 'ECPU',
                            'EDUC', 'EFTC', 'EFTD', 'ELEC', 'ENRG', 'EPAY', 'EQPT', 'EQTS', 'EQUS', 'ESTX', 'ETUP', 'EXPT', 'EXTD', 'FACT', 'FAND', 'FCOL', 'FCPM', 'FEES', 'FERB',
                            'FIXI', 'FLCR', 'FNET', 'FORW', 'FREX', 'FUTR', 'FWBC', 'FWCC', 'FWLV', 'FWSB', 'FWSC', 'FXNT', 'GAFA', 'GAHO', 'GAMB', 'GASB', 'GDDS', 'GDSV', 'GFRP',
                            'GIFT', 'GOVI', 'GOVT', 'GSCB', 'GSTX', 'GVEA', 'GVEB', 'GVEC', 'GVED', 'GWLT', 'HEDG', 'HLRP', 'HLST', 'HLTC', 'HLTI', 'HREC', 'HSPC', 'HSTX', 'ICCP',
                            'ICRF', 'IDCP', 'IHRP', 'INPC', 'INPR', 'INSC', 'INSM', 'INSU', 'INTC', 'INTE', 'INTP', 'INTX', 'INVS', 'IPAY', 'IPCA', 'IPDO', 'IPEA', 'IPEC', 'IPEW',
                            'IPPS', 'IPRT', 'IPU2', 'IPUW', 'IVPT', 'LBIN', 'LBRI', 'LCOL', 'LFEE', 'LICF', 'LIFI', 'LIMA', 'LMEQ', 'LMFI', 'LMRK', 'LOAN', 'LOAR', 'LOTT', 'LREB',
                            'LREV', 'LSFL', 'LTCF', 'MAFC', 'MARF', 'MARG', 'MBSB', 'MBSC', 'MCDM', 'MCFG', 'MDCS', 'MGCC', 'MGSC', 'MOMA', 'MP2B', 'MP2P', 'MSVC', 'MTUP', 'NETT',
                            'NITX', 'NOWS', 'NWCH', 'NWCM', 'OCCC', 'OCDM', 'OCFG', 'OFEE', 'OPBC', 'OPCC', 'OPSB', 'OPSC', 'OPTN', 'OTCD', 'OTHR', 'OTLC', 'PADD', 'PAYR', 'PCOM',
                            'PDEP', 'PEFC', 'PENO', 'PENS', 'PHON', 'PLDS', 'PLRF', 'POPE', 'PPTI', 'PRCP', 'PRME', 'PTSP', 'PTXP', 'RAPI', 'RCKE', 'RCPT', 'RDTX', 'REBT', 'REFU',
                            'RELG', 'RENT', 'REOD', 'REPO', 'RETL', 'RHBS', 'RIMB', 'RINP', 'RLWY', 'ROYA', 'RPBC', 'RPCC', 'RPNT', 'RPSB', 'RPSC', 'RRBN', 'RRCT', 'RRTP', 'RVPM',
                            'RVPO', 'SALA', 'SASW', 'SAVG', 'SBSC', 'SCIE', 'SCIR', 'SCRP', 'SCVE', 'SECU', 'SEPI', 'SERV', 'SHBC', 'SHCC', 'SHSL', 'SLEB', 'SLOA', 'SLPI', 'SPLT',
                            'SPSP', 'SSBE', 'STDY', 'SUBS', 'SUPP', 'SWBC', 'SWCC', 'SWFP', 'SWPP', 'SWPT', 'SWRS', 'SWSB', 'SWSC', 'SWUF', 'TAXR', 'TAXS', 'TBAN', 'TBAS', 'TBBC',
                            'TBCC', 'TBIL', 'TCSC', 'TELI', 'TLRF', 'TLRR', 'TMPG', 'TPRI', 'TPRP', 'TRAD', 'TRCP', 'TREA', 'TRFD', 'TRNC', 'TRPT', 'TRVC', 'UBIL', 'UNIT', 'VATX',
                            'VIEW', 'WEBI', 'WHLD', 'WTER' ];
 
    const validateForm = () => {
 
        const placePattern = /^\d{5} .*/;
        const ibanPattern = /^(HR)\d{19}/;
        const modelPattern = /^(0[0-9]|1[0-9]|2[346789]|3[01345]|4[0-3]|55|6[2-5]|6[7-9]|99)$/;
 
        const updatedErrors = {
            amount: '',
            currency: '',
            sender: {
                name: '',
                street: '',
                place: ''
            },
            receiver: {
                name: '',
                street: '',
                place: '',
                model: '',
                iban: '',
                reference: '',
            },
            purpose: '',
            description: ''
        };
 
        if (inputData.amount.trim() === '' || isNaN(inputData.amount.trim())) {
            updatedErrors.amount = '* Unesite ispravan iznos.';
        } else {
            if(parseFloat(inputData.amount.trim()) <= 0) {
                updatedErrors.amount = '* Iznos mora biti veći od 0.';
            }
        }
 
        if (inputData.currency.trim() !== 'EUR') {
            updatedErrors.currency = '* Valuta mora biti EUR.'
        }
 
        if (inputData.sender.name.trim().length === 0) {
            updatedErrors.sender.name = '* Unesite ime platitelja.';
        }
 
        if (inputData.sender.name.trim().length > 30) {
            updatedErrors.sender.name = '* Ime platitelja mora biti do 30 znakova.';
        }
 
        if (inputData.sender.street.trim().length === 0) {
            updatedErrors.sender.street = '* Unesite adresu platitelja.'
        }
 
        if (inputData.sender.street.trim().length > 27) {
            updatedErrors.sender.street = '* Ulica i kućni broj platitelja mora biti do 27 znakova.'
        }
 
        if (inputData.sender.place.trim().length === 0) {
            updatedErrors.sender.place = '* Unesite poštanski broj i mjesto platitelja.'
        }
 
        if (inputData.sender.place.trim().length > 27) {
            updatedErrors.sender.place = '* Poštanski broj i mjesto platitelja mora biti do 27 znakova.'
        }
 
        if (!placePattern.test(inputData.sender.place)) {
            updatedErrors.sender.place = '* Poštanski broj i mjesto mora biti u obliku: 10000 Zagreb.'
        }
 
        if (inputData.receiver.name.trim().length === 0) {
            updatedErrors.receiver.name = '* Unesite ime primatelja.'
        }
 
        if (inputData.receiver.name.trim().length > 25) {
            updatedErrors.receiver.name = '* Ime primatelja mora biti do 25 znakova.'
        }
 
        if (inputData.receiver.street.trim().length === 0) {
            updatedErrors.receiver.street = '* Unesite adresu primatelja.'
        }
 
        if (inputData.receiver.street.trim().length > 25) {
            updatedErrors.receiver.street = '* Ulica i kućni broj primatelja mora biti do 25 znakova.'
        }
 
        if (inputData.receiver.place.trim().length === 0) {
            updatedErrors.receiver.place = '* Unesite poštanski broj i mjesto primatelja.'
        }
 
        if (inputData.receiver.place.trim().length > 27) {
            updatedErrors.receiver.place = '* Poštanski broj i mjesto primatelja mora biti do 27 znakova.'
        }
 
        if (!placePattern.test(inputData.receiver.place.trim())) {
            updatedErrors.receiver.place = '* Poštanski broj i mjesto mora biti u obliku: 10000 Zagreb.'
        }
 
        if (inputData.receiver.iban.trim().length === 0) {
            updatedErrors.receiver.iban = '* Unesite IBAN primatelja.'
        }
 
        if (inputData.receiver.iban.trim().length !== 21) {
            updatedErrors.receiver.iban = '* IBAN primatelja mora biti 21 znak.'
        }
 
        if (!ibanPattern.test(inputData.receiver.iban.trim())) {
            updatedErrors.receiver.iban = '* IBAN primatelja mora biti u obliku: HR+19 znamenki.'
        }
 
        if (inputData.receiver.model.trim().length < 2 || inputData.receiver.model.trim().length > 2) {
            updatedErrors.receiver.model = '* Model plaćanja mora biti dvoznamenkasti broj.'
        }
 
        if (!modelPattern.test(inputData.receiver.model.trim())) {
            updatedErrors.receiver.model = '* Dozvoljeni modeli: 00-19, 23-24, 26-31, 33-35, 40-43, 55, 62-65, 67-69 ili 99.'
        }
 
        if (inputData.receiver.reference.trim().length === 0) {
            updatedErrors.receiver.reference = '* Unesite poziv na broj primatelja.'
        }
 
        if (inputData.receiver.reference.trim().length > 22) {
            updatedErrors.receiver.reference = '* Poziv na broj primatelja mora biti do 22 znaka.'
        }
 
        if (!purposeValues.includes(inputData.purpose.trim())) {
            updatedErrors.purpose = '* Odaberite validnu namjenu transakcije.'
        }
 
        if (inputData.description.trim().length === 0) {
            updatedErrors.description = '* Unesite opis plaćanja.'
        }
 
        if (inputData.description.trim().length > 35) {
            updatedErrors.description = '* Opis plaćanja mora biti do 35 znakova.'
        }
 
        setErrors(updatedErrors);
 
        return Object.keys(updatedErrors).length === 0;
    };
 
    const errorParagraphs = (
        <div>
            {Object.entries(errors).map(([key, value]) => {
                if (typeof value === "object" && value !== null) {
                    const nestedParagraphs = Object.entries(value).map(([nestedKey, nestedValue]) => (
                        <div key={nestedKey}>
                            <p className="error" style={{ color: "red" }}>{nestedValue}</p>
                        </div>
                    ));
 
                    return (
                        <div key={key}>
                            {nestedParagraphs}
                        </div>
                    );
                } else {
                    return (
                        <div key={key}>
                            <p className="error" style={{ color: "red" }}>{value}</p>
                        </div>
                    );
                }
            })}
        </div>
    );
 
    const validateKey = (event) => {
        const pressedKey = event.key;
 
        if (pressedKey === 'Tab' || pressedKey === 'Backspace' || pressedKey === 'ArrowLeft' || pressedKey === 'ArrowRight' || pressedKey === 'F5') {
            return;
        }
 
        const keyCode = event.keyCode || event.which;
        if (keyCode < 48 || (keyCode > 57 && keyCode < 96) || keyCode > 105) {
            event.preventDefault();
        }
    };
 
    const handleSubmit = async (event) => {
 
        event.preventDefault();
        const requestData = {
            'renderer': 'image',
            'options': {
                'format': 'png',
                'scale': 3,
                'ratio': 3,
                'color': '#000000',
                'bgColor': '#eeeeee',
                'padding': 20
            },
            'data': {
                'amount': parseInt(inputData.amount),
                'currency': 'EUR',
                'sender': {
                    'name': inputData.sender.name,
                    'street': inputData.sender.street,
                    'place': inputData.sender.place
                },
                'receiver': {
                    'name': inputData.receiver.name,
                    'street': inputData.receiver.street,
                    'place': inputData.receiver.place,
                    'model': inputData.receiver.model,
                    'iban': inputData.receiver.iban,
                    'reference': inputData.receiver.reference
                },
                'purpose': inputData.purpose,
                'description': inputData.description
            }
        }
 
        const screenWidth = window.innerWidth;
 
        if (screenWidth < 800) {
            requestData.options.scale = 2;
            requestData.options.padding = 10;
        }
 
 
        try {
            await fetch('https://hub3.bigfish.software/api/v2/barcode', {
                method: 'POST',
                body: JSON.stringify(requestData),
            });
 
            const requestDataString = JSON.stringify(requestData);
            const encoder = new TextEncoder();
            const requestDataBytes = encoder.encode(requestDataString);
 
           let base64EncodedString = '';
            const CHUNK_SIZE = 0x8000;
            for (let i = 0; i < requestDataBytes.length; i += CHUNK_SIZE) {
                const chunk = requestDataBytes.slice(i, i + CHUNK_SIZE);
                base64EncodedString += String.fromCharCode.apply(null, chunk);
            }
            base64EncodedString = btoa(base64EncodedString);
 
            const getResponse = await fetch(`https://hub3.bigfish.software/api/v2/barcode?data=${base64EncodedString}`);
                if (getResponse.ok) {
                    const blob = await getResponse.blob();
                    const newURL = URL.createObjectURL(blob);
                    setBarcodeUrl(newURL);
            } else {
                alert('Neuspješno generiranje barkoda!');
            }
 
        } catch (error) {
            alert(error);
        }
    };
 
    const handleInputChange = (event) => {
        const { name, value } = event.target;
        const nameParts = name.split('.');
 
        if (nameParts.length > 1) {
            const section = nameParts[0];
            const field = nameParts[1];
 
            const updatedSection = { ...inputData[section], [field]: value };
            setInputData((prevInputData) => ({
                ...prevInputData,
                [section]: updatedSection,
            }));
        } else {
            setInputData((prevInputData) => ({
                ...prevInputData,
                [name]: value,
           }));
        }
    };
 
    return (
        <div>
        {/* NASLOV */}
            <section className="title">
                <div className="content">
                    <h1 className="title">Generirajte barkod za plaćanje.</h1>
                    {(!barcodeUrl) && <span className="description">Ispunite podatke i preuzmite barkod koji možete koristiti za plaćanje račune ili slanje novaca drugima.</span>}
        {/* KONDICIONALNO RENDERIRANJE ERRORA */}
                    <div className="title">
                        {errorParagraphs}
                    </div>
                </div>
            </section>
            <section className="generator">
        {/* FORMA */}
                <form onSubmit={handleSubmit}>
                    <div className="content">
                        <div className="people">
                            <div className="payer">
                                <h2>Platitelj</h2>
                                <div className="field">
                                    <label htmlFor="payer_name">Ime i prezime<small>30 znakova</small></label>
                                    <input
                                        type="text"
                                        id="payer_name"
                                        name="sender.name"
                                        className={errors.sender.name === '' ? 'valid' : 'invalid'}
                                        value={inputData.sender.name}
                                        onChange={handleInputChange}
                                        onInput={validateForm}
                                        placeholder="Pero Perić"
                                        maxLength="30"
                                        autoFocus
                                    />
                                </div>
                                <div className="field">
                                    <label htmlFor="payer_address">Ulica i kućni broj<small>27 znakova</small></label>
                                    <input
                                        type="text"
                                        id="payer_address"
                                        name="sender.street"
                                        className={errors.sender.street === '' ? 'valid' : 'invalid'}
                                        value={inputData.sender.street}
                                        onChange={handleInputChange}
                                        onInput={validateForm}
                                        placeholder="Nikole Tesle 1"
                                        maxLength="27"
                                    />
                                </div>
                                <div className="field">
                                    <label htmlFor="payer_city">Poštanski broj i grad<small>27 znakova</small></label>
                                    <input
                                        type="text"
                                        id="payer_city"
                                        name="sender.place"
                                        className={errors.sender.place === '' ? 'valid' : 'invalid'}
                                        value={inputData.sender.place}
                                        onChange={handleInputChange}
                                        onInput={validateForm}
                                        placeholder="10000 Zagreb"
                                        maxLength="27"
                                    />
                                </div>
                            </div>
                            <div className="payee">
                                <h2>Primatelj</h2>
                                <div className="field">
                                    <label htmlFor="payee_name">Ime i prezime<small>25 znakova</small></label>
                                    <input
                                        type="text"
                                        id="payee_name"
                                        name="receiver.name"
                                        className={errors.receiver.name === '' ? 'valid' : 'invalid'}
                                        value={inputData.receiver.name}
                                        onChange={handleInputChange}
                                        onInput={validateForm}
                                        placeholder="Ana Anić"
                                        maxLength="25"
                                    />
                                </div>
                                <div className="field">
                                    <label htmlFor="payee_address">Ulica i kućni broj<small>25 znakova</small></label>
                                    <input
                                        type="text"
                                        id="payee_address"
                                        name="receiver.street"
                                        className={errors.receiver.street === '' ? 'valid' : 'invalid'}
                                        value={inputData.receiver.street}
                                        onChange={handleInputChange}
                                        onInput={validateForm}
                                        placeholder="Stjepana Radića 2"
                                        maxLength="25"
                                    />
                                </div>
                                <div className="field">
                                    <label htmlFor="payee_city">Poštanski broj i grad<small>27 znakova</small></label>
                                    <input
                                        type="text"
                                        id="payee_city"
                                        name="receiver.place"
                                        className={errors.receiver.place === '' ? 'valid' : 'invalid'}
                                        value={inputData.receiver.place}
                                        onChange={handleInputChange}
                                        onInput={validateForm}
                                        placeholder="51000 Rijeka"
                                        maxLength="27"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="payment">
                            <h2>Uplata</h2>
                            <div className="row">
                                <div className="field iban">
                                    <label htmlFor="payment_iban">IBAN<small>21 znak</small></label>
                                    <input
                                        type="text"
                                        id="payment_iban"
                                        name="receiver.iban"
                                        className={errors.receiver.iban === '' ? 'valid' : 'invalid'}
                                        value={inputData.receiver.iban}
                                        onChange={handleInputChange}
                                        onInput={validateForm}
                                        placeholder="HR1234567890123456789"
                                        maxLength="21"
                                    />
                                </div>
                                <div className="field amount">
                                    <label htmlFor="payment_amount">Iznos<small>* 100</small></label>
                                    <input
                                        type="text"
                                        id="payment_amount"
                                        name="amount"
                                        className={errors.amount === '' ? 'valid' : 'invalid'}
                                        value={inputData.amount}
                                        onChange={handleInputChange}
                                        onKeyDown={validateKey}
                                        onInput={validateForm}
                                        placeholder="123,45 € = 12345"
                                        maxLength="8"
                                    />
                                </div>
                                <div className="field currency">
                                    <label htmlFor="payment_currency">Valuta <small>EUR</small></label>
                                    <input
                                        type="text"
                                        id="payment_currency"
                                        name="currency"
                                        className={errors.currency === '' ? 'valid' : 'invalid'}
                                        value={inputData.currency}
                                        onChange={handleInputChange}
                                        onInput={validateForm}
                                        readOnly
                                        disabled
                                    />
                                </div>
                            </div>
                            <div className="row">
                                <div className="field model">
                                    <label htmlFor="payment_model">Model<small>Odaberite</small></label>
                                    <select
                                        id="payment_model"
                                        name="receiver.model"
                                        className={errors.receiver.model === '' ? 'valid' : 'invalid'}
                                        value={inputData.receiver.model}
                                        onChange={handleInputChange}
                                        onBlur={validateForm}
                                        placeholder="HR00"
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
                                    <label htmlFor="payment_reference">Poziv na broj<small>22 znaka</small></label>
                                    <input
                                        type="text"
                                        id="payment_reference"
                                        name="receiver.reference"
                                        className={errors.receiver.reference === '' ? 'valid' : 'invalid'}
                                        value={inputData.receiver.reference}
                                        onChange={handleInputChange}
                                        onInput={validateForm}
                                        placeholder="00-000-00"
                                        maxLength="22"
                                    />
                                </div>
                                <div className="field purpose">
                                    <label htmlFor="payment_purpose">Namjena<small>Odaberite</small></label>
                                    <select
                                        id="payment_purpose"
                                        name="purpose"
                                        className={errors.purpose === '' ? 'valid' : 'invalid'}
                                        value={inputData.purpose}
                                        onChange={handleInputChange}
                                        onBlur={validateForm}
                                        placeholder="OTHR"
                                    >
                                        {purposeValues.map((value, index) => (
                                            <option key={index} value={value}>{value}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="row">
                                <div className="field">
                                    <label htmlFor="payment_description">Opis plaćanja<small>35 znakova</small></label>
                                    <input
                                        type="text"
                                        id="payment_description"
                                        name="description"
                                        className={errors.description === '' ? 'valid' : 'invalid'}
                                        value={inputData.description}
                                        onChange={handleInputChange}
                                        onBlur={validateForm}
                                        placeholder="Plaćanje računa"
                                        maxLength="35"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="request">
                            <button type="submit">Generiraj barkod</button>
                        </div>
                    </div>
                </form> 
                               </section>
            <section className="barcode">
                {barcodeUrl && <p><img src={barcodeUrl} alt="Barcode" /></p>}
            </section>
            <section className="about">
                <div className="content">
                    <h3>Ukratko o projektu</h3>
                    <p>Projekt je nastao iz potrebe da se na jednostavan način generira barkod za plaćanje, a u nedostatku kvalitetne alternative. Korisničko sučelje se naslanja na HUB3 Barcode API BigFish Softwarea.</p>
                </div>
            </section>
        </div>
    )
}

