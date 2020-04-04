import React from "react";
import { useHistory } from "react-router";
import { Link } from "react-router-dom";

export function CountriesPage() : JSX.Element {
    const history = useHistory();

    return (<div>
        <h2>Country List</h2>
        <ul>
            <li>
                <Link to="/countries/gb/diseases/">United Kingdom</Link>
            </li>
        </ul>
    </div>)
}