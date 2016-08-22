/*
Copyright (c) 2012 Juan Mellado

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var CT_HT = CT_HT || {};

CT_HT.Tracker = function(params){
  // this.params = params || {};

  // this.mask = new CT_CV.Image();
  // this.eroded = new CT_CV.Image();
  // this.contours = [];
  
  // this.skinner = new CT_HT.Skinner();
};

CT_HT.Tracker.prototype.detect = function(image){
  // this.skinner.mask(image, this.mask);

  // if (this.params.fast){
  //   this.blackBorder(this.mask);
  // }else{
  //   CT_CV.erode(this.mask, this.eroded);
  //   CT_CV.dilate(this.eroded, this.mask);
  // }

  this.contours = CT_CV.findContours(image);

  return this.findCandidate(this.contours, image.width * image.height * 0.004, 0.001);
};

CT_HT.Tracker.prototype.findCandidate = function(contours, minSize, epsilon){
  var biggestContours = [];
  var candidate;

  //sort contour function with biggest area contours first
  contours.sort(function(a, b){
    if (CT_CV.area(a) > CT_CV.area(b)){
      return -1;
    } 
    if (CT_CV.area(a) < CT_CV.area(b)){
      return 1;
    }
    else {
      return 0;
    }
  })

  //create biggestContours list
  for (var i = 0; i < contours.length; i++){
    if (CT_CV.area(contours[i]) < minSize){
      break;
    }
    biggestContours.push(CT_CV.approxPolyDP(contours[i], contours[i].length * epsilon))
  }
  
  candidate = new CT_HT.Candidate(biggestContours);

  return candidate;
};

CT_HT.Tracker.prototype.findMaxArea = function(contours, minSize){
  var len = contours.length, i = 0,
      maxArea = -Infinity, area, contour;
  for (; i < len; ++ i){
    area = CT_CV.area(contours[i]);
    if (area >= minSize){
    
      if (area > maxArea) {
        maxArea = area;
      
        contour = contours[i];
      }
    }
  }
  return contour;
};

CT_HT.Tracker.prototype.blackBorder = function(image){
  var img = image.data, width = image.width, height = image.height,
      pos = 0, i;

  for (i = 0; i < width; ++ i){
    img[pos ++] = 0;
  }
  
  for (i = 2; i < height; ++ i){
    img[pos] = img[pos + width - 1] = 0;

    pos += width;
  }

  for (i = 0; i < width; ++ i){
    img[pos ++] = 0;
  }
  
  return image;
};

CT_HT.Candidate = function(biggestContours){
  this.contours = biggestContours;
  // this.hull = CT_CV.convexHull(biggestContours[0]);
  // this.defects = CT_CV.convexityDefects(biggestContours[0], this.hull);
};

CT_HT.Skinner = function(){
};

CT_HT.Skinner.prototype.mask = function(imageSrc, imageDst){
  // var src = imageSrc.data, dst = imageDst.data, len = src.length,
  //     i = 0, j = 0,
  //     r, g, b, h, s, v, value;

  // for(; i < len; i += 4){
  //   r = src[i];
  //   g = src[i + 1];
  //   b = src[i + 2];
  
  //   v = Math.max(r, g, b);
  //   s = v === 0? 0: 255 * ( v - Math.min(r, g, b) ) / v;
  //   h = 0;
    
  //   if (0 !== s){
  //     if (v === r){
  //       h = 30 * (g - b) / s;
  //     }else if (v === g){
  //       h = 60 + ( (b - r) / s);
  //     }else{
  //       h = 120 + ( (r - g) / s);
  //     }
  //     if (h < 0){
  //       h += 360;
  //     }
  //   }
    
  //   value = 0;

  //   if (v >= 15 && v <= 250){
  //     if (h >= 3 && h <= 33){
  //       value = 255;
  //     }
  //   }
    
  //   dst[j ++] = value;
  // }
  
  //make image binary (ie get rid of color/alpha data; 0 if black, 255 if white)
  // imageDst.width = imageSrc.width;
  // imageDst.height = imageSrc.height;

  // var src = imageSrc.data, dst = imageDst.data;
  // for (var i = 0; i < dst.length; i++){
  //   dst[i] = src[i*4]
  // }

  // return imageDst;
};
