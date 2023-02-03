import React, { useState } from "react";
import "./BookCard.css";
import NoBookCover from "../../images/NoBookCover.jpg";
import { useGlobalContext } from "../../context";
const BookCard = ({ book }) => {
  const { _id: bookId } = book;
  const {
    addToreadList,
    addToCurrentlyReadingList,
    addToFinishedList,
    user: { id: userId },
  } = useGlobalContext();

  const [loading, setLoading] = useState(false);

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
      alert(data.data.message);
    } else {
      alert("successfully added book to read list");
    }
    setLoading(false);
  };

  const handleAddToCurrentlyReadingList = async (userId, bookId) => {
    setLoading(true);
    const data = await addToCurrentlyReadingList(userId, bookId);
    console.log(data);
    if (data.status !== 200) {
      alert(data.data.message);
    } else {
      alert("successfully added book to currently reading list");
    }
    setLoading(false);
  };
  
  const handleAddToFinishedList = async (userId, bookId) => {
    setLoading(true);
    const data = await addToFinishedList(userId, bookId);
    console.log(data);
    if (data.status !== 200) {
      alert(data.data.message);
    } else {
      alert("successfully added book to finished list");
    }
    setLoading(false);
  };

  return (
    <>
      <div className="bookComponent">
        <div>
          <img
            src={bookImageURL}
            alt={book.title}
            onClick={() => {
              alert(`Clicked ${book.title}`);
            }}
          />
        </div>
        <div>
          <h3>{book.title}</h3>
          <span>{book.author}</span>
          <span>{book.releaseDate}</span>
          <span>{book.description}</span>
          <span>Rating: {book.avgRating}/5</span>
          <span>{book.likedPercentage}% of people liked this</span>
        </div>
        <div>
          <button
            onClick={() => handleAddToReadList(userId, bookId)}
            disabled={loading}
          >
            Add to my to-read list
          </button>
          <button
            disabled={loading}
            onClick={() => handleAddToCurrentlyReadingList(userId, bookId)}
          >
            Add to my currently reading list
          </button>
          <button
            onClick={() => handleAddToFinishedList(userId, bookId)}
            disabled={loading}
          >
            Add to my finished list
          </button>
        </div>
      </div>
    </>
  );
};

export default BookCard;
