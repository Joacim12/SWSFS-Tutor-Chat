import React, {Component} from 'react';
import {Link} from 'react-router-dom'
import Navbar from "./Navbar";
import firebase from "../js/firebase.js";

const webSocket = require("../../package.json").webSocket;

class Register extends Component {

    state = {
        email: '',
        password: "",
        error: "",
        success: false,
        connection: null,
    }

    componentDidMount() {
        let connection = new WebSocket(webSocket + "register");
        this.setState({connection: connection});
    }


    /**
     * Register user in firebase, and send a message to my database, with the newly created user, so we can store the
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
                this.setState({success: true})
            })
            .catch(error => {
                this.setState({error})
            });
    }


    renderError() {
        if (this.state.error.code !== undefined) {
            return (
                <div className="alert alert-danger">
                    <p>{this.state.error.code}</p>
                    <p>{this.state.error.message}</p>
                </div>
            )
        }
    }

    renderSuccess() {
        if (this.state.success) {
            return (
                <div className="alert alert-success">
                    <p>User created!</p>
                </div>
            )
        }
    }

    handleInput = (event) => {
        this.setState({
            [event.target.name]: event.target.value
        })
    }

    handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            this.register();
        }
    }

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
