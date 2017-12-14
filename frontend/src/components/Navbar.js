import React, {Component} from 'react';
import {Link, Redirect} from "react-router-dom";
import {logout, isLoggedIn} from "../js/firebase";
import * as firebase from "firebase/index";
import {closeConnection, getConnection} from "../js/websocket";

class App extends Component {

    state = {isHovered: false, redirect: false};

    handleHover = () => {
        this.setState({
            isHovered: !this.state.isHovered
        });
    }

    signOut = () => {
        closeConnection();
        logout()
            .then(() =>
                this.setState({redirect: true})
            )
    }

    requestWebNotificationPermission = () => {
        const messaging = firebase.messaging();
        messaging.requestPermission()
            .then(() => {
                messaging.getToken().then(token => {
                    let msg = JSON.stringify({
                        "toProfile": "",
                        'fromProfile': this.state.user.username,
                        'command': "webNoti",
                        'content': token
                    })
                    getConnection().send(msg);
                })
            }).catch((err) => {
            console.log(err)
        })
    }

    render() {
        if (this.state.redirect) {
            return (
                <Redirect to={'/'}/>
            )
        }
        const iClass = this.state.isHovered ? "#a3ecff" : "";
        if (isLoggedIn()) {
            return (
                    <nav className="navbar navbar-expand-lg navbar-light"
                         style={{
                             backgroundColor: "#ffd777",
                             boxShadow: "0px 5px 10px 10px rgba(224,224,224,1)",
                             borderBottom: 'solid',
                             borderBottomWidth: '1px',
                             color: "#dcdbde"
                         }}>
                        <div className="container">
                            <span className="navbar-brand">TutorChat</span>
                            <div className="dropdown" onMouseEnter={this.handleHover} onMouseLeave={this.handleHover} style={{backgroundColor: iClass, color:"black"}}>
                                <span className="dropdown-toggle" id="dropdownMenu2" data-toggle="dropdown">
                                    <i className="material-icons md-dark float-left">face</i>
                                    {isLoggedIn().email}
                                    </span>
                                <div className="dropdown-menu" aria-labelledby="dropdownMenu2">
                                    <button className="dropdown-item" data-toggle="modal" data-target=".bd-example-modal-lg" type="button">Profile</button>
                                    {isLoggedIn().displayName === "admin" ?
                                        <Link className="dropdown-item" to={"/admin"}>Admin page</Link> : null}
                                    {isLoggedIn().displayName === "admin" ? <Link className="dropdown-item" to={{pathname:"/chat",state:{username:isLoggedIn().email}}}>Chat</Link> : null}
                                    {isLoggedIn() ? <button className="dropdown-item" type="button" onClick={this.signOut}>Sign out</button> : ""}
                                </div>
                            </div>
                        </div>
                        <div className="modal fade bd-example-modal-lg" tabIndex="-1" role="dialog"
                             aria-labelledby="myLargeModalLabel" aria-hidden="true">
                            <div className="modal-dialog modal-lg">
                                <div className="modal-content">
                                    <div className="container">
                                        <h1>Hey {isLoggedIn().email}!</h1>
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
                 style={{
                     backgroundColor: "#ffd777",
                     boxShadow: "0px 5px 10px 10px rgba(224,224,224,1)",
                     borderBottom: 'solid',
                     borderBottomWidth: '1px',
                     color: "#dcdbde"
                 }}>
                <div className="container">
                    <a className="navbar-brand" href="">TutorChat</a>
                </div>
            </nav>
        )
    }
}

export default App;
