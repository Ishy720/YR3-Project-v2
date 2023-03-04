import React, { useEffect } from "react";
import Carousel from "../../components/Carousel/Carousel";
import { useGlobalContext } from "../../context";

const Suggested = () => {

  const {
    getSuggestionsByGenre,
    suggestionsByGenre,
    getSuggestionsByAuthor,
    suggestionsByAuthor,
    user: { id: userId },
  } = useGlobalContext();

  useEffect( () => {

    getSuggestionsByGenre(userId);
    getSuggestionsByAuthor(userId);
    
  }, []);

  return (
    <div>
      <h1 id="pageTitle">Suggested Reads</h1>

      <h1 className="carousel-title">Based on your interested genres:</h1>
      {suggestionsByGenre.length == 0 ? (
        <p> Add books to your list to get suggestions</p>
      ) : (
        <Carousel books={suggestionsByGenre} />
      )}

      <h1 className="carousel-title">Based on your interested authors:</h1>
      {suggestionsByAuthor.length == 0 ? (
        <p> Add books to your list to get suggestions</p>
      ) : (
        <Carousel books={suggestionsByAuthor} />
      )}


    </div>
  );
};

export default Suggested;
