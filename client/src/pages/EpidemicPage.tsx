import React, { FunctionComponent, useState, useEffect, Props } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux'; 
import { diseasesSelector, loadDiseasesAsync } from "../features/diseases/diseaseSlice";
import { DiseaseList } from '../components/diseases/DiseaseList';
import { EpidemicViewer } from '../components/epidemics/EpidemicViewer';

export const EpidemicPage:FunctionComponent = () => {
    const { disease, countryCode } = useParams<{countryCode: string, disease: string}>();

    return <div>
        <h2>{disease}</h2>
        <EpidemicViewer countryCode={countryCode} disease={disease} />
    </div>
  }