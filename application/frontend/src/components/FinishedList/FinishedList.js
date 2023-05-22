//Imports
import React, { useState, useEffect } from "react";
import { FaTrashAlt } from "react-icons/fa";
import { CiCircleMore } from "react-icons/ci";
import toast, { Toaster } from "react-hot-toast";
import { useGlobalContext } from "../../context";

//FinishedList Component, used for rendering the user's finished reading core list and the books inside it, with options to transfer the books to other core lists 
const FinishedList = () => {

  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState(false);

  //import required states/functions from context file
  const {
    deleteBook,
    finishedList,
    setFinishedList,
    addToCurrentlyReadingList,
    setCurrentlyReadingList,
    setToReadList,
    addToReadList,
    getFinishedList,
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

  //event handler for getting the user's finished reading list of books
  const getList = async () => {
    setLoading(true);
    const { data } = await getFinishedList(userId);
    //console.log(data);
    setFinishedList(data.finishedList);
    setLoading(false);
  };

  //event handler to add a specific book to the user's currently-reading list
  const handleAddToCurrentlyReadingList = async (userId, bookId) => {
    setQuery(true);
    const data = await addToCurrentlyReadingList(userId, bookId);
    console.log(data);
    if (data.status !== 200) {
      //alert(data.data.message);
      notifyError(data.data.mesage);
    } else {
      setCurrentlyReadingList(data.data.currentlyReadingList);
      //alert("successfully added book to currently reading list");
      notifySuccess("Moved book to your currently reading list!");
      setFinishedList(data.data.finishedList);
    }
    setQuery(false);
  };

  //event handler to add a specific book to the user's to-read list
  const handleAddToReadList = async (userId, bookId) => {
    setQuery(true);
    const data = await addToReadList(userId, bookId);
    console.log(data);
    if (data.status !== 200) {
      //alert(data.data.message);
      notifyError(data.data.message);
    } else {
      setFinishedList(data.data.finishedList);
      setToReadList(data.data.toReadList);
      //alert("successfully added book to read list");
      notifySuccess("Moved book to your to-read list!");
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

  //content variable to hold UI markup depending on if there are any books to render or not
  let content;

  if (loading) {
    content = <p className="other-message">Loading......</p>;
  }
  if (finishedList.length === 0) {
    content = <p className="other-message">Looks like you aren't tracking any books here! Add a book to get started!</p>;
  }

  if (!loading && finishedList.length > 0) {
    content = finishedList.map((book) => {
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
              <p className="add-to">Add to:</p>
              <div className="more-con">
                <button
                  onClick={() =>
                    handleAddToCurrentlyReadingList(userId, book._id)
                  }
                  disabled={query}
                >
                  Currently reading
                </button>
                <button
                  onClick={() => handleAddToReadList(userId, book._id)}
                  disabled={query}
                >
                  To read
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

export default FinishedList;
