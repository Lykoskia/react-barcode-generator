import React, { useState, useEffect } from 'react';

export default function SearchableSelect({ id, name, placeValues, inputData, handleInputChange, handleFieldChange, handleBlur, visited, errors }) {

    const [query, setQuery] = useState('');
    const [selectedPlace, setSelectedPlace] = useState( inputData[name] || { post_code: '', place: '' } );

    const [mainKey, subKey] = name.split('.');
    const errorMessage = errors[mainKey] && errors[mainKey][subKey];
    const postCodePlace = inputData[mainKey][subKey];

    useEffect(() => {

        setSelectedPlace(postCodePlace || { post_code: '', place: '' });
        setQuery(postCodePlace || '');

    }, [postCodePlace]);

    console.log(postCodePlace)

    const handleSelectOption = (selected) => {
        const selectedLower = selected.toLowerCase();
        const selectedPlace = placeValues.find(
            (place) =>
            place.post_code.toString() === selectedLower ||
            place.place.toLowerCase() === selectedLower ||
            `${place.post_code} ${place.place}` === selected
        );

        if (selectedPlace) {
            setSelectedPlace(selectedPlace);
            setQuery(`${selectedPlace.post_code} ${selectedPlace.place}`);
            handleFieldChange(name, selected);
            handleInputChange({ target: { name, value: selected } });
        } else {
            setSelectedPlace({ post_code: '', place: '' });
            setQuery('');
            handleFieldChange(name, '');
            handleInputChange({ target: { name, value: '' } });
        }

    };

    const handleSearchInputChange = (event) => {

        const inputValue = event.target.value;
        setQuery(inputValue);

    };

    const filteredPlaceValues = placeValues.filter((place) => {

        const lowercaseQuery = query.toLowerCase();
        return (

            place.post_code.toString().includes(query) ||
            place.place.toLowerCase().includes(lowercaseQuery) ||
            `${place.post_code} ${place.place}`.toLowerCase().includes(lowercaseQuery)
            
        );

    });

    return (
        <React.Fragment>
            <input
                type="text"
                className="placeInput"
                value={query}
                onChange={handleSearchInputChange}
                placeholder={`Filtrirajte odabir`}
            />

            <select
                id={id}
                name={name}
                className={visited[name] ? filteredPlaceValues.length === 0 ? "invalid" : errorMessage === "" ? "valid" : "invalid" : "unvisited"}
                value={`${selectedPlace.post_code} ${selectedPlace.place}`}
                onChange={(event) => handleSelectOption(event.target.value)}
                onBlur={() => {
                    if (filteredPlaceValues.length === 1) {
                        handleSelectOption(filteredPlaceValues[0].post_code + ' ' + filteredPlaceValues[0].place);
                    }

                    handleBlur(name);
                    }}
                style={{ marginTop: 10 }}
            >
                {filteredPlaceValues.length === 0 && (
                    <option value="">Nema rezultata</option>
                )}
                {filteredPlaceValues.map((place) => (
                    <option
                        key={`${place.post_code} ${place.place}`}
                        value={place.post_code + ' ' + place.place}
                        onClick={() => handleSelectOption(place.post_code + ' ' + place.place)}
                    >
                    {`${place.post_code} ${place.place}`}
                    </option>
                ))}
            </select>
        </React.Fragment>
    );

}
