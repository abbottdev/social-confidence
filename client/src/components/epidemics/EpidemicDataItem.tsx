import React, { FunctionComponent, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { currentEpidemicFigures, currentEpidemic, clearEpidemic, loadEpidemicAsync } from "../../features/epidemic/epidemicSlice";
import { Card, CardContent, Grid, CircularProgress, CardHeader, Typography } from '@material-ui/core';
import { ReportFigureModel } from '../../types/api/EpidemicResponseModel';

export const EpidemicDataItem:FunctionComponent<{title:string, confirmed: number, withSocialDistancingAsOfNow?: number, change?:number, confirmedAt?: Date}> =
 ({title, confirmed, withSocialDistancingAsOfNow, change, confirmedAt}) => {
    return <Card>
        <CardContent>
            <Typography gutterBottom variant="h5" component="h2">
                {title}
            </Typography>
            <Typography variant="h3" color="textPrimary" component="p">
                {withSocialDistancingAsOfNow?.toLocaleString(undefined, {maximumFractionDigits: 0})} <small>(est.)</small>
            </Typography>
            {change &&
                <Typography variant="h4" color={(change! > 0) ? "error" : "primary"} component="p">
                    {(change! > 1) ? "+" : ""}{change?.toLocaleString(undefined, {maximumFractionDigits: 0})}
                </Typography>}

            {confirmedAt && 
                <Typography variant="body2" color="textSecondary" component="small">
                    Offical: {confirmed.toLocaleString()} confirmed @ {confirmedAt.toLocaleDateString()}
                </Typography>}
        </CardContent>
    </Card>
}