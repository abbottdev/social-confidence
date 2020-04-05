import React, { FunctionComponent, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { currentEpidemicFigures, currentEpidemic, clearEpidemic, loadEpidemicAsync } from "../../features/epidemic/epidemicSlice";
import { Card, CardContent, Grid, CircularProgress, CardHeader, Typography } from '@material-ui/core';
import { EpidemicDataItem } from './EpidemicDataItem';

export const EpidemicViewer:FunctionComponent<{countryCode: string, disease: string}> = ({countryCode, disease}) => {
    const dispatch = useDispatch();
    const epidemic = useSelector(currentEpidemic);
    const figures = useSelector(currentEpidemicFigures);
    
    useEffect(() => {
        dispatch(clearEpidemic());
        dispatch(loadEpidemicAsync(countryCode, disease));
    }, [countryCode, disease, dispatch]);

    if (epidemic.loading || figures == null)
        return <CircularProgress />
    else {
        const { cases, currentPopulation, deaths, recovered } = figures;

        return <Grid container spacing={4}>
            <Grid item xs={12}>    
                <Typography variant="body2" color="textSecondary" component="p">
                    Last Confirmed: {cases.confirmed.toLocaleString()} cases @ {epidemic.officialConfirmCasesDate?.toLocaleDateString()}
                </Typography>
            </Grid>
            <Grid item xs={12}>    
                <Typography variant="h2" color="textSecondary" component="p">
                Lives saved: {(deaths.noSocialDistancingAsOfNow - deaths.withSocialDistancingAsOfNow).toLocaleString(undefined, {minimumFractionDigits: 6})}<br />
                </Typography>
            </Grid>
            <Grid item xs={6} md={4}>
                <EpidemicDataItem title="Cases" {...cases} confirmedAt={epidemic.officialConfirmCasesDate} />
                Cases Prevented to date: {(cases.noSocialDistancingAsOfNow - cases.withSocialDistancingAsOfNow).toLocaleString(undefined, {minimumFractionDigits: 6})}<br />
                Potential Cases: {(cases.noSocialDistancingAsOfNow).toLocaleString(undefined, {minimumFractionDigits: 6})}
            </Grid>
            <Grid item xs={6} md={4}>
                <EpidemicDataItem title="Deaths" {...deaths} confirmedAt={epidemic.officialConfirmCasesDate} />
                
                Potential Deaths: {(deaths.noSocialDistancingAsOfNow).toLocaleString(undefined, {minimumFractionDigits: 6})}
            </Grid>
            <Grid item xs={6} md={4}>
                <EpidemicDataItem title="Recovered" {...recovered} withSocialDistancingAsOfNow={recovered.estimatedAsOfNow} confirmedAt={epidemic.officialConfirmCasesDate} />
            </Grid>
            
            <Grid item xs={6} md={4}>
                Cases: 
                {JSON.stringify(cases)}
            </Grid>
            
            <Grid item xs={6} md={4}>
                Deaths
                {JSON.stringify(deaths)}
            </Grid>
            
            <Grid item xs={6} md={4}>
                <Card>
                    <CardContent>
                        <Typography gutterBottom variant="h5" component="h2">
                            Population
                        </Typography>
                        <Typography variant="h3" color="textPrimary" component="p">
                        {currentPopulation.toLocaleString(undefined, {maximumFractionDigits: 0})} <small>(est.)</small>
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={6} md={4}>
                <Card>
                    <CardContent>
                        <dl>
                            <dd>{epidemic.potentialCalculationIsoDate}</dd>
                            
                            <dd>Current (w/Social distancing) </dd>
                            <dt>{cases.withSocialDistancingAsOfNow} (est.)</dt>
                            
                            <dd>Deaths</dd>
                            <dt>{deaths.withSocialDistancingAsOfNow} (est.)</dt>

                            <dd>Population</dd>
                            <dt>{currentPopulation} (est.)</dt>

                            <dd>Recovered </dd>
                            <dt>{recovered.estimatedAsOfNow} (est.)</dt>


                            <dd>Offical Confirmed</dd>
                            <dt>{epidemic.officialConfirmedCases}</dt>
                        </dl>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12}>    
                <Typography variant="body2" color="textSecondary" component="p">
                    * Current estimates are calculated using polynominal regression using datapoints after social distancing was enacted.
                    <br />
                    * Potential cases are calculated using linear regression using datapoints before social distancing was enacted.
                    <br />
                    * Lives saved assumes a CFR (Case Fatality Rate) of 0.51% [<a href="https://www.cebm.net/covid-19/global-covid-19-case-fatality-rates/">source</a>]
                </Typography>
            </Grid>
        </Grid>;
    }
}