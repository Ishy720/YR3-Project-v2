import React from 'react'
import './About.css'

function About() {
    return (
      <div className="about">
        <h1 id="pageTitle">About us</h1>

        <section>
          <h2>Our Aims</h2>
          <p>We aim to deliver users a place to manage and keep track of books in one single and safe place!</p>
        </section>
        <section>
          <h2>Our Story</h2>
          <p>We're book lovers, and we've made this website for all of the book lovers out there! It's not always easy to remember
            the books we've read, and we understand the struggles of trying to find new books to read when there's so many to explore.
            Our website will help you overcome these struggles and provide you with a pleasant experience 
          </p>
        </section>
        <section>
          <h2>Our Promise</h2>
          <p>
            By signing up, you will have access to a database of thousands of books that are regularly monitored and updated by our team. 
            We welcome and look forward to any and all feedback towards our website to improve our services for our customers!
          </p>
        </section>
        <section>
          <h2>Our Helping Hand</h2>
          <p>
            Don't know what to read? Looking for something new, or perhaps more books from authors that you are interested in? Sign in now
            and start adding books to your reading lists! We'll suggest a range of books to you that you may be interested in using our
            own content filtering algorithms!
          </p>
        </section>

      </div>
    );
}

export default About;