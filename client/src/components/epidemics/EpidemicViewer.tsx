import React, { FunctionComponent, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { currentEpidemic, currentEpidemicData, figuresSelector, selectedRegressionModelSelector, caseFatalityRateSelector, setFutureDate, futureDateSelector, valuesSelector, futureDateDisplaySelector } from "../../features/epidemic/epidemicSlice";
import { Card, CardContent, Grid, CircularProgress, Typography, Slider, Box, CardHeader, makeStyles, Divider, Paper } from '@material-ui/core';
import { PredictionItem } from './PredictionItem';
import { countryListSelector } from '../../features/countries/countryListSlice';
import moment, { duration } from 'moment';

const styles = makeStyles(({palette, breakpoints}) => { 
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
        },
        slider: {
            '& .MuiSlider-markLabel': {
                [breakpoints.down('xs')]: {
                    maxWidth: 50,
                    textAlign: 'center',
                    fontSize: '0.7em'
                }
            }
        }
    }
});

export const EpidemicViewer:FunctionComponent<{countryCode: string, disease: string}> = () => {
    const epidemic = useSelector(currentEpidemic);
    const countries = useSelector(countryListSelector);
    
    const dispatch = useDispatch();
    const selectedRegressionModel = useSelector(selectedRegressionModelSelector);
    const figures = useSelector(figuresSelector);
    const fatalityRate = useSelector(caseFatalityRateSelector);
    const values = useSelector(valuesSelector);
    const cardHeaderStyle = styles();

    const marks = [
        {
            value: 1,
            label: "1 month"
        },
        {
            value: 2,
            label: "2 month"
        },
        {
            value: 3,
            label: "3 month"
        },
        {
            value: 4,
            label: "4 month"
        },
        {
            value: 5,
            label: "5 month"
        },
        {
            value: 6,
            label: "6 month"
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

            
            <Grid item xs={12}>    
                <Typography variant="h6" color="textSecondary">
                    {futureDateDisplay?.toUpperCase()}
                </Typography>
            </Grid>
            <Grid item xs={12}>  
                <Paper style={{padding: '0 50px'}}>
                    <Slider marks={marks} value={selectedMark?.value} min={1} max={6} step={null} onChange={onSelectedMonthChange} className={cardHeaderStyle.slider} />
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
                <Typography variant="body2" color="textSecondary" component="p">
                    * Current estimates are calculated using regression with datapoints after social distancing was enacted.
                    <br />
                    * Potential cases are calculated using regression with datapoints before social distancing was enacted.
                    <br />
                    * Lives saved assumes a CFR (Case Fatality Rate) of {fatalityRate.toLocaleString()} based on latest confirmed figures.
                </Typography>
            </Grid>
        </Grid>;
    }
}