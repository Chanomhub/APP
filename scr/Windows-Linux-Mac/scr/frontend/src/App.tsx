import React, { useState, useEffect } from 'react';
import './App.css';

interface Data {
 title: string;
 jetpack_featured_media_url: string;

}

const App: React.FC = () => {
  const [data, setData] = useState<Data[]>([]);
  const [page, setPage] = useState<number>(1);

  useEffect(() => {
    fetchData();
  }, [page]);

  const fetchData = async () => {
    try {
      const response = await fetch('https://api.chanomhub.xyz/fetch-data?page=' + page);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const Data = await response.json();
      setData(Data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <div className="container">
      <h1>Change Faces</h1>
      <div className="faces-container">
        {data.length > 0 ? (
        data.map((Data, index) => (
          <div className="faace" key={index}>
            <img src={Data.jetpack_featured_media_url}></img>
            <p>{Data.title}</p>
          </div>
        ))
        ) : (

            <div> Lonading.... </div>
        )
        }
    
      </div>
      <div className="pagination">
        <button onClick={() => handlePageChange(page - 1)} disabled={page === 1}>
          Previous Page
        </button>
        <button onClick={() => handlePageChange(page + 1)}>Next Page</button>
      </div>
    </div>
  );
};

export default App;