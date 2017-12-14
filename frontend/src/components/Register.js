import React, {Component} from 'react';
import {Link} from 'react-router-dom'
import Navbar from "./navbar/Navbar";
import firebase from "../js/firebase.js";
import webSocket from "../js/websocket.js";

/**
 * Component responsible for registering new users.
 */
class Register extends Component {

    state = {
        email: '',
        password: "",
        error: "",
        success: false,
        connection: null,
    }

    componentDidMount() {
        let connection = new WebSocket(webSocket + "register/null");
        this.setState({connection});
    }

    /**
     * Register user in firebase, and send a message to backend database, with the newly created user, so we can store the
     * username there aswell.
     */
    register = () => {
        let profile = {
            "command": "createUser",
            "content": this.state.email
        }

        firebase.auth().createUserWithEmailAndPassword(this.state.email, this.state.password)
            .then(() => {
                this.state.connection.send(JSON.stringify(profile));
                this.setState({error:"",success: true})
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
     *
     * @returns a green box with user created!
     */
    renderSuccess() {
        if (this.state.success) {
            return (
                <div className="alert alert-success">
                    <p>User created!</p>
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
        })
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
        return (
            <div>
                <Navbar/>
                <br/>
                <div className="container">
                    <h2>Create user</h2>
                    {this.renderError()}
                    {this.renderSuccess()}
                    <div className="row">
                        <div className="col">
                            <br/>
                            <label>Email:</label>
                            <input className="form-control" onChange={this.handleInput}
                                   type="email"
                                   placeholder="Email" name="email"/>
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
