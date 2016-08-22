class CT {

  constructor(context, width, height, slider, numFingers){
    this.context = context;
    this.width = width;
    this.height = height;
    this.slider = slider;

    this.tracker = new CT_HT.Tracker();
    this.candidate;
    this.contours = [];
    this.center = {x:0, y:0};

    this.targetHue = 0;
    this.avgLum = 0;
    this.avgSat = 0;
    
    this.numFingers = 5;
    this.tips = [];
    this.targetArea = {x:width/2, y:height/2, size:40};

    this.shortimg = new CT_CV.Image();
    this.idata;
    this.data;

    this.dilateRadius = 3;
    this.erodeRadius = 3;

    this.fingersInitiated = false;
  }

  drawTargetArea(){
    this.context.strokeStyle = "white";
    this.context.strokeRect(this.targetArea.x-(this.targetArea.size/2),this.targetArea.y-(this.targetArea.size/2),this.targetArea.size,this.targetArea.size);
  }

  captureTargetHue(){
    var count = 0;
    var avgHue = 0;

    var idata = this.context.getImageData(Math.round(this.targetArea.x-(this.targetArea.size/2)),
                                           Math.round(this.targetArea.y-(this.targetArea.size/2)),
                                           this.targetArea.size,
                                           this.targetArea.size);
    var data = idata.data;

    for(var i = 0; i < data.length; i+=4) {
      var r = data[i];
      var g = data[i+1];
      var b = data[i+2];
      var hsl = this.rgbToHsl(r, g, b);
      var h = hsl[0];
      var s = hsl[1];
      var l = hsl[2];

      this.targetHue += h;
      this.avgSat += s;
      this.avgLum += l;
      count++;
    }

    this.targetHue /= count;
    this.avgLum /= count;
    this.avgSat /= count; 
  }

  analyzeImg(){
    this.idata = this.context.getImageData(0,0,this.width,this.height);
    this.data = this.idata.data;

    //loop through pixels 
    for(var i = 0; i < this.data.length; i+=4) {
      var r = this.data[i];
      var g = this.data[i+1];
      var b = this.data[i+2];
      var hsl = this.rgbToHsl(r, g, b);
      var h = hsl[0];
      var s = hsl[1];
      var l = hsl[2];

      if (Math.abs(h - this.targetHue) < this.slider.value){
        this.shortimg.data[i/4] = 1;
      } else {
        this.shortimg.data[i/4] = 0;
      }
    }

    this.dilate(this.dilateRadius);
    this.erode(this.erodeRadius);

    this.candidate = this.tracker.detect(this.shortimg);
    
    if (this.candidate !== undefined){
      this.contours = this.candidate.contours;
    }
  }
  
  displayBinImg(){
    for (var i = 0; i < this.data.length; i+=4){
      if (this.shortimg.data[i/4] === 0) {
        this.data[i] = 0;
        this.data[i+1] = 0;
        this.data[i+2] = 0;
      } else {
        this.data[i] = 255;
        this.data[i+1] = 255;
        this.data[i+2] = 255;
      }
    }

    this.context.putImageData(this.idata,0,0);
  }

  getFingertips(){
    var contourMidpoints = [];

    //establish initial finger positions
    if ((this.fingersInitiated === false) && (this.numFingers <= this.contours.length)) {
      this.tips = [];
      for (var j = 0; j < this.numFingers; j++){
        var contour = this.contours[j];
        var midp = this.midpoint(contour);
        this.tips.push(midp);
      }
      this.fingersInitiated = true;
    } 

    //if fingers already established, get midpoints of all contours, find closest to fingerpoints before and update
    else if (this.tips.length === this.numFingers){
      for (var j = 0; j < this.contours.length; j++){
        var contour = this.contours[j];
        var midp = this.midpoint(contour);
        contourMidpoints.push(midp);
      }

      for (var i = 0; i < this.numFingers; i++){
        if (contourMidpoints.length !== 0){
          var minDistIndex = this.findClosest(this.tips[i], contourMidpoints);
          this.tips[i] = contourMidpoints[minDistIndex];
          contourMidpoints.splice(minDistIndex,1);
        }
      }
    }

    this.center = {x:0, y:0};
    for (var i = 0; i < this.tips.length; i++){
      this.center.x += this.tips[i].x;
      this.center.y += this.tips[i].y;
    }
    this.center.x /= this.tips.length;
    this.center.y /= this.tips.length;

    // var that = this;
    // this.tips.sort(function(a, b){
    //   if ((((a.x-that.center.x)*(b.y-that.center.y)) - ((b.x-that.center.x)*(a.y-that.center.y))) < 0) return -1;
    //   if ((((a.x-that.center.x)*(b.y-that.center.y)) - ((b.x-that.center.x)*(a.y-that.center.y))) > 0) return 1;
    //   return 0;
    // });

    var colors = ["red", "yellow", "green", "blue", "purple"];
    if (this.tips.length === this.numFingers){
      for (var i = 0; i < this.numFingers; i++){
        this.context.strokeStyle = colors[i];
        this.context.strokeRect(this.tips[i].x - 4, this.tips[i].y - 4, 8, 8);
      }
    }
  }

  midpoint (contour){
    var midpoint = {x:0, y:0};
    var xmin = contour[0].x;
    var xmax = contour[0].x;
    var ymin = contour[0].y;
    var ymax = contour[0].y;
    var x,y;

    for (var i = 0; i < contour.length; i++){
      var x = contour[i].x;
      var y = contour[i].y;
      if (x > xmax){
        xmax = x;
      }
      if (x < xmin){
        xmin = x;
      }
      if (y > ymax){
        ymax = y;
      }  
      if (y < ymin){
        ymin = y;
      }
    }

    midpoint.x = Math.round((xmax-xmin)/2) + xmin;
    midpoint.y = Math.round((ymax-ymin)/2) + ymin;
    
    return midpoint;
  }

  findClosest(p, pList){
    var minDist = Math.hypot(p.x - pList[0].x, p.y - pList[0].y);
    var minDistIndex = 0;
    for (var i = 0; i < pList.length; i++){
      var dist = Math.hypot(p.x - pList[i].x, p.y - pList[i].y);
      if (dist < minDist){
        minDist = dist;
        minDistIndex = i;
      }
    }
    return minDistIndex;
  }

  dilate(k){
    this.manhattan(1);
    for (var i=0; i<this.shortimg.height; i++){
      for (var j=0; j<this.shortimg.width; j++){
        if (this.shortimg.data[(i*this.shortimg.width)+j]<=k) {
          this.shortimg.data[(i*this.shortimg.width)+j] = 255;
        } else {
          this.shortimg.data[(i*this.shortimg.width)+j] = 0;
        }
      }
    }
  }

  erode(k){  
    this.manhattan(0);
    for (var i=0; i<this.shortimg.height; i++){
      for (var j=0; j<this.shortimg.width; j++){
        if (this.shortimg.data[(i*this.shortimg.width)+j]<=k) {
          this.shortimg.data[(i*this.shortimg.width)+j] = 0;
        } else {
          this.shortimg.data[(i*this.shortimg.width)+j] = 255;
        }
      }
    }
  }

  manhattan(on){
    this.shortimg.height = this.height;
    this.shortimg.width = this.width;
    // traverse from top left to bottom right
    for (var i=0; i<this.shortimg.height; i++){
      for (var j=0; j<this.shortimg.width; j++){
        if (this.shortimg.data[(i*this.shortimg.width)+j] === on){
          // first pass and pixel was on, it gets a zero
          this.shortimg.data[(i*this.shortimg.width)+j] = 0;
        } else {
          // pixel was off
          // It is at most the sum of the lengths of the array
          // away from a pixel that is on
          this.shortimg.data[(i*this.shortimg.width)+j] = this.shortimg.height + this.shortimg.width;
          // or one more than the pixel to the north
          if (i>0) this.shortimg.data[(i*this.shortimg.width)+j] = Math.min(this.shortimg.data[(i*this.shortimg.width)+j], this.shortimg.data[((i-1)*this.shortimg.width)+j]+1);
          // or one more than the pixel to the west
          if (j>0) this.shortimg.data[(i*this.shortimg.width)+j] = Math.min(this.shortimg.data[(i*this.shortimg.width)+j], this.shortimg.data[(i*this.shortimg.width)+(j-1)]+1);
        }
      }
    }
    // traverse from bottom right to top left
    for (var i=this.shortimg.height-1; i>=0; i--){
      for (var j=this.shortimg.width-1; j>=0; j--){
        // either what we had on the first pass
        // or one more than the pixel to the south
        if (i+1<this.shortimg.height) this.shortimg.data[(i*this.shortimg.width)+j] = Math.min(this.shortimg.data[(i*this.shortimg.width)+j], this.shortimg.data[((i+1)*this.shortimg.width)+j]+1);
        // or one more than the pixel to the east
        if (j+1<this.shortimg.height) this.shortimg.data[(i*this.shortimg.width)+j] = Math.min(this.shortimg.data[(i*this.shortimg.width)+j], this.shortimg.data[(i*this.shortimg.width)+(j+1)]+1);
      }
    }
  }

  /**
  * Converts an RGB color value to HSL. Conversion formula
  * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
  * Assumes r, g, and b are contained in the set [0, 255] and
  * returns h, s, and l in the set [0, 1].
  *
  * @param   Number  r       The red color value
  * @param   Number  g       The green color value
  * @param   Number  b       The blue color value
  * @return  Array           The HSL representation
  */
  rgbToHsl(r, g, b){
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if(max == min){
        h = s = 0; // achromatic
    }else{
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
        h *= 360;
    }

    return [h, s, l];
  }
}