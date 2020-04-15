import React, { FunctionComponent, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { currentEpidemic, currentEpidemicData, figuresSelector, selectedRegressionModelSelector, caseFatalityRateSelector, setFutureDate, futureDateSelector, valuesSelector, futureDateDisplaySelector } from "../../features/epidemic/epidemicSlice";
import { Card, CardContent, Grid, CircularProgress, Typography, Slider, Box, CardHeader, makeStyles, Divider, Paper } from '@material-ui/core';
import { PredictionItem } from './PredictionItem';
import { countryListSelector } from '../../features/countries/countryListSlice';
import moment, { duration } from 'moment';

const cardHeaderStyles = makeStyles(({palette}) => { 
    return {
        root: {
            display: 'flex',
            background: palette.success.main,
            color: palette.secondary.contrastText,
            boxShadow: '0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)',
            borderRadius: 10,
            marginLeft: 30,
            marginRight: 30,
            alignContent: "center",
            justifyContent: "center",
            position: 'relative',
            top: '-15px'
        },
        content: {
            flex: '1 0 auto',
        },
        footer: { 
        },
        box: {
            position: 'relative',
            textAlign: 'center',
            flex: '1 1 auto',
            '&:not(:last-of-type)::after': {
                top: '50%',
                right: 0,
                width: 1,
                height: '50%',
                content: "' '",
                display: 'block',
                position: 'absolute',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(0, 0, 0, 0.08)'
            }
        }
    }
});

export const EpidemicViewerDebug:FunctionComponent<{countryCode: string, disease: string}> = () => {
    const epidemic = useSelector(currentEpidemic);
    const countries = useSelector(countryListSelector);
    
    const dispatch = useDispatch();
    const selectedRegressionModel = useSelector(selectedRegressionModelSelector);
    const figures = useSelector(figuresSelector);
    const fatalityRate = useSelector(caseFatalityRateSelector);
    const values = useSelector(valuesSelector);
    const cardHeaderStyle = cardHeaderStyles();

    const marks = [
        {
            value: 1,
            label: "1 month"
        },
        {
            value: 2,
            label: "2 months"
        },
        {
            value: 3,
            label: "3 months"
        },
        {
            value: 4,
            label: "4 months"
        },
        {
            value: 5,
            label: "5 months"
        },
        {
            value: 6,
            label: "6 months"
        }
    ];

    const numberFormat = (n?:number) => n && n.toLocaleString(undefined, {maximumFractionDigits: 0});

    const futureDateValue = useSelector(futureDateSelector);
    const futureDateDisplay = useSelector(futureDateDisplaySelector);
    const selectedMark = marks.find(m => moment().add(m.value, "months").isSame(futureDateValue, "month"));
    const onSelectedMonthChange = (event:any, newValue: number | number[]) => {
        if (newValue)
            dispatch(setFutureDate(duration(newValue as number, "months").toJSON()));
    };

    if (epidemic.loading || figures == null)
        return <CircularProgress />
    else {
        const { now, futureDate } = figures;

        return <Grid container spacing={4} justify="center">
           
            <Grid item xs={12}>    
                <Typography variant="h6" color="textSecondary">
                    NOW
                </Typography>
                <Typography variant="body2" color="textSecondary" component="p">
                    Last data update: {numberFormat(epidemic.officialCumulativeConfirmedCases)} cases @ {epidemic.officialConfirmCasesDate?.toLocaleDateString()}
                </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
                <Card style={{overflow: 'visible'}}>
                    <CardHeader title={"Lives saved"} className={cardHeaderStyle.root}  titleTypographyProps={{align: 'center'}} />
                    <CardContent>
                        <Typography variant="h2" color="textPrimary" align="center"  >
                            {numberFormat(now.deathsWithoutSocialDistancing.cumulative - now.deathsWithSocialDistancing.cumulative)}
                        </Typography>
                    </CardContent>
                    <Divider />
                    <Box display={'flex'} className={cardHeaderStyle.footer}  >
                        <Box p={2} className={cardHeaderStyle.box} >
                            <Typography color="textSecondary" variant="button">EST. DEATHS NOW</Typography>
                            <Typography variant="h5">{numberFormat(now.deathsWithSocialDistancing.cumulative)}</Typography>
                        </Box>
                        <Box p={2} className={cardHeaderStyle.box}>
                            <Typography color="textSecondary" variant="button">EST. DEATHS NO SOCIAL DISTANCING</Typography>
                            <Typography variant="h5">{numberFormat(now.deathsWithoutSocialDistancing.cumulative)}</Typography>
                        </Box>
                    </Box>
                </Card>
            </Grid>

            <Grid item xs={12} md={6}>
                <Card style={{overflow: 'visible'}}>
                    <CardHeader title={"Cases prevented"} className={cardHeaderStyle.root}  titleTypographyProps={{align: 'center'}} />
                    <CardContent>
                        <Typography variant="h2" color="textPrimary" align="center"  >
                            {numberFormat(now.casesWithoutSocialDistancing.cumulative - now.casesWithSocialDistancing.cumulative)}
                        </Typography>
                    </CardContent>
                    <Divider />
                    <Box display={'flex'} className={cardHeaderStyle.footer}  >
                        <Box p={2} flex={'auto'} className={cardHeaderStyle.box} >
                            <Typography color="textSecondary" variant="button">EST. CASES NOW</Typography>
                            <Typography variant="h5">{numberFormat(now.casesWithSocialDistancing.cumulative)}</Typography>
                        </Box>
                        <Box p={2} flex={'auto'} className={cardHeaderStyle.box}>
                            <Typography color="textSecondary" variant="button">EST. CASES NO SOCIAL DISTANCING</Typography>
                            <Typography variant="h5">{numberFormat(now.casesWithoutSocialDistancing.cumulative)}</Typography>
                        </Box>
                    </Box>
                </Card>
            </Grid>

            
            <Grid item xs={12} alignContent="center">    
                <Typography variant="h6" color="textSecondary">
                    {futureDateDisplay?.toUpperCase()}
                </Typography>
            </Grid>
            <Grid item xs={12}>  
                <Paper style={{padding: '0 50px'}}>
                    <Slider marks={marks} value={selectedMark?.value} min={1} max={6} step={null} onChange={onSelectedMonthChange} />
                </Paper>
            </Grid>

            
            <Grid item xs={12} md={6}>
                <Card style={{overflow: 'visible'}}>
                    <CardHeader title={"Lives saved"} className={cardHeaderStyle.root}  titleTypographyProps={{align: 'center'}} />
                    <CardContent>
                        <Typography variant="h2" color="textPrimary" align="center"  >
                            {numberFormat(futureDate.deathsWithoutSocialDistancing.cumulative - futureDate.deathsWithSocialDistancing.cumulative)}
                        </Typography>
                    </CardContent>
                    <Divider />
                    <Box display={'flex'} className={cardHeaderStyle.footer}  >
                        <Box p={2} className={cardHeaderStyle.box} >
                            <Typography color="textSecondary" variant="button">EST. DEATHS NOW</Typography>
                            <Typography variant="h5">{numberFormat(futureDate.deathsWithSocialDistancing.cumulative)}</Typography>
                        </Box>
                        <Box p={2} className={cardHeaderStyle.box}>
                            <Typography color="textSecondary" variant="button">EST. DEATHS NO SOCIAL DISTANCING</Typography>
                            <Typography variant="h5">{numberFormat(futureDate.deathsWithoutSocialDistancing.cumulative)}</Typography>
                        </Box>
                    </Box>
                </Card>
            </Grid>

            <Grid item xs={12} md={6}>
                <Card style={{overflow: 'visible'}}>
                    <CardHeader title={"Cases prevented"} className={cardHeaderStyle.root}  titleTypographyProps={{align: 'center'}} />
                    <CardContent>
                        <Typography variant="h2" color="textPrimary" align="center"  >
                            {numberFormat(futureDate.casesWithoutSocialDistancing.cumulative - futureDate.casesWithSocialDistancing.cumulative)}
                        </Typography>
                    </CardContent>
                    <Divider />
                    <Box display={'flex'} className={cardHeaderStyle.footer}  >
                        <Box p={2} flex={'auto'} className={cardHeaderStyle.box} >
                            <Typography color="textSecondary" variant="button">EST. CASES NOW</Typography>
                            <Typography variant="h5">{numberFormat(futureDate.casesWithSocialDistancing.cumulative)}</Typography>
                        </Box>
                        <Box p={2} flex={'auto'} className={cardHeaderStyle.box}>
                            <Typography color="textSecondary" variant="button">EST. CASES NO SOCIAL DISTANCING</Typography>
                            <Typography variant="h5">{numberFormat(futureDate.casesWithoutSocialDistancing.cumulative)}</Typography>
                        </Box>
                    </Box>
                </Card>
            </Grid>

            <Grid item xs={12}>    
                <Typography variant="h2" color="textSecondary">
                    With Social Distancing
                </Typography>  
                <Typography variant="h4" color="textSecondary" component="p">
                    Started: {epidemic.socialDistancingStarted}<br />
                </Typography>
            </Grid>
            <Grid item xs={12}>    
                <Typography variant="h2" color="textSecondary" component="p"> 
                Lives saved: {(now.casesWithoutSocialDistancing.cumulative - now.deathsWithSocialDistancing.cumulative).toLocaleString(undefined, {minimumFractionDigits: 6})}<br />
                </Typography>
            </Grid>
            
            <Grid item xs={6} md={4}>
                <PredictionItem title="Cases now casesWithSocialDistancing" {...now.casesWithSocialDistancing} {...selectedRegressionModel.cases.withSocialDistancing}  />
                Cases Prevented to date: {(now.casesWithoutSocialDistancing.cumulative - now.casesWithSocialDistancing.cumulative).toLocaleString(undefined, {minimumFractionDigits: 6})}<br />
                Potential Cases: {(now.casesWithoutSocialDistancing.cumulative).toLocaleString(undefined, {minimumFractionDigits: 6})}
            </Grid>
            <Grid item xs={6} md={4}>
                <PredictionItem title="Deaths withSocialDistancingAsOfNow" {...now.deathsWithSocialDistancing} {...selectedRegressionModel.deaths.withSocialDistancing} />
                
                Potential Deaths: {(now.deathsWithoutSocialDistancing.cumulative).toLocaleString(undefined, {minimumFractionDigits: 6})}
            </Grid>
            
            <Grid item xs={12}>    
                <Typography variant="h2" color="textSecondary">
                    Without Social Distancing
                </Typography>
            </Grid>
            <Grid item xs={6} md={4}>
                <PredictionItem title="Cases now" {...now.casesWithoutSocialDistancing} {...selectedRegressionModel.cases.noSocialDistancing} />
            </Grid>
            <Grid item xs={6} md={4}>
                <PredictionItem title="Deaths now" {...now.deathsWithoutSocialDistancing} {...selectedRegressionModel.deaths.noSocialDistancing} />
            </Grid>
            
            <Grid item xs={12}>    
                <Typography variant="h2" color="textSecondary">
                    Future
                </Typography>  
                <Typography variant="h4" color="textSecondary" component="p">
                    {futureDateValue?.toLocaleString()}<br />
                </Typography>
            </Grid>
            
            <Grid item xs={6} md={4}>
                <PredictionItem title={`Cases in ${futureDateDisplay} WithoutSocialDistancing`} {...futureDate.casesWithoutSocialDistancing}{...selectedRegressionModel.cases.noSocialDistancing}  />
            </Grid>
             
            <Grid item xs={6} md={4}>
                <PredictionItem title={`Deaths in ${futureDateDisplay} deathsWithoutSocialDistancing`} {...futureDate.deathsWithoutSocialDistancing}{...selectedRegressionModel.deaths.noSocialDistancing}  />
                
            </Grid>
            
            <Grid item xs={6} md={4}>
                <PredictionItem title={`Cases in ${futureDateDisplay} casesWithSocialDistancing`} {...futureDate.casesWithSocialDistancing}{...selectedRegressionModel.cases.withSocialDistancing}  />

                <textarea value={JSON.stringify(values?.futureDate.casesWithSocialDistancing)}></textarea>
            </Grid>
            <Grid item xs={6} md={4}>
                <PredictionItem title={`Deaths in ${futureDateDisplay}  with distancing`} {...futureDate.deathsWithSocialDistancing}{...selectedRegressionModel.deaths.noSocialDistancing}  />
                
            </Grid>

            <Grid item xs={6} md={4}>
                <Card>
                    <CardContent>
                        <Typography gutterBottom variant="h5" component="h2">
                            Population
                        </Typography>
                        <Typography variant="h3" color="textPrimary" component="p">
                        {countries.activeCountry?.population.toLocaleString(undefined, {maximumFractionDigits: 0})} <small>(est.)</small>
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={6} md={4}>
                <Card>
                    <CardContent>
                        <dl>
                            <dd>{futureDateDisplaySelector}</dd>
                            
                            <dd>Current (w/Social distancing) </dd>
                            <dt>{now.casesWithSocialDistancing.cumulative} (est.)</dt>
                            
                            <dd>Deaths</dd>
                            <dt>{now.deathsWithSocialDistancing.cumulative} (est.)</dt>

                            <dd>Potential</dd>
                            <dt>{now.deathsWithoutSocialDistancing.cumulative} (est.)</dt>

                            <dd>Population</dd>
                            <dt>{countries.activeCountry?.population.toLocaleString(undefined, {maximumFractionDigits: 0})} (est.)</dt>

                            {/* <dd>Recovered </dd>
                            <dt>{recovered.estimatedAsOfNow} (est.)</dt> */}


                            <dd>Offical Confirmed</dd>
                            <dt>{epidemic.officialCumulativeConfirmedCases}</dt>
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
                    * Lives saved assumes a CFR (Case Fatality Rate) of {fatalityRate.toLocaleString()} based on latest confirmed figures.
                </Typography>
            </Grid>
        </Grid>;
    }
}