import React, { useEffect, useState } from 'react';
import {
  rgbToYCbCr, rgbToHsv, createRgbToXyzMatrix,
  interpolateColor, labRoot, interpolateLab
} from './utils/colorUtils';
import { multiply } from 'mathjs'

const separateChannels = (imageSrc, mode, labProps) => {
  return new Promise((resolve) => {

    const image = new Image();
    image.src = imageSrc;

    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = image.width;
      canvas.height = image.height;

      ctx.drawImage(image, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      const firstChannel = new ImageData(imageData.width, imageData.height);
      const secondChannel = new ImageData(imageData.width, imageData.height);
      const thirdChannel = new ImageData(imageData.width, imageData.height);
      let MatM, Xw, Yw, Zw;
      if (mode === "Lab") {

        const xr = labProps.xr;
        const yr = labProps.yr;
        const xg = labProps.xg;
        const yg = labProps.yg;
        const xb = labProps.xb;
        const yb = labProps.yb;
        Xw = labProps.Xw;
        Yw = labProps.Yw;
        Zw = labProps.Zw;
        MatM = createRgbToXyzMatrix(xr, yr, xg, yg, xb, yb, Xw, Yw, Zw);
      }
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        if (mode === "HSV") {
          const [h, s, v] = rgbToHsv(r, g, b);

          firstChannel.data[i] = h;
          firstChannel.data[i + 1] = h;
          firstChannel.data[i + 2] = h;

          secondChannel.data[i] = s;
          secondChannel.data[i + 1] = s;
          secondChannel.data[i + 2] = s;

          thirdChannel.data[i] = v;
          thirdChannel.data[i + 1] = v;
          thirdChannel.data[i + 2] = v;
        }
        else if (mode === "YCbCr") {
          const [y, Cb, Cr] = rgbToYCbCr(r, g, b);

          firstChannel.data[i] = y;
          firstChannel.data[i + 1] = y;
          firstChannel.data[i + 2] = y;

          const interpCb = interpolateColor(Cb, [127, 255, 0], [127, 0, 255]);
          secondChannel.data[i] = interpCb[0];
          secondChannel.data[i + 1] = interpCb[1];
          secondChannel.data[i + 2] = interpCb[2];
          const interpCr = interpolateColor(Cr, [0, 255, 127], [255, 0, 127]);
          thirdChannel.data[i] = interpCr[0];
          thirdChannel.data[i + 1] = interpCr[1];
          thirdChannel.data[i + 2] = interpCr[2];
        }
        else if (mode === "Lab") {
          const R = data[i] / 255.0;
          const G = data[i + 1] / 255.0;
          const B = data[i + 2] / 255.0;

          const XYZ = multiply(MatM, [[R], [G], [B]]);

          const X = XYZ.get([0, 0]);
          const Y = XYZ.get([1, 0]);
          const Z = XYZ.get([2, 0]);


          const x = labRoot(X / Xw);
          const y = labRoot(Y / Yw);
          const z = labRoot(Z / Zw);


          const L = 116 * y - 16;
          const a = 500 * (x - y);
          const b = 200 * (y - z);

          firstChannel.data[i] = L;
          firstChannel.data[i + 1] = L;
          firstChannel.data[i + 2] = L;

          const interpA = interpolateLab(a, [0, 255, 127], [255, 0, 127]);
          secondChannel.data[i] = interpA[0];
          secondChannel.data[i + 1] = interpA[1];
          secondChannel.data[i + 2] = interpA[2];
          const interpB = interpolateLab(b, [0, 127, 255], [255, 127, 0]);
          thirdChannel.data[i] = interpB[0];
          thirdChannel.data[i + 1] = interpB[1];
          thirdChannel.data[i + 2] = interpB[2];

        }

        // max alpha channel, make sure all is opaque
        firstChannel.data[i + 3] = 255;
        secondChannel.data[i + 3] = 255;
        thirdChannel.data[i + 3] = 255;


      }

      const firstCanvas = document.createElement('canvas');
      const secondCanvas = document.createElement('canvas');
      const thirdCanvas = document.createElement('canvas');

      firstCanvas.width = imageData.width;
      firstCanvas.height = imageData.height;
      secondCanvas.width = imageData.width;
      secondCanvas.height = imageData.height;
      thirdCanvas.width = imageData.width;
      thirdCanvas.height = imageData.height;

      firstCanvas.getContext('2d').putImageData(firstChannel, 0, 0);
      secondCanvas.getContext('2d').putImageData(secondChannel, 0, 0);
      thirdCanvas.getContext('2d').putImageData(thirdChannel, 0, 0);

      const firstDataURL = firstCanvas.toDataURL();
      const secondDataURL = secondCanvas.toDataURL();
      const thirdDataURL = thirdCanvas.toDataURL();

      resolve(
        { firstDataURL, secondDataURL, thirdDataURL }
      );
    }
  });
}

