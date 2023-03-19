import React, { useEffect, useState } from "react";
import { useGlobalContext } from "../../context";
import { FaTrash, FaTimes } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";

import "./style.css";
const SelectCustomListModal = () => {
  
  const {
    showSelectListModal,
    setShowSelectListModal,
    customListNames,
    getCustomList,
    selectedBook: bookId,
    user: { id: userId },
    addBookToCustomList,
  } = useGlobalContext();

  const [listName, setListName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCustomList(userId);
  }, []);

  const closeModal = () => {
    setShowSelectListModal(false);
  };

  function notifySuccess(message) {
    toast.success(message);
  }

  const handleSubmit = async () => {
    setLoading(true);
    const data = await addBookToCustomList(userId, bookId, listName);
    //alert(data.message);
    notifySuccess(data.message);
    setLoading(false);
  };
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
