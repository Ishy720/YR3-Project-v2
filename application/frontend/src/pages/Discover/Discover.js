import { useEffect, useState } from 'react';
import './Discover.css';
import SearchIcon from '../../images/SearchIcon.svg';
import SearchFilters from '../../components/Books/SearchFilters';
import BooksDisplayArea from '../../components/Books/BooksDisplayArea';
import LoadingIcon from '../../images/LoadingIcon.svg';
import { API_KEY } from '../../config/api_key';

const Discover = () => {

  //State to hold book results array from API, view component will re-render everytime this state is updated via setBooks
  const [books, setBooks] = useState([]);

  //State to hold the search terms the user types in, view component will re-render everytime they type (aka setSearchTerm is called)
  const [searchTerm, setSearchTerm] = useState('');

  //State to hold the current animation state of the search button
  const [iconState, setIconState] = useState(SearchIcon);

  //State to hold the current filter option the user wants, default is all types
  const [filter, setFilter] = useState('all');

  //Fetches search term query results from API and places into books state
  const searchBooks = async (title) => {
    setIconState(LoadingIcon)
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${title}&printType=${filter}&key=${API_KEY}`);
    const data = await response.json();
    setBooks(data.items);
    setIconState(SearchIcon);
  };

  //Function for child search component to call with filter result
  function updateFilter(newFilter) {
    setFilter(newFilter);
  }

  //When view component is rendered, load default search results
  useEffect(() => {
    //searchBooks({searchTerm});
    searchBooks(`React`);
  }, []);
  
  return (
    <div className="searchPage">
      <h1 id="pageTitle">Find my books</h1>

      <div className='searchDiv'>
        <input id="searchBar" placeholder="Search for books" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        <img id="searchIcon" src={iconState} alt="search" onClick={() => searchBooks(searchTerm)}/>
      </div>

      <SearchFilters updateFilter={result => updateFilter(result)} />

      <BooksDisplayArea books={books} />

    </div>

  );
};

export default Discover;
