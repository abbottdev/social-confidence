import React, { FunctionComponent, useState, useEffect, Props } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux'; 
import { diseasesSelector, loadDiseasesAsync } from "../features/diseases/diseaseSlice";
import { DiseaseList } from '../components/diseases/DiseaseList';

export const DiseasePage:FunctionComponent = () => {
    
    const urlParams = useParams<{countryCode: string}>();
    
    return <div>
        <h2>Disease list</h2>
        <DiseaseList countryCode={urlParams.countryCode} />
    </div>
  }