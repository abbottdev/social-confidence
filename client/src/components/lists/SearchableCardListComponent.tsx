import React, { useState, useMemo } from "react"; 
import { Grid, makeStyles, TextField, InputAdornment, Paper } from "@material-ui/core";
import SearchIcon from '@material-ui/icons/Search';

const searchElementStyles = makeStyles(({spacing, palette, breakpoints}) => {
    const space = spacing(1); // default = 8;
    const borderRadius = 0;
    const iconColor = palette.grey[500];
    // end of variables
    return {
        root: { 
            borderRadius,
            padding: `${space}px ${space * 2}px`,
        },
        input: {
            fontSize: 16,
            width: '100%'
        },
        adornedStart: {
            '& > *:first-child': {
            // * is the icon at the beginning of input
            fontSize: 20,
            color: iconColor,
            marginRight: space,
            },
        },
    };
});
  

interface Props<T> {
    Items: T[]
    Search: (filter:string, Item: T) => boolean
    Render: (Item:T) => JSX.Element
}

export function SearchableCardListComponent<T>(props:Props<T>):JSX.Element {
    const [filter, setFilter] = useState<string>("");
    const searchClasses = searchElementStyles();    

    const filteredItems = useMemo(() => {
        if (filter !== "")
            return props.Items.filter(i => props.Search(filter, i));
        else
            return  props.Items;
    }, [props, filter]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFilter(event.target.value);
      };

    return <div>
        <Grid container spacing={3} direction="row"
                justify="flex-end"
                alignItems="stretch"
                >
            <Grid item xs={12} md={6}>
                <Paper className={searchClasses.root}>
                    <TextField
                        className={searchClasses.input}
                        id="input-with-icon-textfield"
                        label="Search"
                        value={filter}
                        onChange={handleChange}
                        InputProps={{
                        startAdornment: (
                            <InputAdornment position="start" className={searchClasses.adornedStart}>
                                <SearchIcon />
                            </InputAdornment>
                        ),
                        }}
                    />

                </Paper>
            </Grid>
        </Grid>
        
        <Grid container spacing={3}>
            {filteredItems.map(c => props.Render(c))}
        </Grid>
    </div>;
}