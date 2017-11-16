import React, {Component} from 'react';
import {Redirect} from "react-router-dom";

class App extends Component {

    state = {isHovered: false, redirect: false};

    handleHover = () => {
        this.setState({
            isHovered: !this.state.isHovered
        });
    }

    signOut = () => {
        this.setState({redirect: true})
    }

    render() {
        if (this.state.redirect) {
            return (
                <Redirect to={'/TutorChat/'}/>
            )
        }

        const iClass = this.state.isHovered ? "#e4e2e5" : "";
        if (this.props.username !== undefined) {
            return (
                <nav className="navbar navbar-expand-lg navbar-light bg-light"
                     style={{backgroundColor: "#f8f9fa", boxShadow: "0px 25px 73px -26px rgba(13,10,212,1)"}}>
                    <div className="container">
                        <a className="navbar-brand" href="">TutorChat</a>
                        <div className="dropdown" onMouseEnter={this.handleHover} onMouseLeave={this.handleHover}
                             style={{backgroundColor: iClass}}>
                                <span className="dropdown-toggle" id="dropdownMenu2" data-toggle="dropdown">
                                    <i className="material-icons md-dark float-left">face</i>
                                    {this.props.username}
                                    </span>
                            <div className="dropdown-menu" aria-labelledby="dropdownMenu2">
                                <button className="dropdown-item" data-toggle="modal" data-target=".bd-example-modal-lg"
                                        type="button">Profile
                                </button>
                                <button onClick={this.signOut} className="dropdown-item" type="button">Sign out</button>
                            </div>
                        </div>


                    </div>
                    <div className="modal fade bd-example-modal-lg" tabIndex="-1" role="dialog"
                         aria-labelledby="myLargeModalLabel" aria-hidden="true">
                        <div className="modal-dialog modal-lg">
                            <div className="modal-content">
                                <div className="container">
                                    <h1>Hey {this.props.username}!</h1>
                                    <div className="row">
                                        <div className="col-md-3">
                                            <h4>Profile avatar: </h4>
                                            <h4>Sound enabled:</h4>
                                        </div>
                                        <div className="col-md-9">
                                            <h4>/image/path/</h4>
                                            <input type="checkbox" defaultChecked={true}/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </nav>

            )
        }
        return (
            <nav className="navbar navbar-light"
                 style={{backgroundColor: "#f8f9fa", boxShadow: "0px 25px 73px -26px rgba(13,10,212,1)"}}>
                <div className="container">
                    <a className="navbar-brand" href="">TutorChat</a>
                </div>
            </nav>
        )
    }
}

export default App;
