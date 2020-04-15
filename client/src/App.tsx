import React, { useEffect } from 'react';
import './App.scss';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { CountriesPage, HomePage } from './pages/index';
import { DiseasePage } from './pages/DiseasePage';
import { EpidemicPage } from './pages/EpidemicPage';
import { Grid, Divider, Container } from '@material-ui/core';
import { loadCountriesAsync } from './features/countries/countryListSlice';
import { useDispatch } from 'react-redux';
import { AppBarComponent } from './components/AppBar';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import { AttributionsComponent } from './components/attributions/Attributions';
import { MetaComponent } from './components/MetaComponent';

const theme = createMuiTheme({
  palette: {
    primary: {
        main: "#008dc9"
    },
    secondary: {
        main: "#e65100"
    }
  },
});

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadCountriesAsync());
  }, [dispatch]);

  return (
    <Router>
        <MetaComponent />
        <ThemeProvider theme={theme}>
            <AppBarComponent />
            <Container >
                <Grid container spacing={3}>
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
                <AttributionsComponent />
        </Container>
      </ThemeProvider>
    </Router>
  );
}

export default App;
