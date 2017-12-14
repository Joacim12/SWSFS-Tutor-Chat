import React, {Component} from 'react';
import {isLoggedIn} from "../js/firebase";
import Navbar from "./Navbar";
import {getConnection} from "../js/websocket";
import {Redirect} from "react-router-dom";

class Admin extends Component {

    state = {
        redirect: false
    }

    componentDidMount() {
        if (isLoggedIn() === null || isLoggedIn().displayName !== "admin") {
            this.setState({redirect: true})
        } else {
            let msg = JSON.stringify({
                "toProfile": 'server',
                'fromProfile': isLoggedIn().email,
                'command': 'getUsers'
            })
            getConnection().send(msg)
        }
    }

    render() {
        if (this.state.redirect) {
            return (
                <Redirect to={"/"}/>
            )
        }
        return (
            <div style={{backgroundColor: "#f2f2f2", minHeight: "100vh"}}>
                <Navbar user={isLoggedIn().email}/>
                <br/>
                <div className="container">
                    <table className="table table-bordered">
                        <thead>
                        <tr>
                            <th>1</th>
                            <th>2</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td>1</td>
                            <td>2</td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}

export default Admin;