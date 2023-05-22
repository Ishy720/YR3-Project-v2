//Imports
import React, { useState, useEffect, useRef } from "react";
import { FaTrash, FaTimes } from "react-icons/fa";
import "./BookInfoModal.css";
import { useGlobalContext } from "../../context";
import Carousel from "../Carousel/Carousel";
import LoadingIcon from "../../images/LoadingIcon.svg";

//BookInfoModal Component, used as an overlay to render a book and it's information and similar book recommendations
const BookInfoModal = () => {

  //import required states/functions from context file
  const {
    bookInformation,
    setBookInformation,
    setShowBookInfoModal
  } = useGlobalContext();

  const [suggestedBooks, setSuggestedBooks] = useState([]);

  //variable to check if the overlay is being rendered
  const isMounted = useRef(true);


  let searched = false;
  const abortController = useRef(new AbortController()); //HTTP abort request controller, to stop the request for similar recommendations if the overlay is closed

  //event handler to get the similar book recommendations on the current selected book
  const getRecommendations = async (id) => {
    const options = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + sessionStorage.getItem("token"),
      },
      signal: abortController.current.signal,
    };
  
    //send HTTP request to server to retrieve similar book recommendations using the book id as input parameter
    try {
      const response = await fetch(`http://localhost:8080/books/recommendations/${id}`, options);
      const data = await response.json();
  
      if (isMounted.current) {
        console.log(data.books);
        const booksOnly = data.books.map((item) => item.book);
        if (!searched) {
          setSuggestedBooks(booksOnly);
        }
        searched = true;
      }
    } catch (err) {
      console.log("Fetch request error:", err.message);
    }
  };

  //on render get the recommendations
  useEffect(() => {
    abortController.current = new AbortController();
    getRecommendations(bookInformation._id);
    setSuggestedBooks([]);
  }, [bookInformation]);

  //event handler to close the overlay
  const closeModal = () => {
    isMounted.current = false;
    abortController.current.abort();
    setShowBookInfoModal(false);
    setBookInformation({
      title: "",
      author: "",
      releaseDate: "",
      description: "",
      imgurl: "",
      genres: [],
      avgRating: "",
      likedPercentage: "",
      ratingDistribution: [],
    });
  };

  //return function containing JSX markup to display the UI elements
  return (
    <section className="bookinfo-main-sec">
      <div className="booksinfo-modal-content">
        <FaTimes className="close-modal-icon" onClick={closeModal} />
        <div className="bookinfo-book-card">
          <img src={bookInformation.imgurl} />

          <div>
            <h3 className="book-title">{bookInformation.title}</h3>
            <h4 className="book-author">{bookInformation.author}</h4>
            <p className="book-desc">{bookInformation.description}</p>
          </div>
        </div>
        <h4>Similar books to {bookInformation.title}:</h4>

        {suggestedBooks.length > 0 ? (
          <Carousel books={suggestedBooks} />
        ) : (
          <>
            <img src = {LoadingIcon} />
            <br />
          </>
        )}
      </div>
    </section>
  );
};

export default BookInfoModal;
