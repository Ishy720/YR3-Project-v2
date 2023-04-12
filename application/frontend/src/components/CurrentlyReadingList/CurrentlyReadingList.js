import React, { useState, useEffect } from "react";
import { FaTrashAlt } from "react-icons/fa";
import { CiCircleMore } from "react-icons/ci";
import toast, { Toaster } from "react-hot-toast";

import { useGlobalContext } from "../../context";

const CurrentlyReadingList = () => {
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState(false);
  const {
    deleteBook,
    addToreadList,
    addToFinishedList,
    toreadlist,
    currentlyReadingList,
    getCurrentlyReadingList,
    setCurrentlyReadingList,
    setToReadList,
    finishedList,
    setFinishedList,
    setBookInformation,
    setShowBookInfoModal,
    user: { id: userId },
  } = useGlobalContext();

  function notifyError(message) {
    toast.error(message);
  }

  function notifySuccess(message) {
    toast.success(message);
  }


  const getList = async () => {
    setLoading(true);
    const { data } = await getCurrentlyReadingList(userId);
    //console.log(data);
    setCurrentlyReadingList(data.currentlyReadingList);
    setLoading(false);
  };

  const handleAddToReadList = async (userId, bookId) => {
    setQuery(true);
    const data = await addToreadList(userId, bookId);
    console.log(data);
    if (data.status !== 200) {
      //alert(data.data.message);
      notifyError(data.data.message);
    } else {
      setCurrentlyReadingList(data.data.currentlyReadingList);
      setToReadList(data.data.toReadList);
      //alert("successfully added book to read list");
      notifySuccess("Moved book to your to-read list!")
    }
    setQuery(false);
  };

  const handleAddToFinishedList = async (userId, bookId) => {
    setQuery(true);

    const data = await addToFinishedList(userId, bookId);
    console.log(data);
    if (data.status !== 200) {
      //alert(data.data.message);
      notifyError(data.data.message);
    } else {
      setCurrentlyReadingList(data.data.currentlyReadingList);
      setFinishedList(data.data.finishedList);
      //alert("successfully added book to finished list");
      notifySuccess("Moved book to your finished list!")
    }
    setQuery(false);
  };

  const showInfo = (book) => {
    setBookInformation({
      _id: book._id,
      title: book.title,
      author: book.author,
      releaseDate: book.releaseDate,
      description: book.description,
      imgurl: book.imgurl,
      genres: book.genres,
      avgRating: book.avgRating,
      likedPercentage: book.likedPercentage,
      ratingDistribution: book.ratingDistribution,
    });

    setShowBookInfoModal(true);
  }

  useEffect(() => {
    getList();
  }, []);

  let content;
  if (loading) {
    content = <p className="other-message">Loading......</p>;
  }

  if (currentlyReadingList.length === 0) {
    content = <p className="other-message">Looks like you aren't tracking any books here! Add a book to get started!</p>;
  }
  if (!loading && currentlyReadingList.length > 0) {
    content = currentlyReadingList.map((book) => {
      return (
        <>
        <div className="book-card" key={book._id}>
          <div className="image-con">
            <img src={book.imgurl} alt={book.title} className="image" onClick={() => showInfo(book)} />
          </div>
          <div className="details-con">
            <h5 className="title">
              <span>Title</span> {book.title}
            </h5>
            <h5 className="author">
              <span>Author</span> {book.author}
            </h5>
            <footer className="card-footer">
              <p className="add-to">Move to:</p>
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
                  onClick={() => deleteBook(userId, book._id)}
                />
              </div>
            </footer>
          </div>
          <Toaster position="bottom-right" reverseOrder={false} />
        </div>
        </>
      );
    });
  }

  return content;
};

export default CurrentlyReadingList;
