import React, { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGlobalContext } from "../../context";
import axios from "axios";

import "./Navbar.css";
import { FaBars, FaTimes } from "react-icons/fa";

const Navbar = () => {
  const { auth, setAuth, user, setUser, accountType } = useGlobalContext();
  const navigate = useNavigate();

  function logoutFunction() {
    const token = sessionStorage.getItem("token");
    axios
      .get("http://localhost:8080/logout", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        sessionStorage.removeItem("authenticated");
        sessionStorage.removeItem("accountType");
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("token");
        setAuth(false);
        setUser(null);
        navigate("/login");
      });
  }

  /*
  function logoutFunction() {
    axios.get("http://localhost:8080/logout").then((res) => {
      sessionStorage.removeItem("authenticated");
      sessionStorage.removeItem("accountType");
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("token");
      setAuth(sessionStorage.getItem("authenticated"));
      setUser(sessionStorage.getItem("user"));
      navigate("/login");
    });
  }*/

  const sideBar = useRef();

  const handleToggleSideBar = () => {
    sideBar.current.classList.toggle("show-navlinks");
  };

  //Conditional rendering depending on if user is logged in or not.
  return (
    <nav>
      <div className="nav-center">
        <FaBars className="nav-toggle" onClick={handleToggleSideBar} />
        <ul className="nav-links" ref={sideBar}>
          <FaTimes className="nav-close" onClick={handleToggleSideBar} />
          <li onClick={handleToggleSideBar}>
            <Link to="/">Home</Link>
          </li>
          {user && (
            <li onClick={handleToggleSideBar}>
              <Link to="/discover">Discover</Link>
            </li>
          )}
          {user && (
            <li onClick={handleToggleSideBar}>
              <Link to="/books">Books</Link>
            </li>
          )}
          {user && (
            <li onClick={handleToggleSideBar}>
              <Link to="/suggested">Suggested</Link>
            </li>
          )}
          {user && accountType == "MANAGER" && (
            <li onClick={handleToggleSideBar}>
              <Link to="/manager">Manage</Link>
            </li>
          )}
          {user && accountType == "ADMIN" && (
            <li onClick={handleToggleSideBar}>
              <Link to="/manager">Manage</Link>
            </li>
          )}
          {user && accountType == "ADMIN" && (
            <li onClick={handleToggleSideBar}>
              <Link to="/admin">Admin</Link>
            </li>
          )}
        </ul>
        <div className="auth">
          {user ? (
            <>
              <p className="welcome-text">
                Welcome <span>{user.user}</span>
              </p>
              <button className="logout-btn" onClick={logoutFunction}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">
                <button className="login-btn">Login</button>
              </Link>
              <Link to="/register">
                <button className="register-btn">Register</button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

{
  /* <header>
<nav className="navbarClass">
  <div className="nav-links">

    {auth === true ? (
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
    {auth === true ? (
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
</header> */
}
