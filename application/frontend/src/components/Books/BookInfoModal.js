import React, { useState, useEffect, useRef } from "react";
import { FaTrash, FaTimes } from "react-icons/fa";
import "./BookInfoModal.css"
import { useGlobalContext } from "../../context";

const BookInfoModal = () => {

  const {
    bookInformation,
    setBookInformation,
    showBookInfoModal, 
    setShowBookInfoModal
  } = useGlobalContext();

  const [suggestedBooks, setSuggestedBooks] = useState([]);
  const isMounted = useRef(true);
  const abortController = useRef(new AbortController());

  const getRecommendations = async (id) => {
    const parameter = {
      bookId: bookInformation._id
    }

    const options = {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(parameter),
      signal: abortController.current.signal
    };

    /*
    const response = await fetch('http://localhost:8080/getRecommendationsForOneBook', options);
    const data = await response.json()
    setSuggestedBooks(data.books);
    */
    try {
      const response = await fetch('http://localhost:8080/getRecommendationsForOneBook', options);
      const data = await response.json();
      if(isMounted.current) {
        console.log(data.books);
        setSuggestedBooks(data.books);
      }
    } catch (err) {
      console.log('Fetch request aborted:', err.message);
    }
  };

  useEffect(() => {
    abortController.current = new AbortController();
    getRecommendations(bookInformation._id);
  }, []);

  const closeModal = () => {
    abortController.current.abort();
    isMounted.current = false; 
    setShowBookInfoModal(false);
    setBookInformation(
      {
        title: '',
        author: '',
        releaseDate: '',
        description: '',
        imgurl: '',
        genres: [],
        avgRating: '',
        likedPercentage: '',
        ratingDistribution: [],
      });
  };

  return (
    <section className="main-sec">
      <div className="modal-content">
        <FaTimes className="close-modal-icon" onClick={closeModal} />
        <h6>{bookInformation._id}</h6>
        <h1>{bookInformation.title}</h1>
        <img src={bookInformation.imgurl} />
        <h2>{bookInformation.author}</h2>

        <h4>Similar books to {bookInformation.title}:</h4>
      </div>
    </section>
  );
};

export default BookInfoModal;
