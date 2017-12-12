import React, {Component} from 'react';
import {Redirect} from 'react-router-dom'
import UserList from "./UserList";
import Navbar from "./Navbar";
import beep from "../resources/beep.wav"
import ChatArea from "./ChatArea";
import ToolBar from "./ToolBar";
import * as firebase from "firebase"

const webSocket = require("../../package.json").webSocket;


class Chat extends Component {

    state = {
        connection: null, users: [], textArea: '',
        username: '', message: '',
        disconnected: false, toProfile: null,
        command: 'needHelp', usersNeedHelp: [],
        file: [], blobUrl: '', messages: []
    }

    componentWillMount() {
        if (this.props.location.state !== undefined && this.props.location.state.username !== undefined) {
            this.setState({username: this.props.location.state.username})
        }
    }

    componentDidMount() {
        let connection = new WebSocket(webSocket + this.state.username);
        this.setState({connection: connection},
            () => {connection.onmessage = this.handleMessage;},
            this.requestWebNotificationPermission())
    }

    componentDidUpdate() {
        if (this.state.connection.readyState >= 2) {
            this.setState({
                disconnected: true
            })
        }
    }

    requestWebNotificationPermission = () => {
        const messaging = firebase.messaging();
        messaging.requestPermission()
            .then(() => {
                messaging.getToken().then(token => {
                    let msg = JSON.stringify({
                        "toProfile": "",
                        'fromProfile': this.state.username,
                        'command': "webNoti",
                        'content': token
                    })
                    this.state.connection.send(msg);
                })
            }).catch((err) => {
            console.log(err) //No error handling :(
        })
    }

    handleMessage = (e) => {
        if (e.data.constructor === Blob) {
            this.setState({blobUrl: URL.createObjectURL(e.data)})
        } else {
            let message = JSON.parse(e.data);
            let date = new Date();
            if (message.command === 'needHelp') {
                if (message && message.content) {
                    this.setState({usersNeedHelp: message.content.split(";")})
                } else {
                    this.setState({usersNeedHelp: []})
                }
            } else if (message.command === 'file') {
                new Audio(beep).play()
                message.content += ";" + this.state.blobUrl;
                message.time = " " + new Date().toLocaleTimeString('en-GB');
                this.setState(prevState => ({messages: [...prevState.messages, message]}));
            } else if (message.command === 'setTutor') {
                let chatMessages = this.state.textArea;
                chatMessages += '\n' + message.content + ' connected - ' + date.getHours() + ":" + date.getMinutes();
                this.setState({
                    toProfile: message.content,
                    textArea: chatMessages,
                    command: 'message'
                })
            } else if (message.command === 'connectedUsers') {
                if (message.content.split(";")[0] === "") {
                    this.setState({users: []})
                } else {
                    this.setState({users: message.content.split(";")})
                }
            }
            else {
                new Audio(beep).play()
                message.time = " " + new Date().toLocaleTimeString('en-GB');
                this.setState(prevState => ({messages: [...prevState.messages, message]}));
            }
        }
    }

    handleList = (e) => {
        this.setState({toProfile: e.target.id.split(":")[0]})
    }

    takeUser = (user) => {
        this.setState({command: "message"})
        let msg = JSON.stringify({
            'fromProfile': this.state.username,
            'command': "take",
            'content': user.target.id
        })
        this.state.connection.send(msg)
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
            'fromProfile': this.state.username,
            'command': 'file',
            'content': file.name
        })
        this.state.connection.send(file);
        this.state.connection.send(msg);
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
            'fromProfile': this.state.username,
            'command': this.state.command,
            'content': this.state.message,
        })
        if (this.state.message.length >= 1) {
            this.state.connection.send((msg))
        }
    }

    handleChange = (e) => {
        this.setState({
            [e.target.id]: e.target.value
        })
    }


    handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            this.sendMessage();
        }
    }

    handleDc = (e) => {
        let msg = JSON.stringify({
            "toProfile": 'server',
            'fromProfile': this.state.username,
            'command': 'release',
            'content': e.target.id

        })
        this.setState({toProfile: ''})
        this.state.connection.send(msg);
    }

    setFile = (e) => {
        this.setState({file: e.target.files});
    }

    addSmiley = (e) => {
        this.setState((prevState) => ({message: prevState.message + e}))
    }


    render() {
        if (this.state.username.length <= 0 || this.state.disconnected) {
            return (
                <Redirect to={'/'}/>
            )
        }
        return (
            <div>
                <Navbar username={this.state.username}/>
                <div className="container">
                    <br/>
                    <div className="row">
                        <div className="col-9">
                            <ChatArea chat={this.state.messages}/>
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
                            <ToolBar file={this.setFile} smiley={this.addSmiley}/>
                            <textarea className="form-control"
                                      placeholder="Write a message ..."
                                      id="message"
                                      cols="100" rows="3"
                                      onKeyDown={this.handleKeyPress}
                                      value={this.state.message}
                                      style={{
                                          backgroundColor: "#f8f9fa",
                                          boxShadow: "0px 5px 73px -26px rgba(13,10,212,1)",
                                          overflowX: "hidden"
                                      }}
                                      onChange={this.handleChange}/>
                        </div>
                    </div>
                    <br/>
                    <input className="btn btn-secondary" type="button" onClick={() => this.sendMessage()}
                           value='Send message'/>
                </div>
            </div>
        );
    }
}

export default Chat;