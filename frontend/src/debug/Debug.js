import React, {Component} from 'react';

const webSocket = require("../../package.json").webSocket;

class Debug extends Component {

    state = {
        connection: null,
        profileList: [],
        messages: [],
        showToken: false,
    }

    componentDidMount() {
        let connection = new WebSocket(webSocket + "debug");
        this.setState({connection: connection}, () => {
            connection.onmessage = this.handleMessage;
        })
    }


    componentDidUpdate (){
        this.scroll()
    }

    scroll = () => {
        let messages = document.getElementById('message');
        messages.scrollTop = messages.scrollHeight;
    }

    handleMessage = (message) => {
        let msg = JSON.parse(message.data);
        console.log(msg)
        if (msg.command === "onlineProfiles") {
            this.setState({profileList: msg.profiles});
        } else if (msg.command === "message") {
            console.log(msg)
            this.setState(prevState => ({messages: [...prevState.messages, msg.message]}));
        }
    }

    renderUsers = () => {
        return this.state.profileList.map((profile, index) => {
            return (
                <tr key={index}>
                    <td>{profile.username}</td>
                    <td>{profile.tutor.toString()}</td>
                    <td style={{wordWrap:"break-word",maxWidth:300}} onClick={() => {
                        this.setState({showToken: !this.state.showToken})
                    }}>
                        {this.state.showToken ?  profile.token : "Click to see"}
                    </td>
                    <td>{profile.assignedTutor}</td>
                </tr>
            )
        })
    }

    renderMessages = () => {
        return this.state.messages.map((message, index) => {
            return (
                <tr key={index}>
                    <td>{message.toProfile}</td>
                    <td>{message.fromProfile}</td>
                    <td>{message.command}</td>
                    <td>{message.content}</td>
                </tr>
            )
        })
    }


    render() {
        return (
            <div style={{
                color: "#5bd5f4",
                backgroundColor: "black",
                height: "100%",
                width: "100%",
                left: 0,
                top: 0,
                overflow: "hidden",
                position: "fixed"
            }}>
                <div className="container-fluid">
                    <h1>Stats</h1>
                    <h5>Websocket URL: {webSocket}</h5>
                    <hr style={{borderColor: "white"}}/>
                    <div className="row">
                        <div className="col-md-6">
                            <h5>online users:</h5>
                            <div style={{
                                overflowY: "auto",
                                overflowX: "hidden",
                                maxHeight: "300px",
                                height: "300px",
                            }}>
                                <table className="table table-bordered">
                                    <tbody>
                                    <tr>
                                        <th>Username</th>
                                        <th>Tutor</th>
                                        <th>Push Token</th>
                                        <th>Assigned tutor</th>
                                    </tr>
                                    {this.renderUsers()}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <h5>Realtime messages:</h5>

                            <div id="message" style={{
                                overflowY: "auto",
                                overflowX: "hidden",
                                maxHeight: "300px",
                                height: "300px",
                            }}>
                                <table className="table table-bordered">
                                    <tbody>
                                    <tr>
                                        <th>toProfile</th>
                                        <th>fromProfile</th>
                                        <th>command</th>
                                        <th>content</th>
                                    </tr>
                                    {this.renderMessages()}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Debug;
