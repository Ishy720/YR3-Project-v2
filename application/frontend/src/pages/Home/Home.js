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
            <Link to="/searchPage">
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
            one single place! We also aim to help users find similar books to
            their interested books by showing similar recommendations on books!
          </p>
        </section>
        <section>
          <h2>Our Website</h2>
          <p>
            It's not always easy to remember the books we've
            read, and we understand the struggles of trying to find new books to
            read when there's so many to explore. You can use this website to 
            manage your books and find similar books to whatever book you like!
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
          <h2>Our Maintenence</h2>
          <p>
            We have managers working behind the scenes on the website to make sure
            book fields are correct and accurately represent their real counterparts!
          </p>
        </section>
      </div>
    </div>
  );
}

export default Home;
