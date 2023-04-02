import React, { useState, useEffect, useRef } from "react";
import { FaTrash, FaTimes } from "react-icons/fa";
import "./BookInfoModal.css";
import { useGlobalContext } from "../../context";
import Carousel from "../Carousel/Carousel";
import LoadingIcon from "../../images/LoadingIcon.svg";

const BookInfoModal = () => {
  const {
    bookInformation,
    setBookInformation,
    showBookInfoModal,
    setShowBookInfoModal,
  } = useGlobalContext();

  const [suggestedBooks, setSuggestedBooks] = useState([]);

  const isMounted = useRef(true);
  let searched = false;
  const abortController = useRef(new AbortController());

  const getRecommendations = async (id) => {
    const parameter = {
      bookId: bookInformation._id,
    };

    /*
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(parameter),
      signal: abortController.current.signal,
    };*/

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + sessionStorage.getItem("token")
      },
      body: JSON.stringify(parameter),
      signal: abortController.current.signal,
    };
    
    try {
      const response = await fetch("http://localhost:8080/getRecommendationsForOneBook", options);
      const data = await response.json();

      if (isMounted.current) {
        console.log(data.books);
        const booksOnly = data.books.map((item) => item.book);
        if (!searched) {
          setSuggestedBooks(booksOnly);
        }
        searched = true;
        //setSuggestedBooks(data.books);
      }
    } catch (err) {
      console.log("Fetch request aborted:", err.message);
    }
  };

  useEffect(() => {
    abortController.current = new AbortController();
    getRecommendations(bookInformation._id);
    setSuggestedBooks([]);
  }, [bookInformation]);

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

/*
        <h6>{bookInformation._id}</h6>
        <h1>{bookInformation.title}</h1>
        <img src={bookInformation.imgurl} />
        <h2>{bookInformation.author}</h2>
        */

export default BookInfoModal;
