import React from 'react';
import logo from './logo.svg';
import './App.scss';
import { CountrySelector } from './components/countries/CountrySelector';
import { CountryViewer } from './components/countries/CountryViewer';

import { BrowserRouter as Router, useParams, useRouteMatch, Switch, Route, Redirect } from "react-router-dom";
import { CountriesPage, HomePage } from './pages/index';
import { DiseasePage } from './pages/DiseasePage';
import { EpidemicPage } from './pages/EpidemicPage';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Social Confidence</h1>
          <Switch>
            <Route path="/countries/:countryCode?">
              <CountrySelector />
            </Route>
          </Switch>
        </header>

        <Switch>
            <Route exact path="/countries/"><CountriesPage /></Route>
            <Route exact path="/countries/:countryCode?"><CountryViewer /></Route>
            <Route exact path="/countries/:countryCode/diseases/"><DiseasePage /></Route>
            <Route exact path="/countries/:countryCode/diseases/:disease"><EpidemicPage /></Route>
            <Route exact path="/"><HomePage /></Route>
          </Switch>
      </div>
    </Router>
  );
}

export default App;
