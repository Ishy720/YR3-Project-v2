import React, { useState } from 'react'
import "./ManagerView.css"

function ManagerView() {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [editBook, setEditBook] = useState(null);
  const [updatedBook, setUpdatedBook] = useState(null);

  const handleSearch = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/getBooksBySearchTerm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ searchTerm }),
      });
      const data = await response.json();
      setSearchResults(data.books);
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditClick = (book) => {
    setEditBook({ ...book });
    setUpdatedBook({ ...book });

  }
  const handleEditSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch(`http://localhost:8080/editBook/${editBook._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedBook),
      });
      const data = await response.json();
      setUpdatedBook(data.book);
      setEditBook(null);
      setSearchResults(searchResults.map(book => book._id === data.book._id ? data.book : book));
      handleSearch(event);
    } catch (error) {
      console.error(error);
    }
  }

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setUpdatedBook({ ...updatedBook, [name]: value });
  }

  return (
    <>
      <h1 id='pageTitle'>Manager Page</h1>
      <form onSubmit={handleSearch}>
        <input type="text" placeholder="Search for a book" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} />
        <button type="submit">Search</button>
      </form>
      <div className="book-cards">
        {searchResults.map((book) => (
          <div key={book._id} className="book-card">
            <img className="book-card-image" src={book.imgurl} alt={book.title} />
            <div className="book-card-content">
              <h2 className="book-card-title">{book.title}</h2>
              <h3 className="book-card-author">By {book.author}</h3>

              <button className='book-card-edit' onClick={() => handleEditClick(book)}>Edit</button>
            </div>
          </div>
        ))}
      </div>
      {editBook && (
        <form onSubmit={handleEditSubmit}>
          <label>Title:</label>
          <input type="text" name="title" value={updatedBook.title} onChange={handleInputChange} />

          <label>Author:</label>
          <input type="text" name="author" value={updatedBook.author} onChange={handleInputChange} />

          <label>Description:</label>
          <textarea name="description" value={updatedBook.description} onChange={handleInputChange} />
          
          <button type="submit">Save</button>
        </form>
      )}
    </>
  );
}

export default ManagerView;