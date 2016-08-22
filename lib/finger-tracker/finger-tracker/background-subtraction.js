/*
Credit for background subtration algorithm to: 

  BACKGROUND SUBTRACTION USING A PIXEL-WISE
  ADAPTIVE LEARNING RATE
  FOR OBJECT TRACKING INITIALIZATION
  Ka Ki Ng and Edward J. Delp
  Video and Image Processing Laboratories (VIPER)
  School of Electrical and Computer Engineering
  Purdue University
  West Lafayette, Indiana USA

Basic algorithm:
1) BACKGROUND DETECTION AND SUBTRACTION
  Using several (default 100) initial frames of the background, 
  we use intensity and color differences between current frames 
  and initial background frame averages to infer the foreground. 

  I modified the algorithm described in the above paper to include 
  color differences as this algorithm will mainly be used to detect 
  hands.

2) UPDATING BACKGROUND MODEL
  to account for movement/slight changes in the background we weight 
  the probability of a pixel being a background pixel by the temporal 
  duration of the backgorund pixel. ie if it doesnt stay in the 
  foreground for very long, it is probably a background pixel.

3) To do later, time permitting: SUDDEN ILLUMINATION CHANGE AND SHADING MODEL
  to account for lighting changes/camera auto exposure adjustments etc.
  this can also be accounted for largely by disabling autoexposure on webcam though
*/


class BG {
  
  constructor(stream, context, width, height){
    this.stream = stream;
    this.context = context;
    this.cw = width;
    this.ch = height;

    //this array will contain color and intensity data for each pixel averaged over the inital background frames
    //format: [r,g,b,intensity,r,g,b,intensity,...etc]
    this.backgroundAvg;
    //temporal background count: array containing number of frames the pixel has been a background pixel
    //format: [#frames,0,0,0,#frames,0,0,0,....etc]
    this.temporalBCG;

    //averages of intensity and colors to be used in adaptive thresholds
    this.foremeanI;
    this.backmeanI;
    this.foremeanR;
    this.backmeanR;
    this.foremeanG;
    this.backmeanG;
    this.foremeanB;
    this.backmeanB;
    
    //number of foreground and background pixels
    this.numfore;
    this.numback;

    //initial values for intensity and color thresholds
    this.ithreshold;
    this.cthreshold;

    //number of background frames capture in beginning
    this.numBackFrames = 100;
    this.dilateRadius = 5;
    this.erodeRadius = 4;

    //image data and pixel array within image data respectively
    this.idata; 
    this.data;

    this.shortimg = new CV.Image();
    this.shortimg.width = width;
    this.shortimg.height = height;

    this.captureBackground();
  }

  //requires stream, context, width, height
  //returns arrays describing background
  captureBackground() {
    //reset values
    this.foremeanI = 0;
    this.backmeanI = 0;
    this.foremeanR = 0;
    this.backmeanR = 0;
    this.foremeanG = 0;
    this.backmeanG = 0;
    this.foremeanB = 0;
    this.backmeanB = 0;
    this.numfore = 0;
    this.numback = 0;
    this.ithreshold = 127;
    this.cthreshold = 20;

    //get data from stream
    var background = this.context.getImageData(0, 0, this.cw, this.ch);
    var backgroundData = background.data;
    this.backgroundAvg = new Array(backgroundData.length);
    this.temporalBCG = new Array(backgroundData.length).fill(0);

    for (var j = 0; j < this.numBackFrames; j++){

      this.context.drawImage(this.stream, 0, 0, this.cw, this.ch);
      background = this.context.getImageData(0, 0, this.cw, this.ch);
      backgroundData = background.data;

      for(var i = 0; i < backgroundData.length ; i+=4) {
        if (this.stream.readyState === this.stream.HAVE_ENOUGH_DATA){
          var r = backgroundData[i];
          var g = backgroundData[i+1];
          var b = backgroundData[i+2];
          var brightness = (3*r+4*g+b)>>>3;
          if (this.backgroundAvg[i] === undefined){
            this.backgroundAvg[i] = r;
          } else {
            this.backgroundAvg[i] += r;
          }
          if (this.backgroundAvg[i+1] === undefined){
            this.backgroundAvg[i+1] = g;
          } else {
            this.backgroundAvg[i+1] += g;
          }
          if (this.backgroundAvg[i+2] === undefined){
            this.backgroundAvg[i+2] = b;
          } else {
            this.backgroundAvg[i+2] += b;
          }
          if (this.backgroundAvg[i+3] === undefined){
            this.backgroundAvg[i+3] = brightness;
          } else {
            this.backgroundAvg[i+3] += brightness;
          }
        } else {
          sleep(20);
        }
      }
    }

    for (var k = 0; k < this.backgroundAvg.length; k++){
      this.backgroundAvg[k] /= this.numBackFrames;
    }
  }

