import React, { FunctionComponent, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { currentEpidemicFigures, currentEpidemic, clearEpidemic, loadEpidemicAsync } from "../../features/epidemic/epidemicSlice";
import { Card, CardContent, Grid, CircularProgress, CardHeader, Typography } from '@material-ui/core';

export const EpidemicViewer:FunctionComponent<{countryCode: string, disease: string}> = ({countryCode, disease}) => {
    const dispatch = useDispatch();
    const epidemic = useSelector(currentEpidemic);
    const figures = useSelector(currentEpidemicFigures);
    
    useEffect(() => {
        dispatch(clearEpidemic());
        dispatch(loadEpidemicAsync(countryCode, disease));
    }, [countryCode, disease, dispatch]);

    if (epidemic.loading)
        return <CircularProgress />
    else
        return <Grid container spacing={4}>
            <Grid item xs={12}>    
                <Typography variant="body2" color="textSecondary" component="p">
                    Last Confirmed: {figures?.cases.confirmed.toLocaleString()} cases @ {epidemic.officialConfirmCasesDate?.toLocaleDateString()}
                </Typography>
            </Grid>
            <Grid item xs={6} md={4}>
                <Card>
                    <CardContent>
                        <Typography gutterBottom variant="h5" component="h2">
                            Cases
                        </Typography>
                        <Typography variant="h3" color="textPrimary" component="p">
                          {figures?.cases.estimated?.toLocaleString(undefined, {maximumFractionDigits: 0})} <small>(est.)</small>
                        </Typography>

                        <Typography variant="h4" color={(figures?.cases.change! > 0) ? "error" : "primary"} component="p">
                            {(figures?.cases.change! > 1) ? "+" : ""}{figures?.cases.change?.toLocaleString(undefined, {maximumFractionDigits: 0})}
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={6} md={4}>
                <Card>
                    <CardContent>
                        <Typography gutterBottom variant="h5" component="h2">
                            Population
                        </Typography>
                        <Typography variant="h3" color="textPrimary" component="p">
                          {figures?.currentPopulation?.toLocaleString(undefined, {maximumFractionDigits: 0})} <small>(est.)</small>
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={6} md={4}>
                <Card>
                    <CardContent>
                        <Typography gutterBottom variant="h5" component="h2">
                            Deaths
                        </Typography>
                        <Typography variant="h3" color="textPrimary" component="p">
                          {figures?.deaths.confirmed?.toLocaleString(undefined, {maximumFractionDigits: 0})}
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={6} md={4}>
                <Card>
                    <CardContent>
                        <Typography gutterBottom variant="h5" component="h2">
                            Recovered
                        </Typography>
                        <Typography variant="h3" color="textPrimary" component="p">
                          {figures?.recovered?.estimated?.toLocaleString(undefined, {maximumFractionDigits: 0})} <small>(est.)</small>
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={6} md={4}>
                <Card>
                    <CardContent>
                        <dl>
                            <dd>Current</dd>
                            <dt>{figures?.cases.estimated} (est.)</dt>
                            
                            <dd>Deaths</dd>
                            <dt>{figures?.deaths.estimated} (est.)</dt>

                            <dd>Population</dd>
                            <dt>{figures?.currentPopulation} (est.)</dt>

                            <dd>Recovered </dd>
                            <dt>{figures?.recovered.estimated} (est.)</dt>


                            <dd>Offical Confirmed</dd>
                            <dt>{epidemic.officialConfirmedCases}</dt>
                        </dl>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>;
}