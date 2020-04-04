import React, { FunctionComponent } from 'react';
import { useParams } from 'react-router-dom';
import { DiseaseList } from '../components/diseases/DiseaseList';
import { Breadcrumbs, Typography } from '@material-ui/core';
import { LinkRouter } from '../components/Routing';
import { CountryName } from '../components/countries/CountryName';

export const DiseasePage:FunctionComponent = () => {
    
    const urlParams = useParams<{countryCode: string}>();
    
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