import React from "react";
import { Navigate } from "react-router-dom";

//Desired route 'children', middleware to ensure user is logged in, if not direct them to login
const AdminProtected = ({ children }) => {
  if (sessionStorage.getItem("accountType") === null || sessionStorage.getItem("accountType") !== "ADMIN") {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default AdminProtected;
