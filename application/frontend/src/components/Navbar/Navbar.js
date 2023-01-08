import React, { useState, useEffect } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useGlobalContext } from "../../context";
import axios from "axios";

import "./Navbar.css";

const Navbar = () => {

  const { auth, setAuth } = useGlobalContext();
  const navigate = useNavigate();


  //this determines view state of navbar depending on if user is authenticated
  // const [userAuth, setUserAuth] = useState(false);

  function logoutFunction() {
    axios.get("http://localhost:8080/logout").then((res) => {
      sessionStorage.removeItem("authenticated");
      setAuth(sessionStorage.getItem("authenticated"));
      navigate("/login");
    });
  }

  // useEffect(() => {
  //   //Website loaded for first time, no session variables set
  //   if(sessionStorage.length === 0) {
  //     //make authenticated variable and set to false
  //     sessionStorage.setItem("authenticated", false);
  //     setUserAuth(false);
  //   }
  //   //Check if auth variable exists and is true to update state
  //   if(sessionStorage.getItem("authenticated") !== null && sessionStorage.getItem("authenticated") === true) {
  //     setUserAuth(true);
  //   }
  //   //Check if auth variable exists and is false to update state
  //   if(sessionStorage.getItem("authenticated") !== null && sessionStorage.getItem("authenticated") === false) {
  //     setUserAuth(false);
  //   }

  // }, []);

  //Conditional rendering depending on if user is logged in or not.
  return (
    <header>
      <nav>
        <div className="nav-links">
          {auth ? (
            <>
              <Link to="/"> Home</Link> <Link to="about">About</Link>
              <Link to="/discover"> Discover</Link>
              <Link to="books">Books</Link>
            </>
          ) : (
            <>
              <Link to="/"> Home</Link> <Link to="about">About</Link>
            </>
          )}
        </div>
        <div className="auth-links">
          {auth ? (
            <button onClick={logoutFunction}>Logout</button>
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
