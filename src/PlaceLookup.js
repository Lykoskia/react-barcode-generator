
import React, { useEffect, useRef } from 'react';
import AutoNumeric from 'autonumeric';
import { placeValues } from './Data';

export default function PlaceLookup ({ section, inputData, handleInputChange, handleBlur, handleContextMenu, visited, errors }) {

    const postcodeRef = useRef(null);
    const mainKeyPostcode = section;
    const subKeyPostcode = "postcode";
    const mainKeyCity = section;
    const subKeyCity = "city";
    const errorMessagePostcode = errors[mainKeyPostcode] && errors[mainKeyPostcode][subKeyPostcode];
    const errorMessageCity = errors[mainKeyCity] && errors[mainKeyCity][subKeyCity];

    useEffect(() => {
        if (postcodeRef.current) {
            new AutoNumeric(postcodeRef.current, {
                minimumValue: '10000',
                maximumValue: '53296',
                digitGroupSeparator: '',
            });
        }
    }, []);

    useEffect(() => {
        const currentPostcode = inputData[section].postcode;
        if (currentPostcode && currentPostcode.length === 5) {
            const foundPlace = placeValues.get(Number(currentPostcode));
            if (foundPlace) {
                handleInputChange(section, 'city', foundPlace);
            }
        }
    }, [inputData[section].postcode]);


    const handlePostCodeChange = (e) => {
        const value = e.target.value;
        handleInputChange(section, 'postcode', value);
    };

    const handleCityChange = (e) => {
        const value = e.target.value;
        handleInputChange(section, 'city', value);
    };

    const handleKeyDownPostCode = (event) => {
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

    return (
        <React.Fragment>
            <div className="field_container">
                <div className="field_half">
                    <label htmlFor={`${section}_postcode`}>Broj pošte<small className={visited[`${section}.postcode`] ? (errorMessagePostcode === '' ? 'val' : 'inval') : 'unvis'}>5 br.</small></label>
                    <input
                        type="text"
                        id={`${section}_postcode`}
                        name={`${section}.postcode`}
                        className={visited[`${section}.postcode`] ? (errorMessagePostcode === '' ? 'valid' : 'invalid') : 'unvisited'}
                        value={inputData[section].postcode}
                        onChange={handlePostCodeChange}
                        onKeyDown={handleKeyDownPostCode}
                        onContextMenu={handleContextMenu}
                        onBlur={() => handleBlur(`${section}.postcode`)}
                        placeholder="npr. 10000"
                        maxLength="5"
                        pattern="\d{5}"
                    />
                </div>
                <div className="field_half">
                    <label htmlFor={`${section}_city`}>Mjesto<small className={visited[`${section}.city`] ? (errorMessageCity === '' ? 'val' : 'inval') : 'unvis'}>max. 21</small></label>
                    <input
                        type="text"
                        id={`${section}_city`}
                        name={`${section}.city`}
                        className={visited[`${section}.city`] ? (errorMessageCity === '' ? 'valid' : 'invalid') : 'unvisited'}
                        value={inputData[section].city}
                        onChange={handleCityChange}
                        onContextMenu={handleContextMenu}
                        onBlur={() => handleBlur(`${section}.city`)}
                        placeholder="npr. Zagreb"
                        maxLength="21"
                    />
                </div>
            </div>
        </React.Fragment>
    );
};