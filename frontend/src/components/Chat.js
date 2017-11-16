import React, {Component} from 'react';
import {Redirect} from 'react-router-dom'
import UserList from "./UserList";
import Navbar from "./Navbar";
import beep from "./beep.wav"
import ChatArea from "./ChatArea";
import ToolBar from "./ToolBar";

class Chat extends Component {

    state = {
        connection: null, users: [], textArea: '',
        username: this.props.location.username, message: '',
        disconnected: false, to: null,
        command: 'message', usersNeedHelp: [],
        file: [], blobUrl: '', messages: []
    }

    componentDidMount = () => {
        if (this.state.username !== undefined) {
            // let connection = new WebSocket("ws://localhost:8084/TutorChat/chat/" + this.state.username);
            let connection = new WebSocket("wss://vetterlain.dk/TutorChat/chat/" + this.state.username);
            this.setState({
                connection: connection
            })
            connection.onmessage = this.handleMessage;
        }
    }

    componentDidUpdate = () => {
        if (this.state.connection.readyState >= 2) {
            this.setState({
                disconnected: true
            })
        }
    }

    handleMessage = (e) => {
        if (e.data.constructor === Blob) {
            this.setState({blobUrl: URL.createObjectURL(e.data)})
        } else {
            let message = JSON.parse(e.data);
            console.log(message)
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
                    to: message.content,
                    textArea: chatMessages
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
        this.setState({to: e.target.id.split(":")[0]})
    }

    takeUser = (user) => {
        let msg = JSON.stringify({
            'from': this.state.username,
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
            'to': this.state.to,
            'from': this.state.username,
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
            'to': this.state.to,
            'from': this.state.username,
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
            this.sendMessage();
        }
    }

    handleDc = (e) => {
        let msg = JSON.stringify({
            'to': 'server',
            'from': this.state.username,
            'command': 'release',
            'content': e.target.id

        })
        this.setState({to: ''})
        this.state.connection.send(msg);
    }

    setFile=(e)=>{
        this.setState({file:e.target.files});
    }

    addSmiley=(e)=>{
        this.setState((prevState)=>({message:prevState.message + e}))
    }


    render = () => {
        if (this.state.username === undefined || this.state.disconnected) {
            return (
                <Redirect to={'/TutorChat/'}/>
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
                                          overflowX:"hidden"
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