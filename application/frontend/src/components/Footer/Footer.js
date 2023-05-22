//Imports
import React from "react";
import "./Footer.css";

//Footer Component, used to render the page footer at the bottom of the page
const Footer = () => {

  //return function containing JSX markup to display the UI elements
  return (
    <footer className="footer">
      <div className="footer-section">
        <h3 className="footer-title">See any issues? Contact us at:</h3>
        <ul className="footer-list">
          <li>Email: jem20gcu@uea.ac.uk</li>
        </ul>
      </div>
      <hr />
      <p className="footer-copyright">MyLibrary</p>
    </footer>
  );
};

export default Footer;
