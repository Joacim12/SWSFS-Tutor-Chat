import React, {Component} from 'react';
import {Link, Redirect} from 'react-router-dom'
import Navbar from "./navbar/Navbar";
import firebase from "../js/firebase.js";
import webSocket from "../js/websocket.js";
import {isLoggedIn} from "../js/firebase";

/**
 * Component responsible for registering new users.
 */
class Register extends Component {

    state = {
        username: '',
        password: "",
        error: "",
        connection: null,
        token: "",
        redirect: false
    }

    componentDidMount() {
        let connection = new WebSocket(webSocket + "register/null");
        this.setState({connection});
    }

    /**
     * Register user in firebase, and send a message to backend database, with the newly created user, so we can store the
     * username there aswell. THen logs the user in with the new user, and redirects to the chat page, with token and username.
     */
    register = () => {
        let profile = {
            "command": "createUser",
            "content": this.state.username
        }

        firebase.auth().createUserWithEmailAndPassword(this.state.username, this.state.password)
            .then(() => {
                this.state.connection.send(JSON.stringify(profile))
                        firebase.auth().signInWithEmailAndPassword(this.state.username, this.state.password)
                            .then((user) => {
                                user.getIdToken(true)
                                    .then((token) => {
                                        console.log("token")
                                        setTimeout(this.state.connection.close(),4000); // hmm
                                        console.log("2 sec")
                                        this.setState({redirect: true, token})
                                    })
                            })
                            .catch((error) => {
                                this.setState({error})
                            });
                this.setState({error: ""})
            })
            .catch(error => {
                this.setState({error})
            });
    }

    /**
     *
     * @returns an visible error to the user, i.e: 'Username already exists!*
     */
    renderError = () => {
        if (this.state.error.code !== undefined) {
            return (
                <div className="alert alert-danger">
                    <p>{this.state.error.code}</p>
                    <p>{this.state.error.message}</p>
                </div>
            )
        }
    }


    /**
     * This method handles updating the relevant attribute in state
     * @param event is an object which should have a target.name and a target.value
     * i.e 'email':'example@example.com'
     */
    handleInput = (event) => {
        this.setState({
            [event.target.name]: event.target.value
        },console.log(this.state))
    }

    /**
     * Handles key press, currently only 'Enter', when Enter is pressed, the register() method will be called.
     * @param e is the object that has the key pressed in.
     */
    handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            this.register();
        }
    }


    /**
     * default RxJs render loop.
     * @returns the rendered page.
     */
    render() {

        if (this.state.redirect === true && isLoggedIn()) {
            return (
                <Redirect to={{pathname: "/chat", state: {username: this.state.username, token: this.state.token}}}/>
            )
        }

        return (
            <div>
                <Navbar/>
                <br/>
                <div className="container">
                    <h2>Create user</h2>
                    {this.renderError()}
                    <div className="row">
                        <div className="col">
                            <br/>
                            <label>Email:</label>
                            <input className="form-control" onChange={this.handleInput}
                                   type="email"
                                   placeholder="Email" name="username"/>
                            <label>Password:</label>
                            <input onKeyUp={this.handleKeyPress} className="form-control"
                                   onChange={this.handleInput}
                                   type="password"
                                   placeholder="Password" name="password"/>
                            <br/>
                            <button className="btn btn-warning" onClick={() => {
                                this.register()
                            }}>Create user
                            </button>
                            <Link style={{margin: 10}} className="btn btn-secondary" to="/">Back</Link>
                            <hr/>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Register;
