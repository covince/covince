import React, { Component } from "react";
import { NavLink } from "react-router-dom";

class NavBar extends Component {
  state = {
    collapsed: true,
  };
  handleToggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  };
  render() {
    const collapsed = this.state.collapsed;

    const classTwo = collapsed
      ? "navbar-toggler navbar-toggler-right collapsed"
      : "navbar-toggler navbar-toggler-right";
    return (
      <nav className="navbar navbar-expand-lg navbar bg-light transparent-nav">
        <div className="container">
          <NavLink className="navbar-brand" to="/">
            CovInce
          </NavLink>
          <button
            onClick={this.handleToggle}
            className={`${classTwo}`}
            type="button"
            data-toggle="collapse"
            data-target="#navbarResponsive"
            aria-controls="navbarResponsive"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" />
          </button>
          {/* <div className={`${classOne}`} id="navbarResponsive">
            <ul className="navbar-nav ml-auto">
              <li className="nav-item">
                <NavLink className="nav-link" to="/add-user">
                  Add User
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/user-list">
                  Userlist
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/status">
                  Status
                </NavLink>
              </li>
              {!this.props.user && (
                <li className="nav-item">
                  <NavLink className="nav-link" to="/register">
                    Register
                  </NavLink>
                </li>
              )}
              {!this.props.user && (
                <li className="nav-item">
                  <NavLink className="nav-link" to="/login">
                    Login
                  </NavLink>
                </li>
              )}
              {this.props.user && (
                <React.Fragment>
                  <li className="nav-item">
                    <NavLink className="nav-link" to="/profile">
                      {this.props.user.username}
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink className="nav-link" to="/logout">
                      Logout
                    </NavLink>
                  </li>
                </React.Fragment>
              )}
            </ul>
          </div> */}
        </div>
      </nav>
    );
  }
}

export default NavBar;
