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
    <div>
      <h1 className='title is-2 mt-5' style={{textAlign: "center"}}>Color Channel Separator</h1>
      <Dropdown onModeChange={handleModeChange}/>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh'
      }}>
        <MainImage onImageChange={handleImageChange} />
        {image && <ChannelImages imageSrc={image} mode={mode} />}
      </div>
    </div>
  );
}

export default App;
