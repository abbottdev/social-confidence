import React, { FunctionComponent } from 'react';
import { useParams } from 'react-router-dom';
import { EpidemicViewer } from '../components/epidemics/EpidemicViewer';
import { Breadcrumbs, Typography } from '@material-ui/core';
import { LinkRouter } from '../components/Routing';
import { CountryName } from '../components/countries/CountryName';

export const EpidemicPage:FunctionComponent = () => {
    const { disease, countryCode } = useParams<{countryCode: string, disease: string}>();

    return <div>
        
        <Breadcrumbs aria-label="breadcrumb">
            <LinkRouter color="inherit" to="/">Home</LinkRouter>
            <LinkRouter color="inherit" to="/countries/">Countries</LinkRouter>
            <LinkRouter color="inherit" to={`/countries/${countryCode}/diseases/`}><CountryName countryCode={countryCode} /></LinkRouter>
            <Typography color="textPrimary">{disease}</Typography>
        </Breadcrumbs>
        
        <EpidemicViewer countryCode={countryCode} disease={disease} />
    </div>
  }