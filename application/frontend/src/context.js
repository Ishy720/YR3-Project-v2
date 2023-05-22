/*
  This file contains most of the common functions the application globally requires for functionality. It contains variables and functions 
  for the user's account, the books they select, their reading lists and the render states for overlays.
*/

//Imports
import axios from "axios";
import React, { createContext, useContext, useState } from "react";

const AppContext = createContext();

const AppProvider = ({ children }) => {

  //user information states
  const [user, setUser] = useState(JSON.parse(sessionStorage.getItem("user")));
  const [auth, setAuth] = useState(Boolean(sessionStorage.getItem("authenticated")));
  const [accountType, setAccountType] = useState(sessionStorage.getItem("accountType"));

  //book list states
  const [toReadList, setToReadList] = useState([]);
  const [currentlyReadingList, setCurrentlyReadingList] = useState([]);
  const [finishedList, setFinishedList] = useState([]);
  const [customListNames, setCustomlistNames] = useState([]);
  const [customList, setCustomlist] = useState([]);

  //modal view states
  const [showCustomListModal, setShowCustomListModal] = useState(false);
  const [showSelectListModal, setShowSelectListModal] = useState(false);
  const [showBookInfoModal, setShowBookInfoModal] = useState(false);

  const [bookInformation, setBookInformation] = useState({
    _id: '',
    title: '',
    author: '',
    releaseDate: '',
    description: '',
    imgurl: '',
    genres: [],
    avgRating: '',
    likedPercentage: '',
    ratingDistribution: []
  });

  //related states
  const [selectedBook, setSelectedBook] = useState("");
  const [relatedByGenre, setRelatedByGenre] = useState([]);
  const [relatedByAuthor, setRelatedByAuthor] = useState([]);

  //function responsible for adding a book to a user's to-read list
  const addToReadList = async (userId, bookId) => {
    const token = sessionStorage.getItem("token");
    const headers = {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    };
    const data = { bookId: bookId };
    try {
      const response = await axios.patch(`http://localhost:8080/toreadlist/${userId}/${bookId}`, data, { headers });
      return response;
    } catch (err) {
      return err.response;
    }
  };

  //function responsible for adding a book to a user's currently-reading list
  const addToCurrentlyReadingList = async (userId, bookId) => {
    const token = sessionStorage.getItem("token");
    const headers = {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    };
    return axios
      .patch(`http://localhost:8080/currentlyreadinglist/${userId}/${bookId}`, {}, { headers })
      .catch((err) => {
        return err.response;
      });
  };

  //function responsible for adding a book to a user's finished-reading list
  const addToFinishedList = async (userId, bookId) => {
    const token = sessionStorage.getItem("token");
    const headers = {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    };
    const data = { bookId: bookId };
    try {
      const response = await axios.patch(`http://localhost:8080/finishedlist/${userId}/${bookId}`, data, { headers });
      return response;
    } catch (err) {
      return err.response;
    }
  };

  //function responsible for returning a user's to-read list
  const getToReadList = async (userId) => {
    const token = sessionStorage.getItem("token");
    const headers = {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    };
    try {
      const response = await fetch(`http://localhost:8080/list/toread/${userId}`, {
        method: "GET",
        headers: headers,
      });
      const data = await response.json();
      return data;
    } catch (err) {
      console.error(err);
    }
  };

  //function responsible for returning a user's currently-reading list
  const getCurrentlyReadingList = async (userId) => {
    const token = sessionStorage.getItem("token");
    const headers = {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    };
    return axios
      .get(`http://localhost:8080/list/currentlyreading/${userId}`, { headers })
      .catch((err) => {
        return err.response;
      });
  };

  //function responsible for returning a user's finished-reading list
  const getFinishedList = async (userId) => {
    const token = sessionStorage.getItem("token");
    const headers = {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    };
    return axios
      .get(`http://localhost:8080/list/finished/${userId}`, { headers })
      .catch((err) => {
        return err.response;
      });
  };

  //function responsible for deleting a book from a user's core reading lists
  const deleteBook = async (userId, bookId) => {
    const token = sessionStorage.getItem("token");
    const headers = {
      "Authorization": `Bearer ${token}`
    };
    axios
      .patch(`http://localhost:8080/delete/${userId}/${bookId}`, null, { headers })
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

  //function responsible for creating a custom list for a user
  const createCustomList = async (userId, listName) => {
    const token = sessionStorage.getItem("token");
    const headers = {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    };
    try {
      const response = await axios.post(`http://localhost:8080/createcustomlist/${userId}`, { listName }, { headers });
      return response.data;
    } catch (err) {
      return err.response.data;
    }
  };

  //function responsible for deleting a user's specified custom list
  const deleteCustomList = async (userId, listName) => {
    const token = sessionStorage.getItem("token");
    return axios
      .patch(`http://localhost:8080/deletecustomlist/${userId}`, { listName }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        return err.response.data;
      });
  };

  //function responsible for returning a user's custom reading lists
  const getCustomList = async (userId) => {
    try {
      const response = await axios.get(`http://localhost:8080/customlist/${userId}`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });
      setCustomlistNames(Object.keys(response.data.customList));
      setCustomlist(response.data.customList);
    } catch (err) {
      console.log(err);
    }
  };

  //function responsible for adding a book to a user's specified custom list
  const addBookToCustomList = async (userId, bookId, list) => {
    const token = sessionStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };
  
    return axios
      .patch(
        `http://localhost:8080/customlist/addbook/${userId}/${bookId}?list=${list}`,
        {},
        { headers }
      )
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        return err.response.data;
      });
  };

  //function responsible for deleting a specific book from a user's specific custom reading list
  const deleteBookFromCustomList = async (userId, bookId, list) => {
    const token = sessionStorage.getItem("token");
    return axios
      .patch(
        `http://localhost:8080/customlist/removebook/${userId}/${bookId}?list=${list}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        return err.response.data;
      });
  };

  //function responsible for returning a user's related books by genres
  const getRelatedByGenre = async (userId) => {
    const token = sessionStorage.getItem("token");
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };
  
    return axios
      .get(`http://localhost:8080/relatedbygenre/${userId}`, config)
      .then((res) => {
        console.log(res.data);
        if (res.data.filterBooks) {
          setRelatedByGenre(res.data.filterBooks);
        } else {
          setRelatedByGenre([]);
        }
        return;
      })
      .catch((err) => console.log(err));
  };

  //function responsible for returning a user's related books by authors
  const getRelatedByAuthor = async (userId) => {
    const token = sessionStorage.getItem("token");
    return axios
      .get(`http://localhost:8080/relatedbyauthor/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        console.log(res.data);
        if (res.data.filterBooks) {
          setRelatedByAuthor(res.data.filterBooks);
        } else {
          setRelatedByAuthor([]);
        }
        return;
      })
      .catch((err) => console.log(err));
  };

  //return global functions for all pages to use
  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        auth,
        setAuth,
        accountType,
        setAccountType,
        addToReadList,
        addToCurrentlyReadingList,
        addToFinishedList,
        getToReadList,
        getCurrentlyReadingList,
        getFinishedList,
        toReadList,
        setToReadList,
        currentlyReadingList,
        setCurrentlyReadingList,
        finishedList,
        setFinishedList,
        deleteBook,
        createCustomList,
        deleteCustomList,
        getCustomList,
        customListNames,
        customList,
        showCustomListModal,
        setShowCustomListModal,
        showSelectListModal,
        setShowSelectListModal,
        selectedBook,
        setSelectedBook,
        addBookToCustomList,
        deleteBookFromCustomList,
        getRelatedByGenre,
        relatedByGenre,
        relatedByAuthor,
        getRelatedByAuthor, 
        showBookInfoModal,
        setShowBookInfoModal,
        bookInformation,
        setBookInformation
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
