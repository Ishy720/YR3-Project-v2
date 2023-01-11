import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGlobalContext } from "../../context";
import axios from "axios";

import "./Navbar.css";

const Navbar = () => {

  const { auth, setAuth } = useGlobalContext();
  const navigate = useNavigate();

  function logoutFunction() {
    axios.get("http://localhost:8080/logout").then((res) => {
      sessionStorage.removeItem("authenticated");
      setAuth(sessionStorage.getItem("authenticated"));
      navigate("/login");
    });
  }

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
