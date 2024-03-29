//Imports
import React, { useEffect, useRef, useState } from "react";
import "./style.css";
import ToReadList from "../../components/ToReadList/ToReadList";
import CurrentlyReadingList from "../../components/CurrentlyReadingList/CurrentlyReadingList";
import FinishedList from "../../components/FinishedList/FinishedList";
import { useGlobalContext } from "../../context";
import CustomList from "../../components/CustomList/CustomList";

//Inventory Component
const Inventory = () => {

  //import required states
  const { showCustomListModal, setShowCustomListModal } = useGlobalContext();

  //hold selected tab state
  const [tab, setTab] = useState("to read");

  const closeModal = () => {
    setShowCustomListModal(true);
  };

  //declare a reference to the tabs so they can be toggled later
  const toReadTab = useRef(null);
  const readingTab = useRef(null);
  const finishedTab = useRef(null);
  const customTab = useRef(null);

  //open the to-read list tab on render
  useEffect(() => {
    toReadTab.current.classList.add("active-tab");
  }, []);
  
  //handle toggle tab event to show the clicked tab
  const toggleTab = (e, name) => {
    console.log(e.target);
    toReadTab.current.classList.remove("active-tab");
    readingTab.current.classList.remove("active-tab");
    finishedTab.current.classList.remove("active-tab");
    customTab.current.classList.remove("active-tab");
    e.target.classList.add("active-tab");
    setTab(name);
  };

  //return function containing JSX markup to display the UI elements
  return (
    <>
    <br></br>
    <div className="booklist-component">
      <h1 id="pageTitle">Your Inventory</h1>
      <div className="tab-btns">
        <button onClick={(e) => toggleTab(e, "to read")} ref={toReadTab}>
          To read
        </button>
        <button onClick={(e) => toggleTab(e, "reading")} ref={readingTab}>
          Currently reading
        </button>
        <button onClick={(e) => toggleTab(e, "finished")} ref={finishedTab}>
          Finished reading
        </button>
        <button onClick={(e) => toggleTab(e, "custom")} ref={customTab}>
          Custom lists
        </button>
      </div>

      {tab == "to read" && (
        <div style={{ minHeight: "80vh" }}>
          {/* <h2 className="section-title">To read:</h2> */}
          <section className="main-con">
            <ToReadList />
          </section>
        </div>
      )}

      {tab == "reading" && (
        <div style={{ minHeight: "80vh" }}>
          {/* <h2 className="section-title">Currently reading:</h2> */}
          <section className="main-con">
            <CurrentlyReadingList />
          </section>
        </div>
      )}

      {tab == "finished" && (
        <div style={{ minHeight: "80vh" }}>
          {/* <h2 className="section-title">Finished:</h2> */}
          <section className="main-con">
            <FinishedList />
          </section>
        </div>
      )}

      {tab == "custom" && (
        <div style={{ minHeight: "80vh" }}>
          {/* <div style={{ background: "#f7dc65c1", minHeight: "80vh" }}> */}
          {/* <h2 className="section-title">Custom list:</h2> */}
          <div>
            <button className="btn" onClick={closeModal}>
              Create/Edit Custom Lists
            </button>
          </div>

          <section className="custom-list">
            <CustomList />
          </section>
        </div>
      )}
    </div>
    </>
  );
};

export default Inventory;