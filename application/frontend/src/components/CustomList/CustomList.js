import React, { useState, useEffect } from "react";
import { FaTrashAlt } from "react-icons/fa";
import { CiCircleMore } from "react-icons/ci";
import toast, { Toaster } from "react-hot-toast";

import { useGlobalContext } from "../../context";

const CustomList = () => {
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState(false);
  const {
    deleteBookFromCustomList,
    addToreadList,
    addToFinishedList,
    toreadlist,
    currentlyReadingList,
    getCurrentlyReadingList,
    setCurrentlyReadingList,
    setToReadList,
    finishedList,
    setFinishedList,
    user: { id: userId },
    getCustomList,
    customListNames,
    customList,
  } = useGlobalContext();

  function notifySuccess(message) {
    toast.success(message);
  }

  const getList = async () => {
    setLoading(true);
    getCustomList(userId);
    setLoading(false);
  };

  useEffect(() => {
    getList();
  }, []);

  const handleDelete = async (userId, bookId, book) => {
    const data = await deleteBookFromCustomList(userId, bookId, book);
    console.log(data);
    //alert(data.message);
    notifySuccess("Removed book from list!")
    getCustomList(userId);
  };

  let content;
  if (loading) {
    content = <p className="other-message">Loading......</p>;
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
            <div className="book-card" key={book._id}>
              <div className="image-con">
                <img src={book.imgurl} alt={book.title} className="image" />
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

      //   return display;
    });
  }

  return content;
};

export default CustomList;

//   return (
//     <div className="book-card" key={book._id}>
//       <div className="image-con">
//         <img src={book.imgurl} alt={book.title} className="image" />
//       </div>
//       <div className="details-con">
//         <h5 className="title">
//           <span>Title</span> {book.title}
//         </h5>
//         <h5 className="author">
//           <span>Author</span> {book.author}
//         </h5>
//         <h5 className="rating">
//           <span>Rating</span> {book.avgRating}
//         </h5>
//         <footer className="card-footer">
//           <p className="add-to">Add to:</p>
//           <div className="more-con">
//             <button
//               onClick={() => handleAddToReadList(userId, book._id)}
//               disabled={query}
//             >
//               To read
//             </button>
//             <button
//               onClick={() => handleAddToFinishedList(userId, book._id)}
//               disabled={query}
//             >
//               Finished reading
//             </button>
//           </div>
//           <div className="icon-con">
//             <FaTrashAlt
//               className="trash-icon"
//               onClick={() => deleteBook(userId, book._id)}
//             />
//           </div>
//         </footer>
//       </div>
//     </div>
//   );
