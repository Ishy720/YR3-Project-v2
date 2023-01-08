import React from 'react'
import './Home.css'
import { useNavigate } from 'react-router-dom';

function Home() {

  function testServer() {

    fetch('http://localhost:8080/test').then(res =>
      res.json()
    ).then(data =>
      console.log(data.message)
    )

    let username = "Ismail";
    let age = 20;

    const userData = {
      username,
      age
    };

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    }

    fetch('http://localhost:8080/uploadUser', options).then(res =>
      res.json()
    ).then(data =>
      console.log(data.message)
    )
    
  }

  let navigate = useNavigate();

    return (
      <div className="home">
        <h1 id="pageTitle">Home</h1>

        <button onClick={testServer}>Test server</button>

        <button onClick={() => {navigate("/about")}}>To About page</button>
      </div>
    );
}

export default Home;