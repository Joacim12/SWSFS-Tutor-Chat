import React, {Component} from 'react';
import {Redirect} from 'react-router-dom'
import UserList from "./UserList";
import Navbar from "./Navbar";
import beep from "./beep.wav"

class Chat extends Component {

    state = {
        connection: null,
        users: [],
        textArea: '',
        username: this.props.location.username,
        message: '',
        disconnected: false,
        to: null,
        command: 'message',
        usersNeedHelp: []
    }

    componentDidMount = () => {
        if (this.state.username !== undefined) {
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
        } else {
            this.scroll();
        }
    }

    handleMessage = (e) => {
        let res = JSON.parse(e.data);
        let date = new Date();
        if (res.command === 'needHelp') {
            if (res && res.content) {
                new Audio(beep).play();
                this.setState({
                    usersNeedHelp: res.content.split(";")
                })
            } else {
                this.setState({usersNeedHelp: []})
            }
        } else if (res.command === 'setTutor') {
            new Audio(beep).play();
            let chatMessages = this.state.textArea;
            chatMessages += '\n' + res.content + ' connected - ' + date.getHours()+":"+date.getMinutes();
            this.setState({
                to: res.content,
                textArea: chatMessages
            })
        } else if (res.command === 'connectedUsers') {
            if (res.content.split(";")[0] === "") {
                new Audio(beep).play();
                this.setState({users: []})
            } else {
                this.setState({users: res.content.split(";")})
            }
        }
        else {
            if (res.from !== this.state.username) {
                new Audio(beep).play();
            }
            let chatMessages = this.state.textArea;
            chatMessages += "\n" + res.from + " - " + date.getHours()+":"+date.getMinutes() + "\n" + res.content;
            this.setState({
                textArea: chatMessages
            });
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

    sendMessage = () => {
        this.setState({
            message: '',
        })
        let msg = JSON.stringify({
            'to': this.state.to,
            'from': this.state.username,
            'command': this.state.command,
            'content': this.state.message

        })
        this.state.connection.send((msg))
    }

    handleChange = (e) => {
        this.setState({
            [e.target.id]: e.target.value
        })
    }

    scroll = () => {
        let textArea = document.getElementById('chat');
        textArea.scrollTop = textArea.scrollHeight;
    }

    handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            this.sendMessage('message');
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
                        <textarea className="form-control"
                                  id="chat"
                                  onChange={this.scroll}
                                  value={this.state.textArea}
                                  style={{
                                      cursor: 'text',
                                      backgroundColor: "#f8f9fa",
                                      boxShadow: "0px 5px 73px -26px rgba(13,10,212,1)"
                                  }}
                                  disabled
                                  cols="100" rows="15"
                                  placeholder="Type something!"
                        />
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
                            <textarea className="form-control"
                                      placeholder="Write a message ..."
                                      id="message"
                                      cols="100" rows="3"
                                      onKeyDown={this.handleKeyPress}
                                      value={this.state.message}
                                      style={{
                                          backgroundColor: "#f8f9fa",
                                          boxShadow: "0px 5px 73px -26px rgba(13,10,212,1)"
                                      }}
                                      onChange={this.handleChange}/>
                        </div>
                    </div>
                    <br/>
                    <input className="btn btn-warning" type="button" onClick={() => this.sendMessage('message')}
                           value='Send message'/>
                </div>
            </div>
        );
    }
}

export default Chat;
