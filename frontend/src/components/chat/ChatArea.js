import React, {Component} from 'react';


class ChatArea extends Component {

    renderChat = () => {
        return this.props.chat.map((message, index) => {
            return (
                <div className="container" key={index}>
                    <div className="row">
                        <div>
                            <i className="material-icons" style={{paddingTop: "10px", paddingLeft: "10px"}}>account_circle</i>
                        </div>
                        <div className="col-11">
                            <p style={{margin: "0px"}}>
                                <span style={{color: "#62baf0"}}>{message.fromProfile}</span>
                                <span style={{color: "#dcdbde"}}>{message.time}</span>
                            </p>
                            {message.command === 'file' ?

                                <a href={message.content.split(";")[1]} style={{margin: "0px"}}
                                   download={message.content.split(";")[0]}>{message.content.split(";")[0]}</a>
                                : <p style={{margin: "5px", fontSize: "15px"}}>{message.content}</p>}
                        </div>
                    </div>
                </div>
            )
        })

    }

    componentDidMount(){
        this.scroll();
    }

    componentDidUpdate (){
        this.scroll()
    }

    scroll = () => {
        let textArea = document.getElementById('chat');
        textArea.scrollTop = textArea.scrollHeight;
    }

    render = () => {
        return (
            <div className="form-control" id="chat"
                 style={{
                     overflowY: "scroll",
                     overflowX: "hidden",
                     maxHeight: "300px",
                     height: "300px",
                     backgroundColor: "#f8f9fa",
                     boxShadow: "0px 5px 10px 10px rgba(224,224,224,1)"
                 }}>
                {this.renderChat()}
            </div>
        )
    }
}

export default ChatArea;
