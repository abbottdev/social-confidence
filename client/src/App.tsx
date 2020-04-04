import React, { useEffect } from 'react';
import './App.scss';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { CountriesPage, HomePage } from './pages/index';
import { DiseasePage } from './pages/DiseasePage';
import { EpidemicPage } from './pages/EpidemicPage';
import { Grid, Divider, Container } from '@material-ui/core';
import { loadCountriesAsync } from './features/countries/countryListSlice';
import { useDispatch } from 'react-redux';
import { HeaderComponent } from './components/Header';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadCountriesAsync());
  }, [dispatch]);

  return (
    <Router> 
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <HeaderComponent />
          </Grid>
          <Divider />
          <Grid item xs={12}>
            <Switch>
              <Route exact path="/countries/"><CountriesPage /></Route>
              <Route exact path="/countries/:countryCode/diseases/"><DiseasePage /></Route>
              <Route exact path="/countries/:countryCode/diseases/:disease"><EpidemicPage /></Route>
              <Route exact path="/"><HomePage /></Route>
            </Switch>
        </Grid>
        </Grid>
      </Container>
    </Router>
  );
}

export default App;
