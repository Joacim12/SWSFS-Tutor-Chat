import React, {Component} from 'react';
import {Link} from "react-router-dom";

class NoMatch extends Component {
    render() {
        return (
            <div>
                <div>page doesnt exist 404!</div>
                <Link to={"/"} value={"go home"}/>
            </div>
        );
    }
}

export default NoMatch;
