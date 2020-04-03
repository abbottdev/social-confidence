import React, { FunctionComponent, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

export const CountryViewer:FunctionComponent = () => {
    const urlParams = useParams<{countryCode:string}>();

    return <div>Viewing {urlParams.countryCode}</div>;
  }