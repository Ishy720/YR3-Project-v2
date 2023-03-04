import axios from "axios";
import React, { createContext, useContext, useState } from "react";

const AppContext = createContext();

const AppProvider = ({ children }) => {

  //user information states
  const [user, setUser] = useState(JSON.parse(sessionStorage.getItem("user")));
  const [auth, setAuth] = useState(Boolean(sessionStorage.getItem("authenticated")));
  const [accountType, setAccountType] = useState(sessionStorage.getItem("accountType"));

  //book list states
  const [toreadlist, setToReadList] = useState([]);
  const [currentlyReadingList, setCurrentlyReadingList] = useState([]);
  const [finishedList, setFinishedList] = useState([]);
  const [customListNames, setCustomlistNames] = useState([]);
  const [customList, setCustomlist] = useState([]);

  //modal view states
  const [showModal, setShowModal] = useState(false);
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

  //suggestion states
  const [selectedBook, setSelectedBook] = useState("");
  const [suggestionsByGenre, setSuggestionsByGenre] = useState([]);
  const [suggestionsByAuthor, setSuggestionsByAuthor] = useState([]);

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

  const createCustomList = async (userId, listName) => {
    return axios
      .post(`http://localhost:8080/createcustomlist/${userId}`, { listName })
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        return err.response.data;
      });
  };

  const deleteCustomList = async (userId, listName) => {
    return axios
      .patch(`http://localhost:8080/deletecustomlist/${userId}`, { listName })
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        return err.response.data;
      });
  };

  const getCustomList = async (userId) => {
    axios
      .get(`http://localhost:8080/customlist/${userId}`)
      .then((res) => {
        setCustomlistNames(Object.keys(res.data.customList));
        setCustomlist(res.data.customList);
      })
      .catch((err) => console.log(err));
  };

  const addBookToCustomList = async (userId, bookId, list) => {
    return axios
      .patch(
        `http://localhost:8080/customlist/addbook/${userId}/${bookId}?list=${list}`
      )
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        return err.response.data;
      });
  };

  const deleteBookFromCustomList = async (userId, bookId, list) => {
    return axios
      .patch(
        `http://localhost:8080/customlist/removebook/${userId}/${bookId}?list=${list}`
      )
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        return err.response.data;
      });
  };

  const getSuggestionsByGenre = async (userId) => {
    return axios
      .get(`http://localhost:8080/recommendationbygenre/${userId}`)
      .then((res) => {
        console.log(res.data);
        if (res.data.filterBooks) {
          setSuggestionsByGenre(res.data.filterBooks);
        }
        else {
          setSuggestionsByGenre([]);
        }
        return
      })
      .catch((err) => console.log(err));
  };

  const getSuggestionsByAuthor = async (userId) => {
    return axios
      .get(`http://localhost:8080/recommendationbyauthor/${userId}`)
      .then((res) => {
        console.log(res.data);
        if (res.data.filterBooks) {
          setSuggestionsByAuthor(res.data.filterBooks);
        }
        else {
          setSuggestionsByAuthor([]);
        }
        return
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
        createCustomList,
        deleteCustomList,
        getCustomList,
        customListNames,
        customList,
        showModal,
        setShowModal,
        showSelectListModal,
        setShowSelectListModal,
        selectedBook,
        setSelectedBook,
        addBookToCustomList,
        deleteBookFromCustomList,
        getSuggestionsByGenre,
        suggestionsByGenre,
        suggestionsByAuthor,
        getSuggestionsByAuthor, 
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
