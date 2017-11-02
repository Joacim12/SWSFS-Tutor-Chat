import React, {Component} from 'react';
import {Redirect} from 'react-router-dom'
import UserList from "./UserList";

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
            let connection = new WebSocket("ws://vetterlain.dk:8082/TutorChat/chat/" + this.state.username);
            // let connection = new WebSocket("ws://localhost:8084/TutorChat/chat/" + this.state.username);
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
        if (res.command === 'needHelp') {
            if (res && res.content) {
                this.setState({
                    usersNeedHelp: res.content.split(";")
                })
            } else {
                this.setState({usersNeedHelp: []})
            }
        } else if (res.command === 'setTutor') {
            this.setState({
                to: res.content,
                textArea: [...this.state.textArea, 'Server:' + res.content +
                ' er nu forbundet']
            })
        } else if (res.command === 'connectedUsers') {
            this.setState({users: res.content.split(";")})
        }
        else {
            let chatMessages = this.state.textArea;
            chatMessages += "\n" + res.from + ":" + res.content;
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


    render = () => {
        if (this.state.username === undefined || this.state.disconnected) {
            return (
                <Redirect to={'/TutorChat/'}/>
            )
        }
        return (
            <div>
                <h1>TutorChat</h1>
                <hr/>
                <div className="row align-items-start">
                    <div className="col-10">
                        <textarea className="form-control"
                                  id="chat"
                                  onChange={this.scroll}
                                  value={this.state.textArea}
                                  disabled
                                  cols="100" rows="15"
                                  // placeholder="Type your question to get connected"
                        />
                        <br/>
                        <div className="form-group row">
                            <label className="col-1 col-form-label">Question:</label>
                            <div className="col-11">
                            <textarea className="form-control"
                                      id="message"
                                      cols="100" rows="3"
                                      onKeyDown={this.handleKeyPress}
                                      value={this.state.message}
                                      onChange={this.handleChange}/>
                            </div>
                        </div>
                    </div>
                    <div className="col-2">
                        <UserList users={this.state.users} handleList={this.handleList}/>
                        {this.renderNeedsHelp()}
                    </div>
                </div>
                <br/>
                <input className="btn btn-warning" type="button" onClick={() => this.sendMessage('message')}
                       value='Send message'/>
            </div>
        );
    }
}

export default Chat;
