import React, {Component} from 'react';
import {isLoggedIn} from "../js/firebase";
import Navbar from "./navbar/Navbar";
import {getConnection} from "../js/websocket";
import {Redirect} from "react-router-dom";

class Admin extends Component {

    state = {
        redirect: false,
        profiles: [],
        loading:true
    }

    componentWillMount() {
        if (isLoggedIn() === null || isLoggedIn().displayName !== "admin") {
            this.setState({redirect: true})
        } else {
            getConnection().onmessage = this.handleMessage;
            let msg = JSON.stringify({
                "toProfile": 'server',
                'fromProfile': isLoggedIn().email,
                'command': 'getUsers'
            });
            getConnection().send(msg)
        }
    }

    /**
     *
     * @param message received, could be anything, so we should probably store the messages, for when going back to the chat component.
     */
    handleMessage = (message) => {
        let msg = JSON.parse(message.data);
        if (msg.command === "getUsers") {
            this.setState({profiles: msg.profiles,loading:false})
        }
    }

    renderProfiles = () => {
        if (!this.state.loading) {
            return this.state.profiles.map((profile, index) => {
                return (
                    <tr key={index}>
                        <td>{profile.username}</td>
                        <td><input type="checkbox" id={index} value={profile.soundEnabled} checked={profile.soundEnabled} onChange={this.toggleSound}/></td>
                        <td><input type="checkbox" id={index} value={profile.tutor} checked={profile.tutor} onChange={this.toggleTutor}/></td>
                        <td style={{wordWrap:"break-word",maxWidth:300}}>{profile.token}</td>
                    </tr>
                )
            });
        }
    };

    updateProfile = (profile) => {
        delete profile.messages;
        delete profile.time;
        let msg = JSON.stringify({
            "toProfile": "server",
            'fromProfile': profile.username,
            'command': "updateUser",
            'content': "",
            'profile': JSON.stringify(profile)
        });
        getConnection().send(msg);
    };

    toggleSound=(e)=>{
        let profiles = this.state.profiles;
        profiles[e.target.id].soundEnabled = e.target.checked;
        this.setState({profiles})
        this.updateProfile(profiles[e.target.id]);
    };

    toggleTutor=(e)=>{
        let profiles = this.state.profiles;
        profiles[e.target.id].tutor = e.target.checked;
        this.setState({profiles})
        this.updateProfile(profiles[e.target.id]);
    }

    render=()=> {
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
                        <thead className={"thead-light"}>
                        <tr>
                            <th>Username</th>
                            <th>Sound enabled</th>
                            <th>Tutor</th>
                            <th>Push notification token</th>
                        </tr>
                        </thead>
                        <tbody>
                        {this.renderProfiles()}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}

export default Admin;