import React, { FunctionComponent, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { currentEpidemicFigures as epidemicFigures, loadEpidemicAsync } from '../../features/epidemic/epidemicSlice';

export const CountryViewer:FunctionComponent = () => {
    const urlParams = useParams<{countryCode:string}>();
    
    const figures = useSelector(epidemicFigures);
    const dispatch = useDispatch();
    
    return <div>Viewing {urlParams.countryCode}</div>;
  }