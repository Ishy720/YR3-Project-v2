import React, { createContext, useContext, useState } from "react";

const AppContext = createContext();

const AppProvider = ({ children }) => {
  
  //user state to check if user is logged in
  const [user, setUser] = useState(false);
  const [auth, setAuth] = useState(
    Boolean(sessionStorage.getItem("authenticated"))
  );

  if (sessionStorage.getItem("authenticated") === true) {
    setUser(true);
  }

  if (sessionStorage.getItem("authenticated") === false) {
    setUser(false);
  }

  //return global functions for all pages to use
  return (
    <AppContext.Provider value={{ user, setUser, auth, setAuth }}>
      {children}
    </AppContext.Provider>
  );
};

//Exports
export const useGlobalContext = () => {
  return useContext(AppContext);
};

export { AppProvider, AppContext };
