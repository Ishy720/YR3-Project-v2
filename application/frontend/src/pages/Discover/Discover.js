import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useGlobalContext } from "../../context";

const Discover = () => {
  
  const { auth } = useGlobalContext();
  const navigate = useNavigate();
  useEffect(() => {
    if (auth) {
      navigate("/discover");
    }
  }, []);
  // useEffect(() => {
  //   //if user logged in, redirect them back to login page
  //   if(sessionStorage.getItem("authenticated") != null && sessionStorage.getItem("authenticated") == true) {
  //     navigate("/login");
  //   }
  // }, []);

  return (
    <div>Discover</div>
  )
};

export default Discover;
