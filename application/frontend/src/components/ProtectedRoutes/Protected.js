import React from "react";
import { Navigate } from "react-router-dom";

//Desired route 'children', middleware to ensure user is logged in, if not direct them to login
const Protected = ({ children }) => {
  if (sessionStorage.getItem("authenticated") === null || sessionStorage.getItem("authenticated") === false) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default Protected;
