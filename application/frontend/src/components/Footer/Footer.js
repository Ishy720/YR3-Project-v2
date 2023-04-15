import React from "react";
import "./Footer.css";

const Footer = () => {
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
