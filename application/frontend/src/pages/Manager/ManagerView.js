import React, { useState } from "react";
import "./ManagerView.css";

function ManagerView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [editBook, setEditBook] = useState(null);
  const [updatedBook, setUpdatedBook] = useState(null);

  const handleSearch = async (event) => {
    event.preventDefault();
    setEditBook(null);
    try {
      const response = await fetch(
        "http://localhost:8080/getBooksBySearchTerm",
        {
          method: "POST",
          headers: {
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
      const response = await fetch(
        `http://localhost:8080/editBook/${editBook._id}`,
        {
          method: "PATCH",
          headers: {
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
          <p className="other-message">Search Books</p>
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
    </main>
  );
}

export default ManagerView;
