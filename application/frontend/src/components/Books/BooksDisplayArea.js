import BookCard from "./BookCard";
import './BooksDisplayArea.css'

function BooksDisplayArea(props) {
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