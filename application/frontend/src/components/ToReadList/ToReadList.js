import React, { useState, useEffect } from "react";
import { FaTrashAlt } from "react-icons/fa";
import { CiCircleMore } from "react-icons/ci";

import { useGlobalContext } from "../../context";

const ToReadList = () => {
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState(false);

  const {
    deletebook,
    finishedList,
    setFinishedList,
    addToFinishedList,
    addToCurrentlyReadingList,
    currentlyReadingList,
    setCurrentlyReadingList,
    setToReadList,
    toreadlist,
    getToReadList,
    user: { id: userId },
  } = useGlobalContext();

  const getList = async () => {
    setLoading(true);
    const { data } = await getToReadList(userId);
    console.log(data);
    setToReadList(data.toReadList);
    setLoading(false);
  };

  const handleAddToCurrentlyReadingList = async (userId, bookId) => {
    setQuery(true);
    const data = await addToCurrentlyReadingList(userId, bookId);
    console.log(data);
    if (data.status !== 200) {
      alert(data.data.message);
    } else {
      setCurrentlyReadingList(data.data.currentlyReadingList);
      alert("successfully added book to currently reading list");
      setToReadList(data.data.toReadList);
    }
    setQuery(false);
  };

  const handleAddToFinishedList = async (userId, bookId) => {
    setQuery(true);
    const data = await addToFinishedList(userId, bookId);
    console.log(data);
    if (data.status !== 200) {
      alert(data.data.message);
    } else {
      alert("successfully added book to finished list");
      setFinishedList(data.data.finishedList);
      setToReadList(data.data.toReadList);
    }
    setQuery(false);
  };

  // const controller = new AbortController();
  // const signal = controller.signal;
  useEffect(() => {
    getList();
  }, []);
  // return () => {
  //   // cancel the request before component unmounts
  //   controller.abort();
  // };

  let content;

  if (loading) {
    content = <p className="other-message">Loading......</p>;
  }
  if (toreadlist.length === 0) {
    content = <p className="other-message">No books in this list</p>;
  }

  if (!loading && toreadlist.length > 0) {
    content = toreadlist.map((book) => {
      return (
        <div className="book-card" key={book._id}>
          <div className="image-con">
            <img src={book.imgurl} alt={book.title} className="image" />
          </div>
          <div className="details-con">
            <h5 className="title">
              <span>Title</span> {book.title}
            </h5>
            <h5 className="author">
              <span>Author</span> {book.author}
            </h5>
            <h5 className="rating">
              <span>Rating</span> {book.avgRating}
            </h5>
            <footer className="card-footer">
              <p className="add-to">Add to:</p>
              <div className="more-con">
                <button
                  onClick={() =>
                    handleAddToCurrentlyReadingList(userId, book._id)
                  }
                  disabled={query}
                >
                  currently reading
                </button>
                <button
                  onClick={() => handleAddToFinishedList(userId, book._id)}
                  disabled={query}
                >
                  Finished reading
                </button>
              </div>
              <div className="icon-con">
                <FaTrashAlt
                  className="trash-icon"
                  onClick={() => deletebook(userId, book._id)}
                />
              </div>
            </footer>
          </div>
        </div>
      );
    });
  }

  return content;
};

export default ToReadList;