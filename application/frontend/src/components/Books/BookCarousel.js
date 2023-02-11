import React, { useState, useEffect } from 'react';
import "./BookCarousel.css";

const BookCarousel = ({ books }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [slideAmount, setSlideAmount] = useState(0);
    const [transitioning, setTransitioning] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const booksToDisplay = [
        ...books.slice(currentIndex + 1, books.length),
        ...books.slice(0, currentIndex + 1)
    ];

    const handleNext = () => {
        setTransitioning(true);
        setSlideAmount(-windowWidth / booksToDisplay.length);
    };

    const handlePrev = () => {
        setTransitioning(true);
        setSlideAmount(windowWidth / booksToDisplay.length);
    };

    useEffect(() => {
        if (transitioning) {
            setTimeout(() => {
                setSlideAmount(0);
                setCurrentIndex((currentIndex + (slideAmount > 0 ? -1 : 1) + books.length) % books.length);
                setTransitioning(false);
            }, 500);
        }
    }, [currentIndex, slideAmount, transitioning, books.length, windowWidth]);

    return (
        <div className="carousel">
            <button onClick={handlePrev}>Prev</button>
            <ul
                className="carousel-list"
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