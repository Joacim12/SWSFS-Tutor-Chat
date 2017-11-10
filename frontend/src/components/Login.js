import React, {Component} from 'react';
import {Link} from 'react-router-dom'

class Login extends Component {

    state = {
        username: '',
    }
    handleInput = (event) => {
        this.setState({
            [event.target.name]: event.target.value
        })
    }

    render() {
        return (
            <div>
                <div className="row">
                    <div className="col"></div>
                    <div className="col">
                        <br/>
                        <input className="form-control" onChange={this.handleInput} type="text"
                               placeholder="Username" name="username"/>
                        <br/>
                        <Link className="btn btn-warning" value="Connect" username={this.state.username}
                              to={{
                                  pathname: "/TutorChat/chat",
                                  username: this.state.username,
                              }}>Connect</Link>
                        <Link style={{margin:"10px"}}className="btn btn-warning" value="Create user " username={this.state.username}
                              to={{
                                  pathname: "/TutorChat/chat",
                                  username: this.state.username,
                              }}>Create user</Link>
                        <br/>
                        <hr/>
                        <h4>Tutors online:0</h4>

                    </div>
                    <div className="col"></div>
                </div>
            </div>
        );
    }
}

export default Login;
