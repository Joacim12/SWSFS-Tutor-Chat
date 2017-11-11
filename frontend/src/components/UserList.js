import React, {Component} from 'react';

class UserList extends Component {

    state = {
        active: ''
    }

    handleList = (e) => {
        this.setState({
            active: e.target.id
        });
        this.props.handleList(e);
    }

    color = (e) => {
        if (e === this.state.active) {
            return '#f0ad4e';
        }
    }

    handleDc=(e)=>{
        this.props.handleDc(e);
    }

    renderUsers = () => {
        let users = this.props.users.map((user, index) => {
            return (
                <div key={index} id={user} style={{cursor: 'pointer', backgroundColor: this.color(user), border:1}}>
                    <i className="material-icons" onClick={this.handleList} id={user}>face</i>
                    <span onClick={this.handleList} id={user}> {user}</span>
                    <i className="material-icons float-right" onClick={this.handleDc} id={user}>exit_to_app</i>
                </div>
            )
        })
        return users;
    }

    render = () => {
        return (this.renderUsers())
    }
}

export default UserList;
