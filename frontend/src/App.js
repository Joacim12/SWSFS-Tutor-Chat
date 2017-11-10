import React, {Component} from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Route,
} from 'react-router-dom'
import Login from "./components/Login";
import Chat from "./components/Chat";
import Navbar from "./components/Navbar";


class App extends Component {

    render() {
        return (
            <div>
                <Navbar/>
                <div className="container">
                    <Router>
                        <Switch>
                            hej
                            <Route exact path="/TutorChat/" component={Login}/>
                            <Route path="/TutorChat/chat" component={Chat}/>
                        </Switch>
                    </Router>
                </div>
            </div>
        );
    }
}

export default App;
