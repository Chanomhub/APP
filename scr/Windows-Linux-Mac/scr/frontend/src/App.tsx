import React, { useState, useEffect } from 'react';
import './styles.css';

const App: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState<number>(1);

  useEffect(() => {
    fetchData();
  }, [page]);

  const fetchData = async () => {
    try {
      const response = await fetch('https://api.chanomhub.xyz/fetch-data?page=${page}');
      const responseData = await response.json();
      setData(responseData);
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
        {data.map((item, index) => (
          <div className="face" key={index}>
            <img src={item.image} alt={Face ${index}} />
            <p>{item.title}</p>
          </div>
        ))}
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