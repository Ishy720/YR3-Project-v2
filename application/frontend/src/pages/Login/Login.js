import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../../components/LoginForm/LoginForm";
import "./Login.css";
import { useGlobalContext } from "../../context";
const Login = () => {
  const { auth } = useGlobalContext();
  const navigate = useNavigate();


  // useEffect(() => {
  //   //if user logged in, redirect them back to discover page
  //   // if(sessionStorage.getItem("authenticated") != null && sessionStorage.getItem("authenticated") == true) {
  //   //   navigate("/discover");

  //   // }
  //   if (auth) {
  //     navigate("/discover");
  //   }
  // }, []);

  useEffect(() => {
    if (auth) {
      navigate("/discover");
    }
  }, []);

  return (
    <div>
      <h1 id="pageTitle">Login</h1>
      <LoginForm />
    </div>
  );
};

export default Login;
