import React, { FunctionComponent } from "react"
import { CardContent, Card, Typography, CardActions } from "@material-ui/core"
import { Route, useParams } from "react-router"
import { CountryName } from "./countries/CountryName";

export const HeaderComponent:FunctionComponent = () => {
    const CountryViewer:FunctionComponent = () => {
        const { countryCode } = useParams<{countryCode:string}>();
        return <CountryName countryCode={countryCode} />
    };

    return <Card>
        <CardContent>
            <Typography variant="h2">Social Confidence</Typography>
            <Typography color="textSecondary" gutterBottom>Make it worth it</Typography>
        </CardContent>
        <CardActions>
            <Route path="/countries/:countryCode?"><CountryViewer /></Route>
        </CardActions>
    </Card>
}