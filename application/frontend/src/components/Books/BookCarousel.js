import React, { useState, useEffect, useRef } from 'react';
import "./BookCarousel.css";

const BookCarousel = ({ books }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [slideAmount, setSlideAmount] = useState(0);
    const [transitioning, setTransitioning] = useState(false);
    const [direction, setDirection] = useState(0);
    const carouselListRef = useRef(null);

    const booksToDisplay = [...books.slice(currentIndex + 1, books.length), ...books.slice(0, currentIndex + 1)];

    const handleNext = () => {
        setTransitioning(true);
        setDirection(1);
    };

    const handlePrev = () => {
        setTransitioning(true);
        setDirection(-1);
    };

    useEffect(() => {
        if (transitioning) {
          let start;
          const step = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            if (progress > 500) {
              carouselListRef.current.style.transform = `translateX(${
                -100 * (currentIndex + direction + books.length) % books.length
              }%)`;
              setCurrentIndex((currentIndex + direction + books.length) % books.length);
              setTransitioning(false);
              setDirection(0);
            } else {
              carouselListRef.current.style.transform = `translateX(${
                slideAmount - (progress / 500) * slideAmount
              }%)`;
              requestAnimationFrame(step);
            }
          };
          setSlideAmount(-100 / books.length * direction);
          requestAnimationFrame(step);
        }
      }, [currentIndex, slideAmount, transitioning, direction, books.length]);

    return (
        <div className="carousel">
            <button onClick={handlePrev}>Prev</button>
            <ul
                className="carousel-list"
                ref={carouselListRef}
                style={{
                    transform: `translateX(${slideAmount}%)`,
                    transition: transitioning ? 'transform 0.5s' : 'none'
                }}
            >
                {booksToDisplay.map((book, index) => (
                    <li key={index} className="carousel-item">
                        <img src={book.imgurl} alt={book.title} />
                        <h3>{book.title}</h3>
                        <p>{book.author}</p>
                    </li>
                ))}
            </ul>
            <button onClick={handleNext}>Next</button>
        </div>
    );
    

};
  

export default BookCarousel;