import React from "react";
import './BookCard.css'
import NoBookCover from "../../images/NoBookCover.jpg"

const BookCard = ({ book }) => {

  //Some books do not have an thumbnail associated with them so we check if the thumbnail attribute exists within the book's imageLinks.
  let bookImageURL = '';

  //Try to add the thumbnail url to the BookCard component.
  try { 
    bookImageURL = book.imgurl;
  }
  //A thumbnail couldn't be retrieved from the destructured array parameter.
  catch(err) {
    console.log(`Couldn't load image for book with title "${book.title}"`)
    bookImageURL = NoBookCover;
  }

  return (
    <>
    <div className='bookComponent'>
      <div>
        <img src={bookImageURL} alt={book.title} onClick={() => {alert(`Clicked ${book.title}`)}} />
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
      <button>Add to my to-read list</button>
      <button>Add to my currently reading list</button>
      <button>Add to my finished list</button>
    </div>
    </div>
    </>
  );
};

export default BookCard;