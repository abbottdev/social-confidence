import React, { FC } from "react";
import { Link } from "react-router-dom";
import { Typography, makeStyles, Button } from "@material-ui/core";

const useStyles = makeStyles(({palette, spacing, breakpoints}) => {
    return {
        coded: {
            color: palette.secondary.contrastText,
            backgroundColor: palette.secondary.main,
            borderRadius: 3,
            padding: '0 2px'
        }
    }
});

export function HomePage() : JSX.Element {
    const classes = useStyles(); 
    return (<div>
        <Typography variant="h4" component="h4">
            What is Social Distancing?
        </Typography>
        <br />
        <Typography component="p">
            Social distancing is an important tool to try and reduce the <code className={classes.coded}>rNaught</code> value of a virus. For reference, an <code className={classes.coded}>rNaught</code> value &gt; 1 means a disease will grow. An <code className={classes.coded}>rNaught</code> value greater than 2 results in exponential growth, and an <code className={classes.coded}>rNaught</code> value &lt; 1 will mean a disease will die out.
        </Typography>
        <br />
        <Typography variant="h4" component="h4">
            Why Social Distance?
        </Typography>
        <br />
        <Typography variant="body1" component="p">
            The <strong>SARS-COV-2</strong> virus, which causes the disease <strong>COVID-19</strong> is currently estimated to have an <code className={classes.coded}>rNaught</code> value of <strong>~2.5</strong>. Using social distancing, aims to reduce this <code className={classes.coded}>rNaught</code> value below 1, and reduce the strain on healthcare services, which would otherwise cause unnecessary deaths.
        </Typography>
        <br />
        <Button variant="contained" color="primary" href="/countries/">
            View Countries
        </Button>
    </div>)
}