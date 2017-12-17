import React, {Component} from 'react';
import {Redirect} from 'react-router-dom'
import UserList from "./UserList";
import Navbar from "../navbar/Navbar";
import beep from "../../resources/beep.wav"
import ChatArea from "./ChatArea";
import ToolBar from "./ToolBar";
import { isLoggedIn} from "../../js/firebase";
import {closeConnection, getConnection, getUser, setConnection, setUser} from "../../js/websocket";


class Chat extends Component {

    state = {
        users: [], textArea: '',
        user: '', message: '',
        disconnected: false, toProfile: null,
        command: 'needHelp', usersNeedHelp: [],
        file: [], blobUrl: '', loading: true, redirect: false
    };


    componentDidMount = () => {
        if (!isLoggedIn() || this.props.location.state === undefined) {
            this.setState({redirect: true})
        } else {
            if (getConnection() === undefined) {
                console.log(this.props.location.state.token)
                setConnection(this.props.location.state.username+"/"+this.props.location.state.token);
                getConnection().onmessage = this.handleMessage;
            } else{
                getConnection().onmessage = this.handleMessage;
                this.setState({user:getUser(),loading:false});
            }
        }

    };

    componentDidUpdate() {
        if (this.props.location.state === undefined) {
            if (getConnection().readyState >= 2) {
                this.setState({disconnected: true})
            }
        }
    }

    closeWebsocket = () => {
        closeConnection();
    };

    handleMessage = (e) => {
        if (e.data.constructor === Blob) {
            this.setState({blobUrl: URL.createObjectURL(e.data)})
        } else {
            let message = JSON.parse(e.data);
            let date = new Date();
            if (message.username) {
                setUser(message);
                // We received our user object, let's set loading to false.
                this.setState({user: message, loading: false})
                return;
            }
            if (message.command === 'needHelp') {
                if (message && message.content) {
                    this.setState({usersNeedHelp: message.content.split(";")})
                } else {
                    this.setState({usersNeedHelp: []})
                }
            } else if (message.command === 'file') {
                if (this.state.user.soundEnabled) {
                    new Audio(beep).play();
                }
                message.content += ";" + this.state.blobUrl;
                message.time = " " + new Date().toLocaleTimeString('en-GB');
                let user = this.state.user;
                user.messages.push(message);
                this.setState({user});
            } else if (message.command === 'setTutor') {
                let chatMessages = this.state.textArea;
                chatMessages += '\n' + message.content + ' connected - ' + date.getHours() + ":" + date.getMinutes();
                this.setState({
                    toProfile: message.content,
                    textArea: chatMessages,
                    command: 'message',
                })
            } else if (message.command === 'removeTutor') {
                this.setState({command: 'needHelp'})
            } else if (message.command === 'connectedUsers') {
                if (message.content.split(";")[0] === "") {
                    this.setState({users: []})
                } else {
                    this.setState({users: message.content.split(";")})
                }
            }
            else {
                if (this.state.user.soundEnabled) {
                    new Audio(beep).play()
                }
                message.time = " " + new Date().toLocaleTimeString('en-GB');
                let user = this.state.user;
                user.messages.push(message);
                this.setState({user});
            }
        }
    };

    handleList = (e) => {
        this.setState({toProfile: e.target.id.split(":")[0]})
    }

    takeUser = (user) => {
        this.setState({command: "message"})
        let msg = JSON.stringify({
            'fromProfile': this.state.user.username,
            'command': "take",
            'content': user.target.id,
        })
        getConnection().send(msg)
    }

    renderNeedsHelp = () => {
        if (this.state.usersNeedHelp.length >= 1) {
            let needsHelp = this.state.usersNeedHelp.map((user, index) => {
                    return <div className="card" id={user} onClick={this.takeUser} key={index}>
                        <h5 id={user}>Bruger:{user.split(":")[0]}</h5>
                        <h5 id={user}>Spørgsmål: {user.split(":")[1]}</h5>
                    </div>
                }
            )
            return needsHelp;
        }
    }

    sendFile = () => {
        var file = this.state.file[0];
        let msg = JSON.stringify({
            "toProfile": this.state.toProfile,
            'fromProfile': this.state.user.username,
            'command': 'file',
            'content': file.name
        });
        getConnection().send(file);
        getConnection().send(msg);
    }

    sendMessage = () => {

        if (this.state.file.length > 0) {
            this.sendFile();
        }
        this.setState({
            message: '',
            file: []
        })
        let msg = JSON.stringify({
            "toProfile": this.state.toProfile,
            'fromProfile': this.state.user.username,
            'command': this.state.command,
            'content': this.state.message,
        })
        if (this.state.message.length >= 1) {
            getConnection().send(msg)
        }
    }

    handleChange = (e) => {
        this.setState({
            [e.target.id]: e.target.value
        });
    };


    handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            this.sendMessage();
        }
    }

    handleDc = (e) => {
        let msg = JSON.stringify({
            "toProfile": 'server',
            'fromProfile': this.state.user.username,
            'command': 'release',
            'content': e.target.id,

        });
        this.setState({toProfile: ''});
        getConnection().send(msg);
    }

    setFile = (e) => {
        this.setState({file: e.target.files});
    }

    addSmiley = (e) => {
        this.setState((prevState) => ({message: prevState.message + e}));
    }


    render() {

        if (this.state.disconnected || this.state.redirect) {
            return (
                <Redirect to={'/'}/>
            );
        };

        if (this.state.loading) {
            return (
                <div>Fancy loading screen here</div>
            )
        }
        return (
            <div style={{backgroundColor: "#f2f2f2", minHeight: "100vh"}}>
                <Navbar user={this.state.user} close={this.closeWebsocket}/>
                <div className="container">
                    <br/>
                    <div className="row">
                        <div className="col-9">
                            <br/>
                            <ChatArea chat={this.state.user.messages}/>
                            <br/>
                        </div>
                        <div className="col-3">
                            {this.state.users.length > 0 ?
                                <UserList users={this.state.users} handleList={this.handleList}
                                          handleDc={this.handleDc}/> : ""}
                            {this.renderNeedsHelp()}
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-9">
                            <ToolBar checkFile={this.state.file} file={this.setFile} smiley={this.addSmiley}/>
                            <textarea className="form-control"
                                      placeholder="Write a message ..."
                                      id="message"
                                      cols="100" rows="3"
                                      onKeyDown={this.handleKeyPress}
                                      value={this.state.message}
                                      style={{
                                          backgroundColor: "#f8f9fa",
                                          boxShadow: "0px 5px 10px 10px rgba(224,224,224,1)",
                                          overflowX: "hidden"
                                      }}
                                      onChange={this.handleChange}/>
                        </div>
                    </div>
                    <br/>
                    <input className="btn btn-secondary" type="button" onClick={() => this.sendMessage()}
                           value='Send message' style={{color:"#a3ecff"}}/>
                </div>
            </div>
        );
    }
}

export default Chat;