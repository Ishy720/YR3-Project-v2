import React, { useState, useEffect } from "react";
import { FaTrashAlt } from "react-icons/fa";
import { CiCircleMore } from "react-icons/ci";

import { useGlobalContext } from "../../context";

const CurrentlyReadingList = () => {
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState(false);
  const {
    deletebook,
    addToreadList,
    addToFinishedList,
    toreadlist,
    currentlyReadingList,
    getCurrentlyReadingList,
    setCurrentlyReadingList,
    setToReadList,
    finishedList,
    setFinishedList,
    user: { id: userId },
  } = useGlobalContext();

  const getList = async () => {
    setLoading(true);
    const { data } = await getCurrentlyReadingList(userId);
    console.log(data);
    setCurrentlyReadingList(data.currentlyReadingList);
    setLoading(false);
  };

  const handleAddToReadList = async (userId, bookId) => {
    setQuery(true);
    const data = await addToreadList(userId, bookId);
    console.log(data);
    if (data.status !== 200) {
      alert(data.data.message);
    } else {
      setCurrentlyReadingList(data.data.currentlyReadingList);
      setToReadList(data.data.toReadList);
      alert("successfully added book to read list");
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
      setCurrentlyReadingList(data.data.currentlyReadingList);
      setFinishedList(data.data.finishedList);
      alert("successfully added book to finished list");
    }
    setQuery(false);
  };
  useEffect(() => {
    getList();
  }, []);

  let content;
  if (loading) {
    content = <p className="other-message">Loading......</p>;
  }

  if (currentlyReadingList.length === 0) {
    content = <p className="other-message">No books in this list</p>;
  }
  if (!loading && currentlyReadingList.length > 0) {
    content = currentlyReadingList.map((book) => {
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
                  onClick={() => handleAddToReadList(userId, book._id)}
                  disabled={query}
                >
                  To read
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

export default CurrentlyReadingList;
