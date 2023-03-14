import React from "react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import "./style.css";

const showInfo = (book) => {
  console.log(book);

  /*
  setBookInformation(
    {
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
  */
}

export default ({ books }) => (
  <Carousel
    autoPlay
    centerMode
    centerSlidePercentage={25}
    infiniteLoop
    showThumbs={false}
    dynamicHeight
    width="80%"
    interval={2000}
    className="carousel-container"
  >
    {books.map((book, i) => (
      <div key={i} className="carousel-slide">
        <img src={book.imgurl} alt={`Slide ${i}`} />
        <p>
          <span> Author</span> {book.author}
        </p>
        <p>
          <span> Title </span>
          {book.title}
        </p>
      </div>
    ))}
  </Carousel>
);




