import React, {Component} from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Route,
} from 'react-router-dom'
import Login from "./components/Login";
import Chat from "./components/Chat";


class App extends Component {

    render() {
        return (
            <div className="container">
                <Router>
                    <Switch>
                        <Route exact path="/TutorChat/" component={Login}/>
                        <Route path="/TutorChat/chat" component={Chat}/>
                    </Switch>
                </Router>
            </div>
        );
    }
}

export default App;
