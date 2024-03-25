import React, { useState } from 'react';

export const Dropdown = ({onModeChange}) => {
  const [selectedOption, setSelectedOption] = useState("HSV");

  const handleDropdownChange = (event) => {
    setSelectedOption(event.target.value);
    onModeChange(event.target.value);
  };

  return (
    <div className='Dropdown'>
      <div className="field ml-5">
        <label className="label has-text-light">Select mode:</label>
        <div className="control">
          <div className="select">
            <select onChange={handleDropdownChange} value={selectedOption}>
              <option value="HSV">HSV</option>
              <option value="YCbCr">YCbCr</option>
              <option value="Lab">Lab</option>
            </select>
          </div>
        </div>
      </div>

      {selectedOption && (
        <div>
          {}
        </div>
      )}
    </div>
  );
};
