import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGlobalContext } from "../../context";
import axios from "axios";

import "./Navbar.css";

const Navbar = () => {

  const { auth, setAuth, user, setUser } = useGlobalContext();
  const navigate = useNavigate();

  function logoutFunction() {
    axios.get("http://localhost:8080/logout").then((res) => {
      sessionStorage.removeItem("authenticated");
      sessionStorage.removeItem("user");
      setAuth(sessionStorage.getItem("authenticated"));
      setUser(sessionStorage.getItem("user"));
      navigate("/login");
    });
  }

  //Conditional rendering depending on if user is logged in or not.
  return (
    <header>
      <nav className="navbarClass">
        <div className="nav-links">
          {auth ? (
            <>
              <Link to="/"> Home</Link> 
              <Link to="/about">About</Link>
              <Link to="/discover"> Discover</Link>
              <Link to="/books">Books</Link>
              <Link to="/suggested">Suggested</Link>
            </>
          ) : (
            <>
              <Link to="/"> Home</Link> <Link to="about">About</Link>
            </>
          )}
        </div>
        <div className="auth-links">
          {auth ? (
            <>
            <div id="welcomeUserText">Welcome {user.user}!</div>
            <button id="logoutBtn" onClick={logoutFunction}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/register">Register</Link>
              <Link to="/login">Login</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;