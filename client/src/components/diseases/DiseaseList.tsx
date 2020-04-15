import React, { FunctionComponent, useState, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { Disease } from '../../types/api/DiseaseResponseModel';
import { SearchableCardListComponent } from '../lists/SearchableCardListComponent';
import { Grid, Card, CardContent, Typography, CardMedia } from '@material-ui/core';
import { apiBaseUrl } from "../../config/api.json";

export const DiseaseList:FunctionComponent<{countryCode: string}> = ({countryCode}) => {
    const [isLoading, setIsLoading] = useState(true);
    const [diseases, setDiseases] = useState<Disease[]>([]);
    const history = useHistory();

    useEffect(() => {
        (async () => {
            setIsLoading(true);
            const response= await fetch(`${apiBaseUrl}/api/countries/${countryCode}/diseases/diseases.json`);
            
            setIsLoading(false);
            
            if (response.ok) {
                const body = await response.json();

                setDiseases(body as Disease[]);
            } else {

            }
        })();
    }, [countryCode]);
    
    return <div>
            <SearchableCardListComponent 
                Items={diseases}
                Search={(filter, disease) => disease.name.toLowerCase().indexOf(filter) >= 0} 
                Render={c => 
                    <Grid item xs={6} lg={4} key={c.name}>
                        <Card onClick={() => history.push(`/countries/${countryCode}/diseases/${c.name}`)} style={{cursor: "pointer"}}>
                            <CardContent>
                                <Typography variant="body1">{c.name}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>} /> 
        </div>; 
  }