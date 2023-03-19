import React, { useRef } from "react";
import "./Home.css";
import { Link, useNavigate } from "react-router-dom";
import { useViewportScroll, useTransform, motion } from "framer-motion";
import { FaArrowCircleRight } from "react-icons/fa";
function Home() {
  let navigate = useNavigate();
  const { scrollY } = useViewportScroll();
  const sectionRef = useRef(null);
  const y = useTransform(scrollY, [0, 500], [0, 0]);
  return (
    <div className="home">
      <motion.section
        ref={sectionRef}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ y }}
      >
        <div className="hero">
          <div className="hero-image"></div>
          <div className="hero-content">
            <h2>Track thousands of books online.</h2>
            <Link to="/discover">
              <button>
                Explore<FaArrowCircleRight />
              </button>
            </Link>
          </div>
        </div>
      </motion.section>

      <div className="about">
        <h1>About us</h1>

        <section>
          <h2>Our Aims</h2>
          <p>
            We aim to deliver users a place to manage and keep track of books in
            one single place!
          </p>
        </section>
        <section>
          <h2>Our Story</h2>
          <p>
            We're book lovers, and we've made this website for all of the book
            lovers out there! It's not always easy to remember the books we've
            read, and we understand the struggles of trying to find new books to
            read when there's so many to explore. Our website will help you
            overcome these struggles and provide you with a pleasant experience
          </p>
        </section>
        <section>
          <h2>Our Algorithm</h2>
          <p>
            We use TF-IDF calculations to find the best suggestions for the books
            you look at. By doing so, you can be sure you'll always find something
            new and interesting to read!
          </p>
        </section>
        <section>
          <h2>Our Helping Hand</h2>
          <p>
            Don't know what to read? Looking for something new, or perhaps more
            books from authors that you are interested in? Sign in now and start
            adding books to your reading lists! We'll suggest a range of books
            to you that you may be interested in using our own content filtering
            algorithms!
          </p>
        </section>
      </div>
    </div>
  );
}

export default Home;
