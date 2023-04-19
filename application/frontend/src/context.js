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

  //related 'suggestion' states
  const [selectedBook, setSelectedBook] = useState("");
  const [suggestionsByGenre, setSuggestionsByGenre] = useState([]);
  const [suggestionsByAuthor, setSuggestionsByAuthor] = useState([]);

  const addToreadList = async (userId, bookId) => {
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
  /*
  const addToreadList = async (userId, bookId) => {
    return axios
      .patch(`http://localhost:8080/toreadlist/${userId}/${bookId}`)
      .catch((err) => {
        return err.response;
      });
  };*/

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


  /*
  const addToCurrentlyReadingList = async (userId, bookId) => {
    return axios
      .patch(`http://localhost:8080/currentlyreadinglist/${userId}/${bookId}`)
      .catch((err) => {
        return err.response;
      });
  };*/

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

  /*
  const addToFinishedList = async (userId, bookId) => {
    return axios
      .patch(`http://localhost:8080/finishedlist/${userId}/${bookId}`)
      .catch((err) => {
        return err.response;
      });
  };*/

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

  /*
  const getToReadList = async (userId) => {
    return axios
      .get(`http://localhost:8080/list/toread/${userId}`)
      .catch((err) => {
        return err.response;
      });
  };*/


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

  
  /*
  const getCurrentlyReadingList = async (userId) => {
    return axios
      .get(`http://localhost:8080/list/currentlyreading/${userId}`)
      .catch((err) => {
        return err.response;
      });
  };*/

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

  /*
  const getFinishedList = async (userId) => {
    return axios
      .get(`http://localhost:8080/list/finished/${userId}`)
      .catch((err) => {
        return err.response;
      });
  };*/

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

  /*
  const deleteBook = async (userId, bookId) => {
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
  };*/

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

  /*
  const createCustomList = async (userId, listName) => {
    return axios
      .post(`http://localhost:8080/createcustomlist/${userId}`, { listName })
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        return err.response.data;
      });
  };*/

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

  /*
  const deleteCustomList = async (userId, listName) => {
    return axios
      .patch(`http://localhost:8080/deletecustomlist/${userId}`, { listName })
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        return err.response.data;
      });
  };*/

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

  /*
  const getCustomList = async (userId) => {
    axios
      .get(`http://localhost:8080/customlist/${userId}`)
      .then((res) => {
        setCustomlistNames(Object.keys(res.data.customList));
        setCustomlist(res.data.customList);
      })
      .catch((err) => console.log(err));
  };*/

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

  /*
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
  };*/

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

  /*
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
  };*/

  const getSuggestionsByGenre = async (userId) => {
    const token = sessionStorage.getItem("token");
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };
  
    return axios
      .get(`http://localhost:8080/relatedbygenre/${userId}`, config)
      .then((res) => {
        console.log(res.data);
        if (res.data.filterBooks) {
          setSuggestionsByGenre(res.data.filterBooks);
        } else {
          setSuggestionsByGenre([]);
        }
        return;
      })
      .catch((err) => console.log(err));
  };

  /*
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
  };*/

  const getSuggestionsByAuthor = async (userId) => {
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
          setSuggestionsByAuthor(res.data.filterBooks);
        } else {
          setSuggestionsByAuthor([]);
        }
        return;
      })
      .catch((err) => console.log(err));
  };

  /*
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
  };*/

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
        deleteBook,
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
