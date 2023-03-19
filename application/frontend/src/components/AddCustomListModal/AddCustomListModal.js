import React, { useState, useEffect, useRef } from "react";
import "./style.css";
import { FaTrash, FaTimes } from "react-icons/fa";
import { useGlobalContext } from "../../context";
import toast, { Toaster } from "react-hot-toast";

const AddCustomListModal = () => {
  const {
    createCustomList,
    getCustomList,
    user,
    customListNames,
    customList,
    deleteCustomList,
    showModal,
    setShowModal,
  } = useGlobalContext();

  function notifySuccess(message) {
    toast.success(message);
  }

  const [listName, setListName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCustomList(user.id);
  }, []);

  const closeModal = () => {
    setShowModal(false);
  };

  const handleCreateList = async (e) => {
    setLoading(true);
    e.preventDefault();
    const data = await createCustomList(user.id, listName);
    //alert(data.message);
    notifySuccess(data.message);
    setLoading(false);
    getCustomList(user.id);
  };

  const handleDeleteList = async (e) => {
    setLoading(true);
    e.preventDefault();
    const listName = e.currentTarget.getAttribute("listname");
    const data = await deleteCustomList(user.id, listName);
    //alert(data.message);
    notifySuccess(data.message);
    setLoading(false);
    getCustomList(user.id);
  };

  return (
    <section className="main-sec">
      <div className="modal-content">
        <FaTimes className="close-modal-icon" onClick={closeModal} />
        <h4>Create custom list</h4>
        <form action="">
          <div>
            <label htmlFor="list name">List name</label>
            <input
              type="text"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
            />
          </div>
          <button onClick={handleCreateList} disabled={loading}>
            Create list
          </button>
        </form>
        <section className="custom-list-con">
          <h4>My custom lists:</h4>
          <div className="list-con">
            {customListNames.length > 0 &&
              customListNames.map((list, index) => {
                return (
                  <div key={index}>
                    <p>{list}</p>
                    <FaTrash
                      className="delete-icon"
                      onClick={handleDeleteList}
                      listname={list}
                    />
                  </div>
                );
              })}
          </div>
        </section>
        <Toaster position="bottom-right" reverseOrder={false} />
      </div>
    </section>
  );
};

export default AddCustomListModal;
