import React, { useEffect, useState } from "react";
import axios from "axios";
import "./style.css";
import ToReadList from "../../components/ToReadList/ToReadList";
import CurrentlyReadingList from "../../components/CurrentlyReadingList/CurrentlyReadingList";
import FinishedList from "../../components/FinishedList/FinishedList";
import { useGlobalContext } from "../../context";
import CustomList from "../../components/CustomList/CustomList";
//axios.defaults.withCredentials = true;

const Books = () => {

  const { showModal, setShowModal } = useGlobalContext();

  const closeModal = () => {
    setShowModal(true);
  };

  return (
    <>
      <div>
        <h2 className="section-title">To read:</h2>
        <section className="main-con">
          <ToReadList />
        </section>
      </div>

      <div>
        <h2 className="section-title">Currently reading:</h2>
        <section className="main-con">
          <CurrentlyReadingList />
        </section>
      </div>

      <div>
        <h2 className="section-title">Finished:</h2>
        <section className="main-con">
          <FinishedList />
        </section>
      </div>

      <div>
        <h2 className="section-title">Custom list:</h2>
        <div>
          <button className="btn" onClick={closeModal}>
            Create/Edit custom list
          </button>
        </div>

        <section className="custom-list">
          <CustomList />
        </section>
      </div>

    </>
  );
};

export default Books;

// <div>
//   <button onClick={getSessionDetails}>check</button>
// </div>
