import React from 'react';
import logo from './logo.svg';
import './App.scss';
import { CountrySelector } from './components/Countries/CountrySelector';
import { BrowserRouter as Router, useParams, useRouteMatch, Switch, Route, Redirect } from "react-router-dom";
import { CountryViewer } from './components/Countries/CountryViewer';
import { CountriesPage, HomePage } from './pages/index';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Social Confidence</h1>
          <Switch>
            <Route path="/country/:countryCode?">
              <CountrySelector />
            </Route>
          </Switch>
        </header>

        <Switch>
            <Route path="/countries/"><CountriesPage /></Route>
            <Route path="/countries/:countryCode?"><CountryViewer /></Route>
            <Route path="/"><HomePage /></Route>
          </Switch>
      </div>
    </Router>
  );
}

export default App;
