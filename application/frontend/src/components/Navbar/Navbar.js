//Imports
import React, { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGlobalContext } from "../../context";
import axios from "axios";
import "./Navbar.css";
import { FaBars, FaTimes } from "react-icons/fa";

//Navbar Component, used to render the navigation bar at the top of the application page. Dynamically updates to show the user the pages
//they can access depending on their log in state and user account type.
const Navbar = () => {

  //import required states/functions from context file
  const { setAuth, user, setUser, accountType } = useGlobalContext();

  //React navigation handler so users can navigate to pages via the URL
  const navigate = useNavigate();

  //logout handler
  function logoutFunction() {
    const token = sessionStorage.getItem("token");
    axios
      .get("http://localhost:8080/logout", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        //remove the session variables on the client about the user
        sessionStorage.removeItem("authenticated");
        sessionStorage.removeItem("accountType");
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("token");
        setAuth(false);
        setUser(null);

        //send the user back to the login page
        navigate("/login");
      });
  }
  
  //sidebar menu for smaller screens
  const sideBar = useRef();
  const handleToggleSideBar = () => {
    sideBar.current.classList.toggle("show-navlinks");
  };

  //return function containing JSX markup to display the UI elements.
  return (
    <nav>
      <div className="nav-center">
        <FaBars className="nav-toggle" onClick={handleToggleSideBar} />
        <ul className="nav-links" ref={sideBar}>
          <FaTimes className="nav-close" onClick={handleToggleSideBar} />
          <li onClick={handleToggleSideBar}>
            <Link to="/">Home</Link>
          </li>

          {/* conditional rendering depending on if user is logged in or not to show what pages they can access
              and the buttons they can click to navigate to those pages. */}
          {user && (
            <li onClick={handleToggleSideBar}>
              <Link to="/searchPage">Search</Link>
            </li>
          )}
          {user && (
            <li onClick={handleToggleSideBar}>
              <Link to="/myBooksPage">Inventory</Link>
            </li>
          )}
          {user && (
            <li onClick={handleToggleSideBar}>
              <Link to="/relatedBooksPage">Related</Link>
            </li>
          )}
          {user && accountType == "MANAGER" && (
            <li onClick={handleToggleSideBar}>
              <Link to="/manager">Manage</Link>
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
              {/* user isn't logged in, only show register and login buttons */}
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