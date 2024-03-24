import React, { useState, useEffect } from 'react';
import './App.css';
import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';

interface Data {
  title: string;
  imageUrl: string; // Renamed for clarity
  content: string; 
  links: string[]; // Store extracted links
}

const App: React.FC = () => {
  const [data, setData] = useState<Data[]>([]);
  const [page, setPage] = useState<number>(1);

  const fetchAndProcessData = async (pageNumber: number) => {
    try {
      const apiUrl = `https://api.chanomhub.xyz/fetch-data?page=${pageNumber}`;
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const pageData = await response.json() as Data[]; // Type assertion

      setData(pageData);
    } catch (error) {
      console.error('Error fetching data:', error); 
    }
  };

  // Load initial data on mount
  useEffect(() => {
    fetchAndProcessData(1);
  }, []); 

const extractLinks = (content: string): string[] => {
  const dom = new JSDOM(content);
  const document = dom.window.document;
  return Array.from(document.querySelectorAll('.link'))
        .map(linkElement => linkElement.href || '');
};

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchAndProcessData(newPage);
  };

  const openRandomLink = (links: string[]) => {
    if (links.length > 0) {
      const randomIndex = Math.floor(Math.random() * links.length);
      window.open(links[randomIndex], '_blank');
    }
  }

  // ... (Your saveImage function)
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
        <img src={item.jetpack_featured_media_url} className='images'/>
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
    
  </div>
 );
};

export default App;
