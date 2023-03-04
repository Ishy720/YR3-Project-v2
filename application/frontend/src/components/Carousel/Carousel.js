// import React, { useState, useEffect, useRef } from "react";
// import "./style.css";

// const Carousel = ({ books, autoplay = true, autoplayInterval = 3000 }) => {
//   const [currentImage, setCurrentImage] = useState(0);
//   const [isPaused, setIsPaused] = useState(!autoplay);

//   const containerRef = useRef(null);
//   const intervalRef = useRef(null);

//   const handlePrevClick = () => {
//     setCurrentImage((currentImage - 1 + books.length) % books.length);
//   };

//   const handleNextClick = () => {
//     setCurrentImage((currentImage + 1) % books.length);
//   };

//   const handleIndicatorClick = (index) => {
//     setCurrentImage(index);
//   };

//   const handleMouseEnter = () => {
//     setIsPaused(true);
//   };

//   const handleMouseLeave = () => {
//     setIsPaused(false);
//   };

//   useEffect(() => {
//     if (isPaused || !autoplay) {
//       clearInterval(intervalRef.current);
//       return;
//     }

//     intervalRef.current = setInterval(() => {
//       setCurrentImage((currentImage + 1) % books.length);
//     }, autoplayInterval);

//     return () => clearInterval(intervalRef.current);
//   }, [currentImage, isPaused, autoplay, autoplayInterval, books.length]);

//   useEffect(() => {
//     const containerWidth = containerRef.current.clientWidth;
//     console.log(containerRef.current);
//     // const slideWidth = 484;
//     const slideWidth = containerWidth / 3;
//     containerRef.current.scrollLeft = slideWidth * currentImage;
//   }, [currentImage]);

//   return (
//     <>
//       <section className="section">
//         <h2>Based on grenres you like</h2>
//         <div
//           className="carousel-container"
//           ref={containerRef}
//           onMouseEnter={handleMouseEnter}
//           onMouseLeave={handleMouseLeave}
//         >
//           {books.map((book, index) => (
//             <div key={index} className="carousel-slide">
//               <img src={book.imgurl} alt={`Slide ${index}`} />
//               <p>
//                 <span> Author</span> {book.author}
//               </p>
//               <p>
//                 <span> Title </span>
//                 {book.title}
//               </p>
//             </div>
//           ))}
//           <button className="carousel-prev" onClick={handlePrevClick}>
//             &lt;
//           </button>
//           <button className="carousel-next" onClick={handleNextClick}>
//             &gt;
//           </button>
//           <div className="carousel-indicators">
//             {books.map((_, index) => (
//               <div
//                 key={index}
//                 className={`carousel-indicator ${
//                   index === currentImage ? "active" : ""
//                 }`}
//                 onClick={() => handleIndicatorClick(index)}
//               ></div>
//             ))}
//           </div>
//         </div>
//       </section>
//     </>
//   );
// };

// export default Carousel;

// import React, { useEffect, useState, useRef } from "react";
// import { useSnapCarousel } from "react-snap-carousel";
// import "./style.css";
// const AdvancedCarousel = ({ books }) => {
//   let autoplay = true;
//   let autoplayInterval = 3000;
//   const intervalRef = useRef(null);
//   const [isPaused, setIsPaused] = useState(!autoplay);
//   const { scrollRef, pages, activePageIndex, next, prev, goTo } =
//     useSnapCarousel();

//     useEffect(() => {
//       if (isPaused || !autoplay) {
//         clearInterval(intervalRef.current);
//         return;
//       }

//       intervalRef.current = setInterval(() => {
//         // setCurrentImage((currentImage + 1) % books.length);
//         next();
//       }, autoplayInterval);

//       return () => clearInterval(intervalRef.current);
//     }, [activePageIndex, isPaused, autoplay, autoplayInterval, books.length]);

//     useEffect(() => {
//       setInterval(() => {
//         next();
//       }, 3000);
//     }, []);

//   const handleNext = () => {
//     console.log(activePageIndex);
//     console.log(pages);
//     next();
//   };

//   return (
//     <>
//       <section className="section">
//         <h2>Based on genres you like</h2>
//         {books.length > 0 ? (
//           <div
//             ref={scrollRef}
//             className="carousel-container"
//             style={{
//               display: "flex",
//               overflow: "auto",
//               scrollSnapType: "x mandatory",
//             }}
//           >
//             {books.map((book, i) => (
//               <div key={i} className="carousel-slide">
//                 <img src={book.imgurl} alt={`Slide ${i}`} />
//                 <p>
//                   <span> Author</span> {book.author}
//                 </p>
//                 <p>
//                   <span> Title </span>
//                   {book.title}
//                 </p>
//               </div>
//             ))}

//             <button className="carousel-prev" onClick={() => prev()}>
//               Prev
//             </button>
//             <button className="carousel-next" onClick={handleNext}>
//               Next
//             </button>
//           </div>
//         ) : (
//           <p>No recommendations</p>
//         )}
//       </section>

//       {/* <div>
//         {activePageIndex + 1} / {pages.length}
//       </div> */}

//       {/* <ol style={{ display: "flex" }}>
//         {pages.map((_, i) => (
//           <li key={i}>
//             <button
//               style={i === activePageIndex ? { opacity: 0.5 } : {}}
//               onClick={() => goTo(i)}
//             >
//               {i + 1}
//             </button>
//           </li>
//         ))}
//       </ol> */}
//     </>
//   );
// };

// export default AdvancedCarousel;





import React from "react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import "./style.css";
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




