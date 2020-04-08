import React, { FunctionComponent, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DiseaseList } from '../components/diseases/DiseaseList';
import { Breadcrumbs, Typography } from '@material-ui/core';
import { LinkRouter } from '../components/Routing';
import { CountryName } from '../components/countries/CountryName';
import { useDispatch, useSelector } from 'react-redux'; 
import { countryListSelector, setActiveCountry } from '../features/countries/countryListSlice';

export const DiseasePage:FunctionComponent = () => {
    
    const urlParams = useParams<{countryCode: string}>();
    const dispatch = useDispatch();
    const countries = useSelector(countryListSelector);

    useEffect(() => {
        const country = countries.allCountries.find(c => c.Code == urlParams.countryCode);
        if (country)
            dispatch(setActiveCountry(country));

    }, [urlParams])
    
    return <div>
        <Breadcrumbs aria-label="breadcrumb">
            <LinkRouter color="inherit" to="/">Home</LinkRouter>
            <LinkRouter color="inherit" to="/countries/">Countries</LinkRouter>
            {/* <LinkRouter color="inherit" to={`/countries/${urlParams.countryCode}`}><CountryName countryCode={urlParams.countryCode} /></LinkRouter> */}
            <Typography color="textPrimary"><CountryName countryCode={urlParams.countryCode} /></Typography>
        </Breadcrumbs>
        <h2>Disease list</h2>
        <DiseaseList countryCode={urlParams.countryCode} />
    </div>
  }