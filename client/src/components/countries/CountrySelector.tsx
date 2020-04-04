import React, { FunctionComponent, useState, useEffect } from 'react';
import { Country } from '../../types/Country';
import { useParams, useHistory } from 'react-router-dom';
import './CountrySelector.scss';
import { MenuItem, Select } from '@material-ui/core';
import { isUndefined } from 'util';
import { useSelector, useDispatch } from 'react-redux';
import { countryListSelector } from "../../features/countries/countryListSlice";

export const CountrySelector:FunctionComponent = () => {
    // since we pass a number here, clicks is going to be a number.
    // setClicks is a function that accepts either a number or a function returning
    // a number
    
    const urlParams = useParams<{countryCode:string}>();
    const countries = useSelector(countryListSelector);
    const [currentCountry, setCurrentCountry] = useState<Country>();
    const [loaded, setLoaded] = useState(false);
    const history = useHistory();
    const dispatch = useDispatch();

    const onChange = (event: React.ChangeEvent<{ name?: string | undefined; value: unknown; }>) => {
        dispatch(()=> history.push(`/countries/${event.target.value}/diseases/`));
    }
    
    useEffect(() => {
        if (countries.loaded)
        {
            setCurrentCountry(countries.countries.find(c => c.Code === urlParams.countryCode));
            setLoaded(true);
        }
    }, [countries, urlParams.countryCode]);

    return <div>
            <Select disabled={!loaded} displayEmpty={false}
                value={isUndefined(currentCountry) ? "" : currentCountry!.Code}
                onChange={onChange}>
                {countries.countries.map(country => (
                    <MenuItem key={country.Code} value={country.Code}>
                        <span className={`flag-icon flag-icon-${country.Code}`}></span>&nbsp;{country.Name}
                    </MenuItem>
                    // <option key={country.Code} value={country.Code} className={"flag-icon flag-icon-" + country.Code}>
                    //     {country.Name}
                    // </option>
                ))} 
                </Select>
                {/* {(loaded && countries.length && currentCountry != undefined) 
        } */}
            {/* <select 
                disabled={!loaded} value={currentCountry?.Code}
                onChange={e => history.push(`/countries/${e.currentTarget.value}/diseases/`)}>
                {countries.map(country =>
                    <option key={country.Code} value={country.Code} className={"flag-icon flag-icon-" + country.Code}>
                        {country.Name}
                    </option>)}
            </select>
            <br />
            {loaded && <label>{currentCountry?.Name} selected</label>}  */}
        </div>
}
