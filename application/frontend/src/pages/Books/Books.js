import React from "react";
import axios from "axios";
axios.defaults.withCredentials = true;
const Books = () => {
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
  }

  return (
    <div>
      <button onClick={getSessionDetails}>check</button>
    </div>
  );
};

export default Books;
