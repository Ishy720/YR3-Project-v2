import React, { useEffect } from "react";
import Carousel from "../../components/Carousel/Carousel";
import { useGlobalContext } from "../../context";
import "./suggested.css";
const Suggested = () => {
  const {
    getSuggestionsByGenre,
    suggestionsByGenre,
    getSuggestionsByAuthor,
    suggestionsByAuthor,
    user: { id: userId },
  } = useGlobalContext();

  useEffect(() => {
    //getSuggestionsByGenre(userId);
    getSuggestionsByAuthor(userId);
  }, []);

  return (
    <div>
      <br></br>
      <h1 id="pageTitle">Related Reads</h1>

      <h1 className="carousel-title">Authors in your reading lists have also wrote:</h1>
      {suggestionsByAuthor.length == 0 ? (
        <p> Add books to your reading lists to see these books!</p>
      ) : (
        <Carousel books={suggestionsByAuthor} />
      )}

      <h1 className="carousel-title">Books with matching genres in your reading lists:</h1>
      {suggestionsByGenre.length == 0 ? (
        <p> Add books to your reading lists to see these books!</p>
      ) : (
        <Carousel books={suggestionsByGenre} />
      )}
    </div>
  );
};

export default Suggested;
