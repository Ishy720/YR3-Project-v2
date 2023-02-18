import React from "react";
import { Navigate } from "react-router-dom";

//Desired route 'children', middleware to ensure user is logged in, if not direct them to login
const ManagerProtected = ({ children }) => {
  if (sessionStorage.getItem("accountType") === null || sessionStorage.getItem("accountType") !== "MANAGER") {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default ManagerProtected;
