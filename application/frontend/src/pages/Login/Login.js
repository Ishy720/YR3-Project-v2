//Imports
import React from "react";
import LoginForm from "../../components/LoginForm/LoginForm";
import "./Login.css";

//Login Component
const Login = () => {

  //return function containing JSX markup to display the UI elements
  return (
    <div className="login-background-con">
      {/* Renders login form component */}
      <LoginForm />
    </div>
  );
};

export default Login;
