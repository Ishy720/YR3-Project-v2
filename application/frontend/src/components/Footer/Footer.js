import React from 'react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-section">
                    <h3 className="footer-title">About Us</h3>
                    <p className="footer-text">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam viverra euismod odio, gravida pellentesque urna varius vitae.
                    </p>
                </div>
                <div className="footer-section">
                    <h3 className="footer-title">Quick Links</h3>
                    <ul className="footer-list">
                        <li>Home</li>
                        <li>About</li>
                    </ul>
                </div>
                <div className="footer-section">
                    <h3 className="footer-title">Contact Information</h3>
                    <ul className="footer-list">
                        <li>Phone: 123456789</li>
                        <li>Email: email@email.com</li>
                    </ul>
                </div>
            </div>
            <p className="footer-copyright">Copyright &copy; Your Company 2023</p>
        </footer>
    );
};

export default Footer;
