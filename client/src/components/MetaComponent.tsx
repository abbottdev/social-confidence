import React, { FunctionComponent } from "react"
import { CardContent, Card, Typography, CardActions, AppBar, Button, IconButton, Toolbar } from "@material-ui/core"
import { Route, useParams, useRouteMatch, useLocation } from "react-router"
import { CountryName } from "./countries/CountryName";
import MenuIcon from '@material-ui/icons/Menu';
import ShareImage from "../img/logo256.png";
import PreviewImage from "../img/preview.png";
import useMetaTags from 'react-metatags-hook';

export const MetaComponent = () => {
    let location = useLocation();

    const meta = useMetaTags({
        description: "Social distancing calculator to show the number of cases/lives saved",
        lang: "en",
        title: "Social Distancing Works!",
        openGraph: {
            title: 'Social Distancing Works',
            'site_name': 'Social Distancing Works',
            'url': window.location.href
        },
        links: [
        ],
    }, [location]);
    
    return <>
        
    </>      
}