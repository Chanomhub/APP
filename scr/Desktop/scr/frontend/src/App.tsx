import React, { useState, useEffect } from 'react';
import './App.css';
import { parseHTML } from 'linkedom';
import CopyToClipboard from 'react-copy-to-clipboard';

interface Data {
  jetpack_featured_media_url: string | undefined;
  title: string;
  content: string;
}

const App: React.FC = () => {
  const [data, setData] = useState<Data[]>([]);
  const [page, setPage] = useState<number>(1);

  const fetchAndProcessData = async (pageNumber: number) => {
    try {
      const apiUrl = `https://api.chanomhub.xyz/fetch-data?page=${pageNumber}`;
      const response = await fetch(apiUrl);

      if (!response.ok) throw new Error('Network response was not ok');

      const pageData = await response.json() as Data[];
      setData(pageData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchAndProcessData(1);
  }, []);

 const extractLinks = (content: string): string[] => {
  const { document } = parseHTML(content);
  return Array.from(document.querySelectorAll('a.link'))
    .map((linkElement: Element) => linkElement.getAttribute('href') || '');
};


  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchAndProcessData(newPage);
  };

const extractImages = (content: string): string[] => {
  const { document } = parseHTML(content);
  return Array.from(document.querySelectorAll('img'))
    .map((imgElement: HTMLImageElement) => {
        // Construct proxy URL if needed
        const originalSrc = imgElement.getAttribute('src');
        if (originalSrc && !originalSrc.startsWith('http')) {
          return "http://127.0.0.1:8765/proxy?url=${originalSrc}";
        } else {
          return originalSrc || ''; 
        }
    });
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
                {/* Enhanced image display */}
            {extractImages(item.content).map((imageUrl, imageIndex) => (
              <picture key={imageIndex}>
                <img src={"http://localhost:8080/" + imageUrl} className='images' />
              </picture>
             ))}

            {/* Rest of your block component */}
                <div className="extracted-links">
                  <CopyToClipboard
                    text={extractLinks(item.content)[0]}
                    onCopy={() => console.log('Copied')}
                  >
                    <button className="copy-button">Copy Link</button>
                  </CopyToClipboard>
                </div>
                <div className='title'>
                  <p>{item.title}</p>
                </div>
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
