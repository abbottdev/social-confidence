import React from "react";
import { Link } from "react-router-dom";

export function HomePage() : JSX.Element {
    return (<div>
        HomePage!
        <ul>
            <li>
                <Link to="/countries/">Country List</Link>
            </li>
        </ul>
    </div>)
}