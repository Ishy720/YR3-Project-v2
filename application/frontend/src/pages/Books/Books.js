import React, { useEffect, useState } from "react";
import axios from "axios";
import "./style.css";
import ToReadList from "../../components/ToReadList/ToReadList";
import CurrentlyReadingList from "../../components/CurrentlyReadingList/CurrentlyReadingList";
import FinishedList from "../../components/FinishedList/FinishedList";

//axios.defaults.withCredentials = true;

const Books = () => {

  /*
  function getSessionDetails() {
    let settings = {
      method: "GET",
      // headers: {
      //   Authorization: `Bearer ${cookies.sessionId}`,
      // },
    };
    axios
      .get("http://localhost:8080/session")
      .then((res) => console.log(res.data));
    // fetch("http://localhost:8080/session", {
    //   withCredentials: true,
    //   credentials: "same-origin",
    // })
    //   .then((res) => res.json())
    //   .then((data) => {
    //     console.log(data);
    //   });
  }*/

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
    </>
  );
};

export default Books;

// <div>
//   <button onClick={getSessionDetails}>check</button>
// </div>
