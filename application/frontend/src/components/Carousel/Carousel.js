import React from "react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import "./style.css";
import { useGlobalContext } from "../../context";


const BookCarousel = ({ books }) => {
  const { setBookInformation, showBookInfoModal, setShowBookInfoModal } = useGlobalContext();

  const handleClick = (book) => {
    //alert(book.title);
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


  return (
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
        <div
          key={i}
          className="carousel-slide"
          onClick={() => handleClick(book)}
        >
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
};

export default BookCarousel;



// const showInfo = (book) => {
//   console.log(book);

//   setBookInformation({
//     _id: book._id,
//     title: book.title,
//     author: book.author,
//     releaseDate: book.releaseDate,
//     description: book.description,
//     imgurl: book.imgurl,
//     genres: book.genres,
//     avgRating: book.avgRating,
//     likedPercentage: book.likedPercentage,
//     ratingDistribution: book.ratingDistribution,
//   });

//   setShowBookInfoModal(true);
// };

// const handleClick = ({ book }) => {
//   setBookInformation({
//     _id: book._id,
//     title: book.title,
//     author: book.author,
//     releaseDate: book.releaseDate,
//     description: book.description,
//     imgurl: book.imgurl,
//     genres: book.genres,
//     avgRating: book.avgRating,
//     likedPercentage: book.likedPercentage,
//     ratingDistribution: book.ratingDistribution,
//   });
// };

// const handleClick = (name) => {

// };
// const { setBookInformation } = useGlobalContext();

// export default ({ books }) => (
//   <Carousel
//     autoPlay
//     centerMode
//     centerSlidePercentage={25}
//     infiniteLoop
//     showThumbs={false}
//     dynamicHeight
//     width="80%"
//     interval={2000}
//     className="carousel-container"
//   >
//     {books.map((book, i) => (
//       <div key={i} className="carousel-slide" onClick={() => handleClick(book)}>
//         <img src={book.imgurl} alt={`Slide ${i}`} />
//         <p>
//           <span> Author</span> {book.author}
//         </p>
//         <p>
//           <span> Title </span>
//           {book.title}
//         </p>
//       </div>
//     ))}
//   </Carousel>
// );

// import React from "react";
// import { useGlobalContext } from "./GlobalContext";