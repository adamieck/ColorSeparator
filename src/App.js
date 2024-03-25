import 'bulma/css/bulma.css';
import './App.css';
import { MainImage } from './MainImage';
import { ChannelImages } from './ChannelImages';
import { useState } from 'react';
import { Dropdown } from './Dropdown';

function App() {

  const [image, setImage] = useState(null);
  const [mode, setMode] = useState("HSV");

  const handleImageChange = (newImage) => {
    setImage(newImage);
  }

  const handleModeChange = (newMode) => {
    setMode(newMode);
  }


  return (
    <div className="SiteBox has-text-light">
      <h1 className='title is-2 mt-5 has-text-light' style={{textAlign: "center"}}>Color Channel Separator</h1>
      <Dropdown onModeChange={handleModeChange}/>
      <div className="Images">
        <MainImage onImageChange={handleImageChange} />
        {image && <ChannelImages imageSrc={image} mode={mode}/>}
      </div>
    </div>
  );
}

export default App;
