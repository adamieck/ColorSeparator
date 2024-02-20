import { matrix, multiply, inv } from 'mathjs'


export function rgbToHsv(r, g, b) {
    

    r = r / 255.0;
    g = g / 255.0;
    b = b / 255.0;

    var cmax = Math.max(r, Math.max(g, b)); 
    var cmin = Math.min(r, Math.min(g, b)); 
    var diff = cmax - cmin; 
    var h = -1, s = -1;

    if (cmax === cmin)
        h = 0;

    else if (cmax === r)
        h = (60 * ((g - b) / diff) + 360) % 360;

    else if (cmax === g)
        h = (60 * ((b - r) / diff) + 120) % 360;

    else if (cmax === b)
        h = (60 * ((r - g) / diff) + 240) % 360;

    if (cmax === 0)
        s = 0;
    else
        s = (diff / cmax) * 100;

    var v = cmax * 100;
    return [h, s, v];
}


export function rgbToYCbCr(R, G, B) {
    const r = R / 255;
    const g = G / 255;
    const b = B / 255;

    const y = 0.299 * r + 0.587 * g + 0.114 * b;
    const Cb = (b - y) / 1.772 + 0.5;
    const Cr = (r - y) / 1.402 + 0.5;

    return [y*255, Cb*255, Cr*255];
}

export const interpolateColor = (val, startColor, endColor) => {

  const interpolatedColor = startColor.map((channel, index) => {
    const delta = endColor[index] - channel;
    return Math.round(channel + (delta / 255) * val);
  });

  return interpolatedColor;
  };


export function interpolateLab(v, startColor, endColor) {
    const factor = (v + 127) / 254;
    const interpolatedColor = startColor.map((low, i) =>
        Math.round(low + factor * (endColor[i] - low))
    );

    return interpolatedColor;
}

export const createRgbToXyzMatrix = (xr, yr, xg, yg, xb, yb, Xw, Yw, Zw) => {

    const Xr = xr / yr;
    const Yr = 1;
    const Zr = (1 - xr - yr) / yr;
    const Xg = xg / yg;
    const Yg = 1;
    const Zg = (1 - xg - yg)/ yg;
    const Xb = xb / yb;
    const Yb = 1;
    const Zb = (1 - xb - yb) / yb;

    const matS = multiply(inv([[Xr,Xg,Xb], [Yr, Yg, Yb], [Zr, Zg, Zb]]),matrix([[Xw],[Yw],[Zw]]));
    const matM = matrix([[matS.get([0,0])*Xr, matS.get([1,0]) * Xg, matS.get([2,0])*Xb],
        [matS.get([0,0])*Yr, matS.get([1,0]) * Yg, matS.get([2,0])*Yb],
        [matS.get([0,0])*Zr, matS.get([1,0]) * Zg, matS.get([2,0])*Zb]]);
    return matM;
}

export const labRoot = (n) => {
    const i = Math.cbrt(n);
    return n > 0.008856 ? i : 7.787 * n + 16 / 116;
}

export const hsvToRgb = (h, s, v) => {
    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;

    let r, g, b;

    if (h >= 0 && h < 60) {
      [r, g, b] = [c, x, 0];
    } else if (h >= 60 && h < 120) {
      [r, g, b] = [x, c, 0];
    } else if (h >= 120 && h < 180) {
      [r, g, b] = [0, c, x];
    } else if (h >= 180 && h < 240) {
      [r, g, b] = [0, x, c];
    } else if (h >= 240 && h < 300) {
      [r, g, b] = [x, 0, c];
    } else {
      [r, g, b] = [c, 0, x];
    }

    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255),
    };
  };