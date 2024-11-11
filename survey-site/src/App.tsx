import React from 'react';
import ImageToggleForm from './ImageToggleForm'

const App: React.FC = () => {
  const generateImageUrls = (baseUrl: string, count: number, uniqueKey: string): string[] => {
    // Something is caching results in GCP. I'm just going to force unique keys because this app is throwaway.
    return Array.from({ length: count }, (_, index) => `${baseUrl}/${uniqueKey}${index + 1}.jpg`);
  };

  const images = generateImageUrls('https://storage.googleapis.com/photo-survey', 21, 'arizona'); // Adjust the count as needed

  return (
    <div style={{textAlign: 'center'}}>
      <h1>Hey, thanks for your help! </h1>
      <p>Tap a photo to select (red boarder appears). Tap again to deselect. </p>
      <p>Scroll to the bottom to submit</p>
      <p>(Check out the <a rel="noreferrer"  href="https://travisbumgarner.darkroom.com/" target='_blank'>Current Store</a> and <a href="https://travisbumgarner.photography" rel="noreferrer" target="_blank">Newly Updated Portfolio.</a>)</p>
      <ImageToggleForm images={images} />
    </div>
  );
};

export default App