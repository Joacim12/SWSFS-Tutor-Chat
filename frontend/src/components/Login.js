import React, {Component} from 'react';
import {Link, Redirect} from 'react-router-dom'
import Navbar from "./Navbar";
import * as firebase from "firebase";

class Login extends Component {

    state = {
        username: '',
        password:'',
        redirect: false,
        error:"",
    }

    signIn = () => {
        firebase.auth().signInWithEmailAndPassword(this.state.username, this.state.password)
            .then(() => {
                this.setState({redirect: true})
            })
            .catch( (error)=> {
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

    handleInput = (event) => {
        this.setState({
            [event.target.name]: event.target.value
        })
    }

    handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            this.signIn()
        }
    }

    render() {
        if (this.state.redirect === true) {
            return (
                <Redirect to={{pathname: "/chat", state: {username: this.state.username}}}/>
            )
        }
        return (
            <div>
                <Navbar/>
                <br/>
                <h2 className="text-center">Welcome to TutorChat</h2>
                {this.renderError()}
                <div className="row">
                    <div className="col"></div>
                    <div className="col">
                        <br/>
                        <label>Username:</label>
                        <input className="form-control" onChange={this.handleInput}
                               type="text"
                               placeholder="Username" name="username"/>
                        <label>Password:</label>
                        <input onKeyUp={this.handleKeyPress} className="form-control" onChange={this.handleInput}
                               type="password"
                               placeholder="Password" name="password"/>
                        <br/>
                        <button className="btn btn-secondary" value="Connect" onClick={this.signIn}>Connect</button>
                        <Link style={{margin: 10}} className="btn btn-warning" value="Create user" to="/register">Create
                            user</Link>
                        <br/>
                        <hr/>
                    </div>
                    <div className="col"></div>
                </div>
            </div>
        );
    }
}

export default Login;
