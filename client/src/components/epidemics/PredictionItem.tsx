import React, { FunctionComponent } from 'react';
import { Card, CardContent, Typography } from '@material-ui/core';
import moment from "moment";
import { PredictionValue } from '../../features/epidemic/epidemicCalculator';

export const PredictionItem:FunctionComponent<PredictionValue & {title:string, rSquared?: number, regressionMethod?: string}> =
 ({title, cumulative, change, date, rSquared, regressionMethod}) => {
    return <Card>
        <CardContent>
            <Typography gutterBottom variant="h5" component="h2">
                {title}
            </Typography>
            <Typography variant="h3" color="textPrimary" component="p">
                {cumulative?.toLocaleString(undefined, {maximumFractionDigits: 0})} <small>(est.)</small>
            </Typography>
            {change &&
                <Typography variant="h4" color={(change! > 0) ? "error" : "primary"} component="p">
                    {(change! > 1) ? "+" : ""}{change?.toLocaleString(undefined, {maximumFractionDigits: 0})} <small>(est.)</small>
                </Typography>}
            
            <Typography variant="body2" color="textSecondary" component="p">
                Estimated for: {moment(date).toLocaleString()} 
            </Typography>
            <Typography variant="body2" color="textSecondary" component="p">
                rSquared reliability: {rSquared?.toLocaleString(undefined, { maximumFractionDigits: 4})}
            </Typography>
            <Typography variant="body2" color="textSecondary" component="p">
                Regression Model: {regressionMethod}
            </Typography>
            {/* <Typography variant="body2" color="textSecondary" component="p">
                Last prediction date: {moment(values[values.length-1].date).toLocaleString()}
            </Typography>
            <textarea value=  {JSON.stringify(values, undefined, 2)} />
             */}
        </CardContent>
    </Card>
}