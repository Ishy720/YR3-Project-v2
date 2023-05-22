//Imports
import React, { useState, useEffect } from "react";
import { FaTrashAlt } from "react-icons/fa";
import { CiCircleMore } from "react-icons/ci";
import toast, { Toaster } from "react-hot-toast";
import { useGlobalContext } from "../../context";

//CustomList Component, used to render the user's custom lists
const CustomList = () => {

  const [loading, setLoading] = useState(false);

  //import required states/functions from context file
  const {
    deleteBookFromCustomList,
    setBookInformation,
    setShowBookInfoModal,
    user: { id: userId },
    getCustomList,
    customListNames,
    customList,
  } = useGlobalContext();

  function notifySuccess(message) {
    toast.success(message);
  }

  function notifyError(message) {
    toast.error(message);
  }

  const getList = async () => {
    setLoading(true);
    getCustomList(userId);
    setLoading(false);
  };

  useEffect(() => {
    getList();
  }, []);

  //event handler to remove a book from a user's custom book reading list
  const handleDelete = async (userId, bookId, book) => {
    const data = await deleteBookFromCustomList(userId, bookId, book);
    console.log(data);
    //alert(data.message);
    notifySuccess("Removed book from list!")
    getCustomList(userId);
  };

  const showInfo = (book) => {
    setBookInformation({
      _id: book._id,
      title: book.title,
      author: book.author,
      releaseDate: book.releaseDate,
      description: book.description,
      imgurl: book.imgurl,
      genres: book.genres,
      avgRating: book.avgRating,
      likedPercentage: book.likedPercentage,
      ratingDistribution: book.ratingDistribution,
    });

    setShowBookInfoModal(true);
  }

  //content variable to hold UI markup depending on if there is a list to render or not
  let content;

  if (loading) {
    content = <p className="other-message">Loading...</p>;
  }

  if (customListNames.length === 0) {
    content = <p className="other-message">No list created yet</p>;
  }

  if (!loading && customListNames.length > 0) {
    content = customListNames.map((bookName) => {
      let bookData = customList[bookName];
      if (bookData.length === 0) {
        return (
          <>
            <section className="empty-customlist-con">
              <h3 className="customlist-title">{bookName}</h3>
              <p className="other-message">No books in this list</p>
            </section>
          </>
        );
      } else {
        let booklist = bookData.map((book) => {
          return (
            <>
            <div className="book-card" key={book._id}>
              <div className="image-con">
                <img src={book.imgurl} alt={book.title} className="image" onClick={() => showInfo(book)} />
              </div>
              <div className="details-con">
                <h5 className="title">
                  <span>Title</span> {book.title}
                </h5>
                <h5 className="author">
                  <span>Author</span> {book.author}
                </h5>
                <footer className="card-footer">
                  <div className="icon-con">
                    <FaTrashAlt
                      className="trash-icon"
                      onClick={() => handleDelete(userId, book._id, bookName)}
                    />
                  </div>
                </footer>
              </div>
            </div>
            </>
          );
        });
        return (
          <>
            <h2 className="customlist-title">{bookName}</h2>
            <section className="each-customlist-con">{booklist}</section>
            <Toaster position="bottom-right" reverseOrder={false} />
          </>
        );
      }

    });
  }

  return content;
};

export default CustomList;
