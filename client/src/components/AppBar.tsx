import React, { FunctionComponent, useState } from "react"
import { CardContent, Card, Typography, CardActions, AppBar, Button, IconButton, Toolbar, makeStyles } from "@material-ui/core"
import { Route, useParams, useHistory } from "react-router"
import { CountryName } from "./countries/CountryName";
import MenuIcon from '@material-ui/icons/Menu';
import { Link } from "react-router-dom"; 
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem, { ListItemProps } from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import LanguageIcon from '@material-ui/icons/Language';
import NotListedLocationIcon from '@material-ui/icons/NotListedLocation';
import logo from "../img/logo256.png";

const useStyles = makeStyles(({palette, spacing, breakpoints}) => {
    return {
        root: {
            flexGrow: 1,
            [breakpoints.down('sm')]: {
                marginBottom: 70
            }, 
            [breakpoints.up('md')]: { 
                marginBottom: 115
            }
        },
        menuButton: { 
        },
        toolbar: {
            backgroundColor: "#008dc9",
            [breakpoints.up('md')]: {
                minHeight: 100
            }
        },
        logoImage: {
            height: '3em',
            marginRight: 25,
            [breakpoints.down('sm')]: {
                marginRight: 10,
                height: '1em',
            }
        },
        title: {
            [breakpoints.up('md')]: {
                fontSize: "3.5em",
                flexGrow: 1,
            }
        },
        drawer: {
            width: 250,
        },
        fullDrawer: {
            width: 'auto',
        }
    }
});

export const AppBarComponent = () => {
    const classes = useStyles();
    const history = useHistory();
    const [drawerOpen, setDrawerOpen] = useState(false);

    const closeAndNavigate = (url:string) => {
        setDrawerOpen(false);  
        history.push(url);
    };

    return <div className={classes.root}>
        <AppBar color="secondary" position="fixed">
            <Toolbar className={classes.toolbar}> 
                <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu" onClick={() => setDrawerOpen(true)}>
                    <MenuIcon />
                </IconButton>
                <img src={logo} className={classes.logoImage} />
                <Typography className={classes.title} noWrap>
                    Social Confidence
                </Typography>
            </Toolbar>
            <Drawer open={drawerOpen} anchor="left" onClose={() => setDrawerOpen(false)}>
                <div className={classes.drawer}>
                    <List component="nav">
                        <ListItem button>
                            <ListItemIcon>
                                <LanguageIcon />
                            </ListItemIcon>
                            <ListItemText primary="Country List" onClick={() => closeAndNavigate("/countries/")}  />
                        </ListItem>
                        <ListItem button>
                        <ListItemIcon>
                            <NotListedLocationIcon />
                        </ListItemIcon>
                        <ListItemText primary="Myth Busters" onClick={() => window.location.href = "https://www.who.int/emergencies/diseases/novel-coronavirus-2019/advice-for-public/myth-busters"}  />
                        </ListItem>
                    </List>
                    <Divider />
                </div>
            </Drawer>
        </AppBar>
    </div>
}