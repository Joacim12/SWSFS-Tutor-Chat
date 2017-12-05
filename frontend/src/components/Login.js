import React, {Component} from 'react';
import {Redirect} from 'react-router-dom'
import Navbar from "./Navbar";



class Login extends Component {

    state = {
        username: '',
        redirect:false,
    }
    handleInput = (event) => {
        this.setState({
            [event.target.name]: event.target.value
        })
    }

    handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            this.setState({redirect:true})
        }
    }

    connect=()=>{
        this.setState({redirect:true})
    }

    render() {
        if(this.state.redirect===true){
            return(
                <Redirect to={{pathname:"/chat",state:{username:this.state.username}}}/>
            )
        }
        return (
            <div>
                <Navbar/>
                <br/>
                <h2 className="text-center">Welcome to TutorChat</h2>
                <div className="row">
                    <div className="col"></div>
                    <div className="col">
                        <br/>
                        <input onKeyUp={this.handleKeyPress} className="form-control" onChange={this.handleInput} type="text"
                               placeholder="Username" name="username"/>
                        <br/>
                        <button className="btn btn-secondary" value="Connect" onClick={this.connect}>Connect</button>
                        {/*<Link style={{margin: "10px"}} className="btn btn-warning" value="Create user "*/}
                        {/*username={this.state.username}*/}
                        {/*to={{*/}
                        {/*pathname: "/TutorChat/chat",*/}
                        {/*username: this.state.username,*/}
                        {/*}}>Create user</Link>*/}
                        <br/>
                        <hr/>
                        {/*<h4>Tutors online:0</h4>*/}

                    </div>
                    <div className="col"></div>
                </div>
            </div>
        );
    }
}

export default Login;
