import React, { FunctionComponent, useState, useEffect } from 'react';
import { Country } from '../../types/Country';
import { useParams, useHistory } from 'react-router-dom';
import './CountrySelector.scss';

const allCountries:Country[] = [
    {Code: "", Name: "(select)"},
    {Code: "gb", Name: "United Kingdom"},
    {Code: "us", Name: "United States"},
    {Code: "fr", Name: "France"}
];

export const CountrySelector:FunctionComponent = () => {
    // since we pass a number here, clicks is going to be a number.
    // setClicks is a function that accepts either a number or a function returning
    // a number
    
    const urlParams = useParams<{countryCode:string}>();
    const [countries, setCountries] = useState<Country[]>([]);
    const [currentCountry, setCurrentCountry] = useState<Country>();
    const [loaded, setLoaded] = useState(false);
    const history = useHistory();

    useEffect(() => {
        setCountries(allCountries);
        setCurrentCountry(countries.find(c => c.Code === urlParams.countryCode));
        setLoaded(true);
    }, [countries, urlParams.countryCode]);

    return <div>
            <select 
                disabled={!loaded} value={currentCountry?.Code}
                onChange={e => history.push(`/country/${e.currentTarget.value}`)}>
                {countries.map(country =>
                    <option key={country.Code} value={country.Code} className={"flag-icon flag-icon-" + country.Code}>
                        {country.Name}
                    </option>)}
            </select>
            <br />
            {loaded && <label>{currentCountry?.Name} selected</label>} 
        </div>
  }