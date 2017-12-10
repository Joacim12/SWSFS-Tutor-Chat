import React, {Component} from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Route,
} from 'react-router-dom'
import Login from "./components/Login";
import Chat from "./components/Chat";
import Debug from "./debug/Debug";
import Register from "./components/Register";

class App extends Component {
    render() {
        return (
            <Router>
                <Switch>
                    <Route exact path="/" component={Login}/>
                    <Route path="/chat" component={Chat}/>
                    <Route path="/debug" component={Debug}/>
                    <Route path="/register" component={Register}/>
                </Switch>
            </Router>
        );
    }
}

export default App;
