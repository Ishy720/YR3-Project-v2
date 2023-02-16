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

        <h2>Manage all your books in one place.</h2>
        <button onClick={() => {navigate("/discover")}}>Explore books now -></button>

        <button onClick={testServer}>Test server</button>



        <h3>Our newest additions:</h3>
      </div>
    );
}

export default Home;