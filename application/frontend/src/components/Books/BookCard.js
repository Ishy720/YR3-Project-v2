import React, { useState, useRef } from "react";
import "./BookCard.css";
import NoBookCover from "../../images/NoBookCover.jpg";
import { useGlobalContext } from "../../context";
import toast, { Toaster } from "react-hot-toast";
import {
  FaArrowAltCircleRight,
  FaArrowCircleDown,
  FaBars,
  FaPlus,
  FaTimes,
} from "react-icons/fa";


const BookCard = ({ book }) => {
  const { _id: bookId } = book;
  const {
    addToreadList,
    addToCurrentlyReadingList,
    addToFinishedList,
    user: { id: userId },
    setShowSelectListModal,
    selectedBook,
    setSelectedBook,
    bookInformation,
    setBookInformation,
    showBookInfoModal,
    setShowBookInfoModal,
  } = useGlobalContext();

  const [loading, setLoading] = useState(false);

  function notifyError(message) {
    toast.error(message);
  }

  function notifySuccess(message) {
    toast.success(message);
  }


  //Some books do not have an thumbnail associated with them so we check if the thumbnail attribute exists within the book's imageLinks.
  let bookImageURL = "";

  //Try to add the thumbnail url to the BookCard component.
  try {
    bookImageURL = book.imgurl;
  } catch (err) {
    //A thumbnail couldn't be retrieved from the destructured array parameter.
    console.log(`Couldn't load image for book with title "${book.title}"`);
    bookImageURL = NoBookCover;
  }

  const handleAddToReadList = async (userId, bookId) => {
    setLoading(true);
    const data = await addToreadList(userId, bookId);
    console.log(data);
    if (data.status !== 200) {
      //alert(data.data.message);
      notifyError(data.data.message);
    } else {
      //alert(`Added ${book.title} to your to-read list!`);
      notifySuccess(`Added ${book.title} to your to-read list!`)
    }
    setLoading(false);
  };

  const handleAddToCurrentlyReadingList = async (userId, bookId) => {
    setLoading(true);
    const data = await addToCurrentlyReadingList(userId, bookId);
    console.log(data);
    if (data.status !== 200) {
      //alert(data.data.message);
      notifyError(data.data.message);
    } else {
      //alert(`Added ${book.title} to your currently-reading list!`);
      notifySuccess(`Added ${book.title} to your currently-reading list!`)
    }
    setLoading(false);
  };

  const handleAddToFinishedList = async (userId, bookId) => {
    setLoading(true);
    const data = await addToFinishedList(userId, bookId);
    console.log(data);
    if (data.status !== 200) {
      //alert(data.data.message);
      notifyError(data.data.message);
    } else {
      //alert(`Added ${book.title} to your finished-reading list!`);
      notifySuccess(`Added ${book.title} to your finished-reading list!`)
    }
    setLoading(false);
  };

  const handleAddToCustomList = (bookId) => {
    console.log(bookId);
    setSelectedBook(bookId);
    setShowSelectListModal(true);
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
  };

  const listCon = useRef();

  const showlistCon = () => {
    listCon.current.classList.toggle("show-list");
    console.log(listCon.current);
  };

  return (
    <>
      <div className="bookComponent">
        <div className="image">
          <img
            src={bookImageURL}
            alt={book.title}
            onClick={() => {
              showInfo(book);
            }}
          />
        </div>
        <div className="details">
          <h5>{book.title}</h5>
          <p>{book.author}</p>
          <h5>Genres:</h5>
          <p>{book.genres[0]}, {book.genres[1]},</p>
          <p>{book.genres[2]}, {book.genres[3]},</p>
          <p>{book.genres[4]}, {book.genres[5]},</p>
          <p>{book.genres[6]}, {book.genres[7]},</p>
          <p>{book.genres[8]}, {book.genres[9]},</p>

        </div>
        <button onClick={showlistCon} className="show-listCon">
          Add to list <FaArrowAltCircleRight />
        </button>
        {/* <FaArrowCircleDown className="arrow-down" /> */}
        <div className="btns" ref={listCon}>
          <button
            onClick={() => handleAddToReadList(userId, bookId)}
            disabled={loading}
          >
            To-read list
          </button>
          <button
            disabled={loading}
            onClick={() => handleAddToCurrentlyReadingList(userId, bookId)}
          >
            Reading list
          </button>
          <button
            onClick={() => handleAddToFinishedList(userId, bookId)}
            disabled={loading}
          >
            Finished list
          </button>
          <button
            onClick={() => handleAddToCustomList(bookId)}
            disabled={loading}
          >
            Custom list
          </button>
        </div>
        <Toaster position="bottom-right" reverseOrder={false} />
      </div>
    </>
  );
};

export default BookCard;
