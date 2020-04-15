import React, { FunctionComponent, useEffect } from 'react';
import { useParams, useHistory, useLocation } from 'react-router-dom';
import { EpidemicViewer } from '../components/epidemics/EpidemicViewer';
import { Breadcrumbs, Typography } from '@material-ui/core';
import { LinkRouter } from '../components/Routing';
import { CountryName } from '../components/countries/CountryName';
import { useSelector, useDispatch } from 'react-redux';
import { countryListSelector, setActiveCountry } from '../features/countries/countryListSlice';
import { clearEpidemic, loadEpidemicAsync, currentEpidemic } from '../features/epidemic/epidemicSlice';
import { EpidemicViewerDebug } from '../components/epidemics/EpidemicViewerDebug';
import useMetaTags from 'react-metatags-hook';

function useQuery(searchString:string) {
    return new URLSearchParams(searchString);
}
  
export const EpidemicPage:FunctionComponent = () => {
    const countries = useSelector(countryListSelector);
    const history = useHistory();
    const { disease, countryCode } = useParams<{countryCode: string, disease: string}>();
    const { activeCountry, allCountries } = countries;
    const dispatch = useDispatch();
    const epidemic = useSelector(currentEpidemic);
    const location = useLocation();
    const query = useQuery(location.search);

    useEffect(() => {
        if (activeCountry) {       
            dispatch(clearEpidemic());
            dispatch(loadEpidemicAsync(countryCode, disease));
        } else {
            dispatch(setActiveCountry(allCountries.find(c => c.Code == countryCode)!))
        }
    }, [countryCode, disease, dispatch, countries]);

    useMetaTags({
        title: `Viewing ${disease} in ${activeCountry?.Name} - Social Distancing Works!`,
        openGraph: {
            title: `Viewing ${disease} in ${activeCountry?.Name} - Social Distancing Works!`,
            'url': window.location.href
        },
        links: [
          { rel: 'canonical', href: window.location.href }
        ],
    }, [location, activeCountry, disease]);
    
    return <div> 
        
        <Breadcrumbs aria-label="breadcrumb">
            <LinkRouter color="inherit" to="/">Home</LinkRouter>
            <LinkRouter color="inherit" to="/countries/">Countries</LinkRouter>
            <LinkRouter color="inherit" to={`/countries/${countryCode}/diseases/`}><CountryName countryCode={countryCode} /></LinkRouter>
            <Typography color="textPrimary">{disease}</Typography>
        </Breadcrumbs>
        
        {epidemic && query.has("debug") == false &&
            <EpidemicViewer countryCode={countryCode} disease={disease} />
        }
        
        {epidemic && query.has("debug") &&
            <EpidemicViewerDebug countryCode={countryCode} disease={disease} />
        }
    </div>
  }