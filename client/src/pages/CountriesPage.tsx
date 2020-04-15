import React, { useState, useMemo } from "react"; 
import { CountryName } from "../components/countries/CountryName";
import { countryListSelector } from "../features/countries/countryListSlice";
import { useSelector } from "react-redux";
import { Link as RouterLink, useHistory, useLocation } from 'react-router-dom';
import { Breadcrumbs, Typography, Grid, Card, CardContent, CardMedia, makeStyles, TextField, InputAdornment, Paper } from "@material-ui/core";
import { LinkRouter } from "../components/Routing";
import SearchIcon from '@material-ui/icons/Search';
import { SearchableCardListComponent } from "../components/lists/SearchableCardListComponent";
import useMetaTags from "react-metatags-hook";

const countryCardStyles = makeStyles(({palette, breakpoints}) => ({
    root: {
        cursor: "pointer",
        display: 'flex'
    },
    content: {
      flex: '1 0 auto',
    },
    countryDetails: {
      display: 'flex',
      flexDirection: 'column',
    },
    countryFlag: {
        width: 151,
        [breakpoints.down('sm')]: {
            width: 100
        }
    },
  }));
  
export function CountriesPage() : JSX.Element {
    const countryList = useSelector(countryListSelector);
    const history = useHistory();
    const countryCardClasses = countryCardStyles();
    const location = useLocation();

    useMetaTags({
        title: `Country List - Social Distancing Works!`,
        openGraph: {
            title: `Country List  - Social Distancing Works!`,
            'url': window.location.href
        },
        links: [
          { rel: 'canonical', href: window.location.href }
        ],
    }, [location]);
    
    return (<div>
        <Breadcrumbs aria-label="breadcrumb">
            <LinkRouter color="inherit" to="/">Home</LinkRouter>
            <Typography color="textPrimary">Countries</Typography>
        </Breadcrumbs>
        
        <Typography variant="h3">Countries</Typography>

        <SearchableCardListComponent 
            Items={countryList.allCountries}
            Search={(countryFilter, c) => c.Code.toLowerCase().indexOf(countryFilter) >= 0 || c.Name.toLowerCase().indexOf(countryFilter) >= 0} 
            Render={c => 
                <Grid item xs={12} md={4} key={c.Code}>
                    <Card onClick={() => history.push(`/countries/${c.Code}/diseases/`)} className={countryCardClasses.root}>
                        <div className={countryCardClasses.content}>
                            <CardContent  className={countryCardClasses.countryDetails}>
                                <Typography variant="subtitle2">{c.Name}</Typography>
                                <Typography variant="body2">Population: {c.population.toLocaleString()}</Typography>
                            </CardContent>
                        </div>
                        <CardMedia
                            component="span" 
                            className={countryCardClasses.countryFlag + " " + `flag-icon flag-icon-${c.Code}`} 
                            title={c.Name} />
                     </Card>
                </Grid>} />
    </div>)
}