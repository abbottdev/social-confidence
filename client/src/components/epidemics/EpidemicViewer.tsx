import React, { FunctionComponent, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { currentEpidemicFigures, currentEpidemic, clearEpidemic, loadEpidemicAsync } from "../../features/epidemic/epidemicSlice";
import { Card, CardContent, Grid, CircularProgress } from '@material-ui/core';

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
        return <Grid>
            <Grid xs={6} md={4}>
                <Card>
                    <CardContent>
                        <dl>
                            <dd>Current</dd>
                            <dt>{figures?.currentCases}</dt>

                            <dd>Offical COnfirmed</dd>
                            <dt>{epidemic.officialConfirmedCases}</dt>
                        </dl>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>;
}