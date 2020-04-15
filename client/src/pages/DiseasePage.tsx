import React, { FunctionComponent, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { DiseaseList } from '../components/diseases/DiseaseList';
import { Breadcrumbs, Typography } from '@material-ui/core';
import { LinkRouter } from '../components/Routing';
import { CountryName } from '../components/countries/CountryName';
import { useDispatch, useSelector } from 'react-redux'; 
import { countryListSelector, setActiveCountry } from '../features/countries/countryListSlice';
import useMetaTags from 'react-metatags-hook';

export const DiseasePage:FunctionComponent = () => {
    const urlParams = useParams<{countryCode: string}>();
    const dispatch = useDispatch();
    const countries = useSelector(countryListSelector);
    const location = useLocation();

    useEffect(() => {
        const country = countries.allCountries.find(c => c.Code == urlParams.countryCode);
        if (country)
            dispatch(setActiveCountry(country));
    }, [urlParams])

    useMetaTags({
        title: `Viewing ${countries.activeCountry?.Name} - Social Distancing Works!`,
        openGraph: {
            title: `Viewing in ${countries.activeCountry?.Name} - Social Distancing Works!`,
            'url': window.location.href
        },
        links: [
          { rel: 'canonical', href: window.location.href }
        ],
    }, [countries, location]);
    
    return <div>
        <Breadcrumbs aria-label="breadcrumb">
            <LinkRouter color="inherit" to="/">Home</LinkRouter>
            <LinkRouter color="inherit" to="/countries/">Countries</LinkRouter>
            <Typography color="textPrimary"><CountryName countryCode={urlParams.countryCode} /></Typography>
        </Breadcrumbs>
        <Typography variant="h3">Epidemics</Typography>
        <DiseaseList countryCode={urlParams.countryCode} />
    </div>
  }