  //makes a binary image, subtracts background, etc
  //requires stream, context, width, height
  //returns a binary image of foreground
  computeImage() {

    //get data from video stream
    this.context.drawImage(this.stream,0,0,this.cw,this.ch);

    this.idata = this.context.getImageData(0,0,this.cw,this.ch);
    this.data = this.idata.data;

    //loop through pixels 
    //compare color and intensity data of each pixel at location (x,y) to the average background pixel at location (x,y)
    for(var i = 0; i < this.data.length; i+=4) {
      var r = this.data[i];
      var g = this.data[i+1];
      var b = this.data[i+2];

      var currI = (3*r+4*g+b)>>>3;
      var backI = this.backgroundAvg[i+3];
      var iDiff = Math.abs(currI - backI);

      var rDiff = Math.abs(r - this.backgroundAvg[i]);
      var gDiff = Math.abs(g - this.backgroundAvg[i+1]);
      var bDiff = Math.abs(b - this.backgroundAvg[i+2]);
      var totalColorDiff = rDiff + gDiff + bDiff;

      if (iDiff < this.ithreshold && totalColorDiff < this.cthreshold) { //background

        //make background pixels black
        //shortimg.data array is for cv stuff
        this.shortimg.data[i/4] = 0;

        //add color/intensity data about each pixel for average frame background color/intensity
        this.backmeanI += backI;
        this.backmeanR += this.backgroundAvg[i];
        this.backmeanG += this.backgroundAvg[i+1];
        this.backmeanB += this.backgroundAvg[i+2];
        this.numback ++;

        //update temporalBCG, this pixel has been a background pixel for +1 more frames
        this.temporalBCG[i] += 1;

        //to make things faster, dont call updateBackgroundModel
        this.updateBackgroundModel(currI, backI, i);


      } else { //foreground
        //make foreground pixels white
        //shortimg.data array is for cv stuff
        this.shortimg.data[i/4] = 1;

        //add color/intensity data about each pixel for average frame foreground color/intensity
        this.foremeanI += currI;
        this.foremeanR += r;
        this.foremeanG += g;
        this.foremeanB += b;            
        this.numfore ++;

        //reset temporalBCG, this pixel has been a background pixel for 0 frames (its in the foreground now)
        this.temporalBCG[i] = 0;
      }
    }
    for (var i = 0; i < (this.shortimg.data.length/30); i++){
      this.shortimg.data[i] = 0;
      this.shortimg.data[this.shortimg.data.length-(i+1)] = 0;
    }

    //adapt the intensity threshold
    this.ithreshold = ((this.foremeanI/this.numfore) + (this.backmeanI/this.numback))/2;

    //adapt the color threshold
    var redMid = ((this.foremeanR/this.numfore) + (this.backmeanR/this.numback))/2;
    var greenMid = ((this.foremeanG/this.numfore) + (this.backmeanG/this.numback))/2;
    var blueMid = ((this.foremeanB/this.numfore) + (this.backmeanB/this.numback))/2;
    this.cthreshold = Math.min(redMid, blueMid, greenMid);

    this.dilate(this.dilateRadius);
    this.erode(this.erodeRadius);

    return this.shortimg;
  }

  // you can ignore this gnarly math stuff, most of it is just constants have had been empirically determined
  // if you really wanna understand it, read the paper referenced above
  updateBackgroundModel(currI, backI, i){
    var iDiff = Math.abs(currI - backI);
    var cbg = Math.min(150,this.temporalBCG[i]);

    //a1 weights the probability of the background pixel based on how high the difference in intensity is;         
    var exp1 = ((-5) * Math.pow(iDiff,2))/(2 * this.ithreshold);
    var a1 = Math.pow(Math.E, exp1);
    
    //a2 weights the probability of the background pixel based on how long the background pixel has been a background pixel;
    var exp2 = -Math.pow((150 - cbg),2)/450;
    var a2 = Math.pow(Math.E, exp2);
    
    //weight intensity probability and temporal probability, you can change the weights tho as long as w1 + w2 <= 1
    var alpha = (0.75 * a1) + (0.25 * a2);
    this.backgroundAvg[i+3] = (alpha * currI) + ((1 - alpha) * backI);
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
    this.shortimg.height = this.ch;
    this.shortimg.width = this.cw;
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


}

