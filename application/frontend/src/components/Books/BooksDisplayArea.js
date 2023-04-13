import BookCard from "./BookCard";
import BookInfoModal from "./BookInfoModal";
import './BooksDisplayArea.css'
import { useGlobalContext } from "../../context.js";

function BooksDisplayArea(props) {

  const { bookInformation, setBookInformation, showBookInfoModal, setShowBookInfoModal} = useGlobalContext();

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