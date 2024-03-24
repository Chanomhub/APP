import React, { useState, useEffect } from 'react';
import './App.css';
import fs from 'fs';
import path from 'path';

interface Data {
 title: string;
 jetpack_featured_media_url: string;
}

const App: React.FC = () => {
  const [data, setData] = useState<Data[]>([]);
  const [page, setPage] = useState<number>(1);

  useEffect(() => {
    fetchFirstPageData();
  }, []);

  const fetchFirstPageData = async () => {
    try {
      const response = await fetch('https://api.chanomhub.xyz/fetch-data?page=1');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const firstPageData = await response.json();
      setData(firstPageData);
    } catch (error) {
      console.error('Error fetching first page data:', error);
    }
  };
const getRandomLink = (content: string) => {
    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(content, 'text/html');
    const links = Array.from(htmlDoc.getElementsByClassName('link'));
    if (links.length > 0) {
        const randomIndex = Math.floor(Math.random() * links.length);
        return links[randomIndex].getAttribute('href') || '';
    } else {
        return '#'; // หรือลิงก์เริ่มต้นอื่น ๆ ที่คุณต้องการ
    }
};

 

  const fetchData = async (newPage: number) => {
    try {
        const response = await fetch('https://api.chanomhub.xyz/fetch-data?page=' + newPage);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const pageData = await response.json();
        setData(pageData);
    } catch (error) {
        console.error('Error fetching data for page', newPage, ':', error);
    }
};

  

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchData(newPage);
  };

  const saveImage = async (url: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const imageData = await response.arrayBuffer();
      const imageFileName = url.split('/').pop() || 'image.jpg';
      const imagePath = path.join(__dirname, 'images', imageFileName);
      fs.writeFileSync(imagePath, Buffer.from(imageData));
    } catch (error) {
      console.error('Error saving image:', error);
    }
  };

  useEffect(() => {
    data.forEach(item => {
      saveImage(item.jetpack_featured_media_url);
    });
  }, [data]);

  return (
    <div className="container">
      <div className='Header'>
      <h1>Chaomhub</h1>
      </div>
      <div className="pagination">
        <button onClick={() => handlePageChange(page - 1)} disabled={page === 1}>
          Previous Page
        </button>
        <button onClick={() => handlePageChange(page + 1)}>Next Page</button>
      </div>

      <div className="faces-container">
    {data.length > 0 ? (
        data.map((item, index) => (
            <div className="row" key={index}>
                <div className='block'>
                    <picture>
                        <a href={getRandomLink(item.content)} target="_blank" rel="noopener noreferrer">
                            <img src={item.jetpack_featured_media_url} className='images' alt="Featured"/>
                        </a>
                    </picture>
                </div>
                <div className='title'>
                    <p>{item.title}</p>
                </div>
            </div>
        ))
    ) : (
        <div>Loading....</div>
    )}
</div>

  );
};

export default App;
