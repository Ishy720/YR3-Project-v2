import { useEffect, useState } from 'react';
import './Discover.css';
import BookCarousel from '../../components/Books/BookCarousel';
import SearchIcon from '../../images/SearchIcon.svg';
import SearchFilters from '../../components/Books/SearchFilters';
import BooksDisplayArea from '../../components/Books/BooksDisplayArea';
import LoadingIcon from '../../images/LoadingIcon.svg';

const Discover = () => {


  const [hasSearched, setHasSearched] = useState(false);

  //State to hold book results array from API, view component will re-render everytime this state is updated via setBooks
  const [books, setBooks] = useState([]);

  //State to hold the search terms the user types in, view component will re-render everytime they type (aka setSearchTerm is called)
  const [searchTerm, setSearchTerm] = useState('');

  //State to hold the current animation state of the search button
  const [iconState, setIconState] = useState(SearchIcon);

  //State to hold the current filter option the user wants, default is all types
  //const [filter, setFilter] = useState('all');

  //Fetches search term query results from API and places into books state
  const searchBooks = async (title) => {
    setIconState(LoadingIcon)

    const search = {
      searchTerm: title
    }

    const options = {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(search)
    };

    const response = await fetch('http://localhost:8080/getBooksBySearchTerm', options);
    const data = await response.json()

    setBooks(data.books);
    console.log(data.books);
    setIconState(SearchIcon);
    setHasSearched(true);

  };

  /*
  //Function for child search component to call with filter result
  function updateFilter(newFilter) {
    setFilter(newFilter);
  }
  */

  //When view component is rendered, load default search results
  useEffect(() => {
    //searchBooks({searchTerm});
    //searchBooks(`Harry Potter`);
  }, []);
  
  return (

    <div className="searchPage">

      <h1 id="pageTitle">Find my books</h1>

      <div className='searchDiv'>
        <input id="searchBar" placeholder="Search for books" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        <img id="searchIcon" src={iconState} alt="search" onClick={() => searchBooks(searchTerm)}/>
      </div>

      {hasSearched ? (
      <>

        {books.length > 0 ? (
          <>
            
            <BooksDisplayArea books={books} />
          </>
        ) : (
          <>
            <h1>No results found.</h1>
          </>
        )};


      </>
    ) : (
      <>
        <h1>Results will appear here.</h1>
      </>
    )}


    </div>


  );
};

export default Discover;
