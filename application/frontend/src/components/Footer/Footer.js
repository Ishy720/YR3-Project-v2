import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-section">
        <h3 className="footer-title">Contact Information</h3>
        <ul className="footer-list">
          <li>Phone: 123456789</li>
          <li>Email: email@email.com</li>
        </ul>
      </div>
      <p className="footer-copyright">Copyright &copy; Your Company 2023</p>
    </footer>
  );
};

export default Footer;
