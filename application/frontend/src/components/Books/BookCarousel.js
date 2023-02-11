import React, { useState, useEffect, useRef } from 'react';
import "./BookCarousel.css";

const BookCarousel = ({ books }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [slideAmount, setSlideAmount] = useState(0);
    const [transitioning, setTransitioning] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [direction, setDirection] = useState(0);
    const carouselListRef = useRef(null);

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

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
                    carouselListRef.current.style.transform = `translateX(${0}%)`;
                    setCurrentIndex((currentIndex + direction + books.length) % books.length);
                    setTransitioning(false);
                    setDirection(0);
                } else {
                    carouselListRef.current.style.transform = `translateX(${slideAmount - (progress / 500) * slideAmount}%)`;
                    requestAnimationFrame(step);
                }
            };
            setSlideAmount(-direction * windowWidth / booksToDisplay.length);
            requestAnimationFrame(step);
        }
    }, [currentIndex, slideAmount, transitioning, direction, books.length, windowWidth]);

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