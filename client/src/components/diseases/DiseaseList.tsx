import React, { FunctionComponent, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Disease } from '../../types/api/DiseaseResponseModel';

export const DiseaseList:FunctionComponent<{countryCode: string}> = ({countryCode}) => {
    
    const [isLoading, setIsLoading] = useState(true);
    const [diseases, setDiseases] = useState<Disease[]>([]);


    useEffect(() => {
        (async () => {
            setIsLoading(true);
            const response= await fetch(`http://social-confidence.s3-website.eu-west-2.amazonaws.com/api/countries/${countryCode}/diseases/diseases.json`);
            
            setIsLoading(false);
            
            if (response.ok) {
                const body = await response.json();

                setDiseases(body as Disease[]);
            } else {

            }
        })();
    }, [countryCode]);
    
    return <div>
            <h2>Diseases {isLoading && <small>Loading...</small>}</h2>         
            <ul>
                {diseases.map(d => <li key={d.name}><Link to={`/countries/${countryCode}/diseases/${d.name}`}>{d.name}</Link></li>)}
            </ul>
        </div>;
  }