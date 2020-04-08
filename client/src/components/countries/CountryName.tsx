import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { countryListSelector } from "../../features/countries/countryListSlice";
import './CountryName.scss';

export const CountryName:FunctionComponent<{countryCode:string}> = ({countryCode}) => {
    const countries = useSelector(countryListSelector);
    const country = countries.allCountries.find(c => c.Code === countryCode); 

    if (countries.loaded && country)
        return <span><span className={`flag-icon flag-icon-${countryCode}`}></span>&nbsp;{country.Name}</span>;
    else 
        return <span>{countryCode}</span>;
}