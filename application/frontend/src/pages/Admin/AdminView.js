import React, { useState, useEffect } from 'react';
import "./AdminView.css"

function AdminView() {

  const [totalBookCount, setTotalBookCount] = useState(0);
  const [totalUserCount, setTotalUserCount] = useState(0);
  const [mostCommonBook, setMostCommonBook] = useState({});
  const [topGenres, setTopGenres] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8080/getSiteAnalytics', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + sessionStorage.getItem("token")
      },
      body: JSON.stringify({})
    })
      .then(response => response.json())
      .then(data => {
        console.log(data);
        setTotalBookCount(data.totalBookCount);
        setTotalUserCount(data.totalUserCount);
        setMostCommonBook(data.mostCommonBook);
        setTopGenres(data.genreCounts);
        setIsLoading(false);
      })
      .catch(error => {
        console.log(error);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <>
        <h1 id="pageTitle">Admin Page</h1>
        <p>Loading analytics...</p>
      </>
    );
  }

  return (
    <div id="adminPage">
      <h1 id="pageTitle">Admin Page</h1>
      <h2>Website Analytics</h2>
  
      <div id="cardsContainer">
        <div className="card">
          <h3>Total registered books in the website:</h3>
          <p>{totalBookCount}</p>
        </div>
  
        <div className="card">
          <h3>Total number of users registered with the website:</h3>
          <p>{totalUserCount - 1}</p>
        </div>
  
        <div className="card">
          <h3>Most commonly found book across all users:</h3>
          <img src={mostCommonBook[0]._id.imgurl} alt="Book cover" />
          <p>{mostCommonBook[0]._id.title}, written by {mostCommonBook[0]._id.author}</p>
          <p>A total of {mostCommonBook[0].count} users have this book in their core lists</p>
        </div>
  
        <div className="card">
          <h3>Top 5 genres with the most books:</h3>
          <ul>
            {topGenres.map(genre => 
              <li key={genre._id}>{genre._id}: {genre.count}</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default AdminView;