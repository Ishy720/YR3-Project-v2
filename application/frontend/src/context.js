import axios from "axios";
import React, { createContext, useContext, useState } from "react";

const AppContext = createContext();

const AppProvider = ({ children }) => {
  console.log("App context called");
  //user state to check if user is logged in
  const [user, setUser] = useState(JSON.parse(sessionStorage.getItem("user")));
  const [auth, setAuth] = useState(Boolean(sessionStorage.getItem("authenticated")));

  const [toreadlist, setToReadList] = useState([]);
  const [currentlyReadingList, setCurrentlyReadingList] = useState([]);
  const [finishedList, setFinishedList] = useState([]);

  const addToreadList = async (userId, bookId) => {
    return axios
      .patch(`http://localhost:8080/toreadlist/${userId}/${bookId}`)
      .catch((err) => {
        return err.response;
      });
  };
  const addToCurrentlyReadingList = async (userId, bookId) => {
    return axios
      .patch(`http://localhost:8080/currentlyreadinglist/${userId}/${bookId}`)
      .catch((err) => {
        return err.response;
      });
  };
  const addToFinishedList = async (userId, bookId) => {
    return axios
      .patch(`http://localhost:8080/finishedlist/${userId}/${bookId}`)
      .catch((err) => {
        return err.response;
      });
  };

  const getToReadList = async (userId) => {
    return axios
      .get(`http://localhost:8080/list/toread/${userId}`)
      .catch((err) => {
        return err.response;
      });
  };
  const getCurrentlyReadingList = async (userId) => {
    return axios
      .get(`http://localhost:8080/list/currentlyreading/${userId}`)
      .catch((err) => {
        return err.response;
      });
  };
  const getFinishedList = async (userId) => {
    return axios
      .get(`http://localhost:8080/list/finished/${userId}`)
      .catch((err) => {
        return err.response;
      });
  };

  const deletebook = async (userId, bookId) => {
    axios
      .patch(`http://localhost:8080/delete/${userId}/${bookId}`)
      .then((res) => {
        setFinishedList(res.data.finishedList);
        setToReadList(res.data.toReadList);
        setCurrentlyReadingList(res.data.currentlyReadingList);
        console.log(res);
      })
      .catch((err) => {
        console.log(err.response);
      });
  };

  //return global functions for all pages to use
  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        auth,
        setAuth,
        addToreadList,
        addToCurrentlyReadingList,
        addToFinishedList,
        getToReadList,
        getCurrentlyReadingList,
        getFinishedList,
        toreadlist,
        setToReadList,
        currentlyReadingList,
        setCurrentlyReadingList,
        finishedList,
        setFinishedList,
        deletebook,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

//Exports
export const useGlobalContext = () => {
  return useContext(AppContext);
};

export { AppProvider, AppContext };
