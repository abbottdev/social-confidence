import React from "react"; 
import { CountryName } from "../components/countries/CountryName";
import { countryListSelector } from "../features/countries/countryListSlice";
import { useSelector } from "react-redux";
import { Link as RouterLink } from 'react-router-dom';
import { Breadcrumbs, Typography } from "@material-ui/core";
import { LinkRouter } from "../components/Routing";

export function CountriesPage() : JSX.Element {
    const countryList = useSelector(countryListSelector);

    return (<div>
        <Breadcrumbs aria-label="breadcrumb">
            <LinkRouter color="inherit" to="/">Home</LinkRouter>
            <Typography color="textPrimary">Countries</Typography>
        </Breadcrumbs>
        
        <h2>Country List</h2>
        <ul>
            {countryList.countries.map(
                c =>
                <li key={c.Code}>
                    <RouterLink to={`/countries/${c.Code}/diseases/`}><CountryName countryCode={c.Code} /></RouterLink>
                </li>)}
        </ul>
    </div>)
}