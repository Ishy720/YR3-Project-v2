//Imports
import BookCard from "./BookCard";
import './BooksDisplayArea.css'

//BookDisplayArea Component, which is the container for rendering book search results using the props as the input parameter
function BooksDisplayArea(props) {

    //return function containing JSX markup to display the UI elements
    return (
        <>
        {
            props.books?.length > 0
            ? (
              <div className='booksContainer'>
                {props.books.map((book) => (<BookCard book={book} />))}
              </div>
            ) :
            (
              <div className="empty">
                <h2>No results found.</h2>
              </div>
    
            )
        }
        </>
    )
}

export default BooksDisplayArea;