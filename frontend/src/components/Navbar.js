import React, {Component} from 'react';

class App extends Component {

    state = {isHovered: false};

    handleHover = () => {
        this.setState({
            isHovered: !this.state.isHovered
        }, console.log(this.state));
    }

    render() {
        const iClass = this.state.isHovered ? "#e4e2e5" : "";
        if (this.props.username !== undefined) {
            return (
                <nav className="navbar navbar-expand-lg navbar-light bg-light"
                     style={{backgroundColor: "#f8f9fa", boxShadow: "0px 25px 73px -26px rgba(13,10,212,1)"}}>
                    <div className="container">
                        <a className="navbar-brand" href="#">TutorChat</a>
                        <ul className="navbar-nav mr-auto">
                            <li className="nav-item active">
                                <a className="nav-link" href="#">Home <span className="sr-only">(current)</span></a>
                            </li>
                        </ul>

                        <div className="dropdown" onMouseEnter={this.handleHover} onMouseLeave={this.handleHover}
                             style={{backgroundColor: iClass}}>
                                <span className="dropdown-toggle" id="dropdownMenu2" data-toggle="dropdown">
                                    <i className="material-icons md-dark float-left">face</i>
                                    {this.props.username}
                                    </span>
                            <div className="dropdown-menu" aria-labelledby="dropdownMenu2">
                                <button className="dropdown-item" data-toggle="modal" data-target=".bd-example-modal-lg"
                                        type="button">Profile
                                </button>
                                <button className="dropdown-item" type="button">Sign out</button>
                            </div>
                        </div>


                    </div>
                    <div className="modal fade bd-example-modal-lg" tabIndex="-1" role="dialog"
                         aria-labelledby="myLargeModalLabel" aria-hidden="true">
                        <div className="modal-dialog modal-lg">
                            <div className="modal-content">
                                <h1>Hey {this.props.username}</h1>
                            </div>
                        </div>
                    </div>
                </nav>

            )
        }
        return (
            <nav className="navbar navbar-light"
                 style={{backgroundColor: "#f8f9fa", boxShadow: "0px 25px 73px -26px rgba(13,10,212,1)"}}>
                <div className="container">
                    <a className="navbar-brand" href="#">TutorChat</a>
                </div>
            </nav>
        )
    }
}

export default App;
