//Imports
import React from "react";
import RegisterForm from "../../components/RegisterForm/RegisterForm";

//Register Component
const Register = () => {

  //return function containing JSX markup to display the UI elements
  return (
    <div className="login-background-con">
      {/* Renders register form component */}
      <RegisterForm />
    </div>
  );
};

export default Register;