export const ChannelImages = ({ imageSrc, mode }) => {
  const [reload, setReload] = useState(false);
  const [channelImages, setChannelImages] = useState({});
  const [labParams, setLabParams] = useState({
    xr: 0.64,
    yr: 0.33,
    xg: 0.3,
    yg: 0.6,
    xb: 0.15,
    yb: 0.06,
    Xw: 95.047,
    Yw: 100,
    Zw: 108.883
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLabParams((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };
  useEffect(() => {
    separateChannels(imageSrc, mode, labParams).then((images) => {
      setChannelImages(images);
    });
  }, [imageSrc, mode, reload]);

  const handleApplyClick = () => {
    console.log('Input values:', labParams);
    setReload(!reload);
  };

  return (
    <div>
      {mode === "Lab" &&
        <div>
          <div style={{ display: 'flex', gridGap: '5px', alignItems: 'center' }}>
            {/* First row */}
            <label>
              Red x:
              <input className="input" name="xr" type="number" onChange={handleChange} value={labParams.xr} />
            </label>
            <label>
              Red y:
              <input className="input" name="yr" type="number" onChange={handleChange} value={labParams.yr} />
            </label>

            <label>
              Green x:
              <input className="input" name="xg" type="number" onChange={handleChange} value={labParams.xg} />
            </label>
            <label>
              Green y:
              <input className="input" name="yg" type="number" onChange={handleChange} value={labParams.yg} />
            </label>

            <label>
              Blue x:
              <input className="input" name="xb" type="number" onChange={handleChange} value={labParams.xb} />
            </label>
            <label>
              Blue y:
              <input className="input" name="yb" type="number" onChange={handleChange} value={labParams.yb} />
            </label>

            <label>
              White Point X:
              <input className="input" name="Xw" type="number" onChange={handleChange} value={labParams.Xw} />
            </label>
            <label>
              White Point Y:
              <input className="input" name="Yw" type="number" onChange={handleChange} value={labParams.Yw} />
            </label>
            <label>
              White Point Z:
              <input className="input" name="Zw" type="number" onChange={handleChange} value={labParams.Zw} />
            </label>
          </div>
          <div className='buttons is-centered'>
            <button className="button is-primary" type="button" style={{ alignContent: "center" }} onClick={handleApplyClick}>
              Apply
            </button>
          </div>
        </div>

      }

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>


        <div>
          <p>{mode === "HSV" ? "H" : mode ==="YCbCr" ? "Y" : "L"}</p>
          <img src={channelImages.firstDataURL} alt="First Channel" style={{ border: '1px solid black' }} />
        </div>
        <div>
          <p>{mode === "HSV" ? "S" : mode ==="YCbCr" ? "Cb" : "a"}</p>
          <img src={channelImages.secondDataURL} alt="Second Channel" style={{ border: '1px solid black' }} />
        </div>
        <div>
          <p>{mode === "HSV" ? "V" : mode ==="YCbCr" ? "Cr" : "b"}</p>
          <img src={channelImages.thirdDataURL} alt="Third Channel" style={{ border: '1px solid black' }} />
        </div>
      </div>
    </div>
  );
};