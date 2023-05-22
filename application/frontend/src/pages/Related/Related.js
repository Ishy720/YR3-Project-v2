//Imports
import React, { useEffect } from "react";
import Carousel from "../../components/Carousel/Carousel";
import { useGlobalContext } from "../../context";
import "./Related.css";

//Related Component
const Related = () => {

  //import required states
  const {
    getRelatedByGenre,
    relatedByGenre,
    getRelatedByAuthor,
    relatedByAuthor,
    user: { id: userId },
  } = useGlobalContext();

  //on render, retrieve the related books by genre and author
  useEffect(() => {
    getRelatedByGenre(userId);
    getRelatedByAuthor(userId);
  }, []);

  //return function containing JSX markup to display the UI elements
  return (
    <div>
      <br></br>
      <h1 id="pageTitle">Related Reads</h1>

      <h1 className="carousel-title">Authors in your reading lists have also wrote:</h1>
      {relatedByAuthor.length == 0 ? (
        <p> Add books to your reading lists to see these books!</p>
      ) : (
        <Carousel books={relatedByAuthor} />
      )}

      <h1 className="carousel-title">Books with matching genres in your reading lists:</h1>
      {relatedByGenre.length == 0 ? (
        <p> Add books to your reading lists to see these books!</p>
      ) : (
        <Carousel books={relatedByGenre} />
      )}
    </div>
  );
};

export default Related;
