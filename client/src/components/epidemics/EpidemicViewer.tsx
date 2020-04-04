import React, { FunctionComponent, useState, useEffect, Props } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { currentEpidemicFigures, currentEpidemic, clearEpidemic, loadEpidemicAsync } from "../../features/epidemic/epidemicSlice";

export const EpidemicViewer:FunctionComponent<{countryCode: string, disease: string}> = ({countryCode, disease}) => {
    const dispatch = useDispatch();
    const epidemic = useSelector(currentEpidemic);
    const figures = useSelector(currentEpidemicFigures);
    
    useEffect(() => {
        clearEpidemic();
        loadEpidemicAsync(countryCode, disease);
    }, []);

    return <div>
        <h2>Viewing {disease}</h2>

        <dl>
            <dd>Current</dd>
            <dt>{figures?.currentCases}</dt>
        </dl>
    </div>
}