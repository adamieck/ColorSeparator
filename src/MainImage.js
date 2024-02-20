import React, { useState } from "react";
import { hsvToRgb } from "./utils/colorUtils";

export const MainImage = ({ onImageChange }) => {

    const [selectedImage, setSelectedImage] = useState(null);

    const dataURLtoBlob = (dataURL) => {
        const byteString = atob(dataURL.split(',')[1]);
        const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];

        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);

        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        return new Blob([ab], { type: mimeString });
    };

    const createImage = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 600;
        const context = canvas.getContext("2d");

        // Draw HSV circle
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = canvas.width / 3;

        const imageData = context.createImageData(canvas.width, canvas.height);
        const data = imageData.data;

        const borderWidth = 40;


        for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
                const angle = Math.atan2(y - centerY, x - centerX);
                const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
                const hue = ((angle + Math.PI) / (2 * Math.PI)) * 360;
                const saturation = 1;
                const value = distance <= radius ? 1 : 0;

                const rgb = hsvToRgb(hue, saturation, value);
                const index = (y * canvas.width + x) * 4;

                data[index] = rgb.r;
                data[index + 1] = rgb.g;
                data[index + 2] = rgb.b;
                data[index + 3] = 255; // Alpha channel

                // background and border
                if(rgb.r === 0 && rgb.g === 0 && rgb.b ===0  && x >= borderWidth 
                    && x <= canvas.width - borderWidth && y >= borderWidth && y <= canvas.height - borderWidth) {
                    data[index] = 255;
                    data[index + 1] = 255;
                    data[index + 2] = 255;
                    data[index + 3] = 255; // Alpha channel
                }

                
            }
        }
        // Draw white background
        context.fillStyle = "#ffffff"; // white color
        context.fillRect(20, 20, canvas.width - 20, canvas.height - 20);

        context.putImageData(imageData, 0, 0);
        const dataUrl = canvas.toDataURL();
        console.log("canvas: " + canvas);
        console.log(dataUrl);
        // need to convert canvas to input file
        const blob = dataURLtoBlob(dataUrl);
        const newImage = new File([blob], 'image.png', { type: 'image/png' });
        setSelectedImage(newImage);
        onImageChange(URL.createObjectURL(newImage));
    };

    return (
        <div>
            {selectedImage && (
                <div>
                    <img
                        alt="not found"
                        width={"600px"}
                        src={URL.createObjectURL(selectedImage)}
                    />
                    <br />
                </div>

            )}
            <br />
            <br />

            <div className="file has-name is-boxed is-centered">
                <label className="file-label">
                    <input className="file-input" type="file" name="resume"
                        onChange={(event) => {
                            setSelectedImage(event.target.files[0]);
                            onImageChange(URL.createObjectURL(event.target.files[0]));
                        }} />
                    <span className="file-cta">
                        <span className="file-icon">
                            <i className="fas fa-upload"></i>
                        </span>
                        <span className="file-label">
                            Choose a file…
                        </span>
                    </span>
                    <span className="file-name">
                        {selectedImage ? selectedImage.name : ''}
                    </span>
                </label>
            </div>
            <br />

            <button className="button is-primary" onClick={createImage}>Create Image</button>

            <br />



        </div>

    );
};
