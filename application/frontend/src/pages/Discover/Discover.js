import { useEffect, useState } from "react";
import "./Discover.css";
import BookCarousel from "../../components/Books/BookCarousel";
import SearchIcon from "../../images/SearchIcon.svg";
import BooksDisplayArea from "../../components/Books/BooksDisplayArea";
import LoadingIcon from "../../images/LoadingIcon.svg";

const Discover = () => {
  //const [hasSearched, setHasSearched] = useState(false);

  //State to hold book results array from API, view component will re-render everytime this state is updated via setBooks
  const [books, setBooks] = useState([]);

  //State to hold the search terms the user types in, view component will re-render everytime they type (aka setSearchTerm is called)
  const [searchTerm, setSearchTerm] = useState("");

  //State to hold the current animation state of the search button
  const [iconState, setIconState] = useState(SearchIcon);
  const [loading, setLoading] = useState(false);

  //Fetches search term query results from API and places into books state
  const searchBooks = async (title) => {
    setLoading(true);
    setIconState(LoadingIcon);

    const search = {
      searchTerm: title,
    };

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
      body: JSON.stringify(search),
    };

    const response = await fetch(
      "http://localhost:8080/getBooksBySearchTerm",
      options
    );
    const data = await response.json();

    setBooks(data.books);
    setIconState(SearchIcon);
    //setHasSearched(true);
    setLoading(false);
  };

  //When view component is rendered, load default search results
  useEffect(() => {
    searchBooks("a");
  }, []);

  let content;

  if (loading) {
    content = <h1 className="loading-status">Loading...</h1>;
  }
  if (!loading) {
    content = (
      <>
        {books.length > 0 ? (
          <>
            <BooksDisplayArea books={books} />
          </>
        ) : (
          <>
            <h1 className="loading-status">No results found.</h1>
          </>
        )}
      </>
    );
  }

  return (
    <div className="searchPage">
      <div className="searchDiv">
        <input
          id="searchBar"
          placeholder="Search for books"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <img
          id="searchIcon"
          src={iconState}
          alt="search"
          onClick={() => searchBooks(searchTerm)}
        />
      </div>
      {content}
    </div>
  );
};

export default Discover;
