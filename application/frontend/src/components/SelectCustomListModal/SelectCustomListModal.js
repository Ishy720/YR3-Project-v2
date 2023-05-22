//Imports
import React, { useEffect, useState } from "react";
import { useGlobalContext } from "../../context";
import { FaTrash, FaTimes } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import "./style.css";

//SelectCustomListModal Component, used to render a modal overlay giving the user options of which custom list they want to add 
//their selected book to.
const SelectCustomListModal = () => {

  //import required states
  const {
    setShowSelectListModal,
    customListNames,
    getCustomList,
    selectedBook: bookId,
    user: { id: userId },
    addBookToCustomList,
  } = useGlobalContext();

  //state variables
  const [listName, setListName] = useState("");
  const [loading, setLoading] = useState(false);

  //on render get the user's custom lists
  useEffect(() => {
    getCustomList(userId);
  }, []);

  const closeModal = () => {
    setShowSelectListModal(false);
  };

  function notifySuccess(message) {
    toast.success(message);
  }

  //event handler which adds the user's selected book to their custom list
  const handleSubmit = async () => {
    setLoading(true);
    const data = await addBookToCustomList(userId, bookId, listName);
    //alert(data.message);
    notifySuccess(data.message);
    setLoading(false);
  };

  //return function containing JSX markup to display the UI elements
  return (
    <section className="main-sec">
      <div className="modal-content">
        <FaTimes className="close-modal-icon" onClick={closeModal} />
        <h4>Select custom list to add book to:</h4>
        {customListNames.length > 0 ? (
          <>
            <select
              className="list-con"
              onChange={(e) => setListName(e.target.value)}
            >
              <option value=""></option>
              {customListNames.map((list, index) => {
                return (
                  <option key={index} value={list}>
                    {list}
                  </option>
                );
              })}
            </select>
            <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
              Add
            </button>
          </>
        ) : (
          <p>Create custom list</p>
        )}
      </div>
      <Toaster position="bottom-right" reverseOrder={false} />
    </section>
  );
};

export default SelectCustomListModal;
