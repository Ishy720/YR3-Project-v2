import React, { useState, useEffect } from 'react';
import "./ManagerView.css";

function ManagerView() {

  //stats states
  const [totalBookCount, setTotalBookCount] = useState(0);
  const [totalUserCount, setTotalUserCount] = useState(0);
  const [mostCommonBook, setMostCommonBook] = useState({});
  const [registrations, setRegistrations] = useState({});
  //const [topGenres, setTopGenres] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  //book editing states
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [editBook, setEditBook] = useState(null);
  const [updatedBook, setUpdatedBook] = useState(null);

  const handleSearch = async (event) => {
    event.preventDefault();
    setEditBook(null);
    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch(
        "http://localhost:8080/getBooksBySearchTerm",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ searchTerm }),
        }
      );
      const data = await response.json();
      setSearchResults(data.books);
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditClick = (book) => {
    setEditBook({ ...book });
    setUpdatedBook({ ...book });
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();
    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch(
        `http://localhost:8080/editBook/${editBook._id}`,
        {
          method: "PATCH",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedBook),
        }
      );
      const data = await response.json();
      setUpdatedBook(data.book);
      setEditBook(null);
      setSearchResults(
        searchResults.map((book) =>
          book._id === data.book._id ? data.book : book
        )
      );
      handleSearch(event);
    } catch (error) {
      console.error(error);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setUpdatedBook({ ...updatedBook, [name]: value });
  };

  useEffect(() => {
    setIsLoading(true);
    
    fetch('http://localhost:8080/getSiteAnalytics', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + sessionStorage.getItem("token")
      },
      body: JSON.stringify({})
    })
      .then(response => response.json())
      .then(data => {
        console.log(data);
        setTotalBookCount(data.totalBookCount);
        setTotalUserCount(data.totalUserCount);
        setMostCommonBook(data.mostCommonBook);
        setRegistrations(data.registrations)
        //setTopGenres(data.genreCounts);
        setIsLoading(false);
      })
      .catch(error => {
        console.log(error);
        setIsLoading(false);
      });
  }, []);

  return (
    <main className="manager-page-main">
      <div className="manager-page-heading">
        <h1 id="pageTitle">Manager Page</h1>
        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search for a book"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          <button type="submit">Search</button>
        </form>
      </div>
      <div className="manager-page-body">
        {searchResults && searchResults.length > 0 ? (
          <div className="cards-container">
            {searchResults.map((book) => (
              <div key={book._id} className="book-card">
                <img
                  className="book-card-image"
                  src={book.imgurl}
                  alt={book.title}
                />
                <div className="book-card-content">
                  <p className="book-card-title">{book.title}</p>
                  <p className="book-card-author">By {book.author}</p>

                  <button
                    className="book-card-edit btn"
                    onClick={() => handleEditClick(book)}
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : searchResults && searchResults.length == 0 ? (
          <p className="other-message">No Books found </p>
        ) : (
          <p className="other-message">Search results will appear here</p>
        )}

        {editBook && (
          <div className="edit-form-con">
            <form onSubmit={handleEditSubmit}>
              <label>Title:</label>
              <input
                type="text"
                name="title"
                value={updatedBook.title}
                onChange={handleInputChange}
              />

              <label>Author:</label>
              <input
                type="text"
                name="author"
                value={updatedBook.author}
                onChange={handleInputChange}
              />

              <label>Description:</label>
              <textarea
                name="description"
                value={updatedBook.description}
                onChange={handleInputChange}
                rows="6"
                cols="50"
              />

              <div>
                <button type="submit" className="save-edit-btn">
                  Save
                </button>
                <button
                  type="submit"
                  className="cancel-edit-btn"
                  onClick={() => setEditBook(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {isLoading ? (
        <h1>Loading...</h1>
      ):
        <div id="stats">
        <h1 id="pageTitle">Website statistics</h1>
        <br></br>
    
        <div id="cardsContainer">
          <div className="card">
            <h3>Total registered books in the website:</h3>
            <p>{totalBookCount}</p>
          </div>
    
          <div className="card">
            <h3>Total number of accounts registered with the website:</h3>
            <p>{totalUserCount}</p>
          </div>
    
          <div className="card">
            <h3>Most commonly found book across all users:</h3>
            <img src={mostCommonBook[0]._id.imgurl} alt="Book cover" />
            <p>{mostCommonBook[0]._id.title}, written by {mostCommonBook[0]._id.author}</p>
            <p>A total of {mostCommonBook[0].count} users have this book in their core lists</p>
          </div>
    
          <div className="card">
            <h3>Registration counts over the past 6 months:</h3>
            {registrations && Object.entries(registrations).length > 0 ? (
              <ul>
                {Object.entries(registrations).map(([month, count]) => (
                  <li key={month}>
                    {month}: {count} users registered
                  </li>
                ))}
              </ul>
            ) : (
              <p>No new registrations over the past 6 months!</p>
            )}
          </div>


        </div>
      </div>
      }
    </main>
  );
}

export default ManagerView;
