import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import RegisterForm from "../../components/RegisterForm/RegisterForm";
import { useGlobalContext } from "../../context";

const Register = () => {
  const { auth } = useGlobalContext();

  const navigate = useNavigate();
  useEffect(() => {
    if (auth) {
      navigate("/discover");
    }
  }, []);
  // useEffect(() => {
  //   //if user logged in, redirect them back to discover page
  //   if(sessionStorage.getItem("authenticated") !== null && sessionStorage.getItem("authenticated") === true) {
  //     navigate("/discover");
  //   }
  // }, []);

  return (
    <div>
      <h1 id="pageTitle">Register</h1>
      
      <RegisterForm />
    </div>

  );
}

export default Register