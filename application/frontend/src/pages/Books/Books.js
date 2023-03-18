import React, { useEffect, useRef, useState } from "react";
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
  const [tab, setTab] = useState("to read");
  const closeModal = () => {
    setShowModal(true);
  };

  const activeTab = useRef();

  const toReadTab = useRef(null);
  const readingTab = useRef(null);
  const finishedTab = useRef(null);
  const customTab = useRef(null);

  useEffect(() => {
    toReadTab.current.classList.add("active-tab");
  }, []);
  const toggleTab = (e, name) => {
    console.log(e.target);
    toReadTab.current.classList.remove("active-tab");
    readingTab.current.classList.remove("active-tab");
    finishedTab.current.classList.remove("active-tab");
    customTab.current.classList.remove("active-tab");
    e.target.classList.add("active-tab");
    setTab(name);
  };

  return (
    <div className="booklist-component">
      <div className="tab-btns">
        <button onClick={(e) => toggleTab(e, "to read")} ref={toReadTab}>
          To read
        </button>
        <button onClick={(e) => toggleTab(e, "reading")} ref={readingTab}>
          Currently reading
        </button>
        <button onClick={(e) => toggleTab(e, "finished")} ref={finishedTab}>
          finished reading
        </button>
        <button onClick={(e) => toggleTab(e, "custom")} ref={customTab}>
          Custom list
        </button>
      </div>

      {tab == "to read" && (
        <div style={{ background: "#f7dc65c1", minHeight: "80vh" }}>
          {/* <h2 className="section-title">To read:</h2> */}
          <section className="main-con">
            <ToReadList />
          </section>
        </div>
      )}

      {tab == "reading" && (
        <div style={{ background: "#f7dc65c1", minHeight: "80vh" }}>
          {/* <h2 className="section-title">Currently reading:</h2> */}
          <section className="main-con">
            <CurrentlyReadingList />
          </section>
        </div>
      )}

      {tab == "finished" && (
        <div style={{ background: "#f7dc65c1", minHeight: "80vh" }}>
          {/* <h2 className="section-title">Finished:</h2> */}
          <section className="main-con">
            <FinishedList />
          </section>
        </div>
      )}

      {tab == "custom" && (
        <div style={{ background: "#f7dc65c1", minHeight: "80vh" }}>
          {/* <h2 className="section-title">Custom list:</h2> */}
          <div>
            <button className="btn" onClick={closeModal}>
              Create/Edit custom list
            </button>
          </div>

          <section className="custom-list">
            <CustomList />
          </section>
        </div>
      )}
    </div>
  );
};

export default Books;

// <div>
//   <button onClick={getSessionDetails}>check</button>
// </div>
