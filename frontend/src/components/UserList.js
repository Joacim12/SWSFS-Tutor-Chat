import React, {Component} from 'react';

class UserList extends Component {

    state = {
        active: ''
    }

    handleList = (e) => {
        this.setState({
            active: e.target.id
        })
        this.props.handleList(e)
    }

    color = (e) => {
        if (e === this.state.active) {
            return '#f0ad4e'
        }
    }

    renderUsers = () => {
        let users = this.props.users.map((user, index) => {
            return (
                <div key={index} id={user} className="card"
                     style={{cursor: 'pointer', backgroundColor: this.color(user)}}>
                    <h5 onClick={this.handleList} id={user}> {user}</h5>
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
