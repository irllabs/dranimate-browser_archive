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

//this array will contain color and intensity data for each pixel averaged over the inital background frames
//format: [r,g,b,intensity,r,g,b,intensity,...etc]
var backgroundAvg;
//temporal background count: array containing number of frames the pixel has been a background pixel
//format: [#frames,0,0,0,#frames,0,0,0,....etc]
var temporalBCG; 

//averages of intensity and colors to be used in adaptive thresholds
var foremeanI;
var backmeanI;
var foremeanR;
var backmeanR;
var foremeanG;
var backmeanG;
var foremeanB;
var backmeanB;

//number of foreground and background pixels
var numfore;
var numback;

//initial values for intensity and color thresholds
var ithreshold;
var cthreshold;

//number of background frames capture in beginning
var numBackFrames = 100;
var dilateRadius = 3;
var erodeRadius = 4;

//image data and pixel array within image data respectively
var idata; 
var data;

var posFingertips = [];
var firstFrame = true;

//capture background gets average background
function captureBackground() {
  //reset values
  foremeanI = 0;
  backmeanI = 0;
  foremeanR = 0;
  backmeanR = 0;
  foremeanG = 0;
  backmeanG = 0;
  foremeanB = 0;
  backmeanB = 0;
  numfore = 0;
  numback = 0;
  ithreshold = 127;
  cthreshold = 20;

  //get data from stream
  var background = backContext.getImageData(0, 0, cw, ch);
  var backgroundData = background.data;
  backgroundAvg = new Array(backgroundData.length);
  temporalBCG = new Array(backgroundData.length).fill(0);

  for (var j = 0; j < numBackFrames; j++){

    backContext.drawImage(video, 0, 0, cw, ch);
    background = backContext.getImageData(0, 0, cw, ch);
    backgroundData = background.data;

    for(var i = 0; i < backgroundData.length ; i+=4) {
      if (video.readyState === video.HAVE_ENOUGH_DATA){
        var r = backgroundData[i];
        var g = backgroundData[i+1];
        var b = backgroundData[i+2];
        var brightness = (3*r+4*g+b)>>>3;
        if (backgroundAvg[i] === undefined){
          backgroundAvg[i] = r;
        } else {
          backgroundAvg[i] += r;
        }
        if (backgroundAvg[i+1] === undefined){
          backgroundAvg[i+1] = g;
        } else {
          backgroundAvg[i+1] += g;
        }
        if (backgroundAvg[i+2] === undefined){
          backgroundAvg[i+2] = b;
        } else {
          backgroundAvg[i+2] += b;
        }
        if (backgroundAvg[i+3] === undefined){
          backgroundAvg[i+3] = brightness;
        } else {
          backgroundAvg[i+3] += brightness;
        }
      } else {
        sleep(20);
      }
    }
  }

  for (var k = 0; k < backgroundAvg.length; k++){
    backgroundAvg[k] /= numBackFrames;
  }

  update();
}

function update(){

  requestAnimationFrame(update);

  if (video.readyState === video.HAVE_ENOUGH_DATA){
    //get the stream as a binary image
    computeImage();
    //get candidate with hull/defects/contour from libs
    candidate = tracker.detect(shortimg);
    
    if (candidate !== undefined){
      contour = candidate.contour;
      hull = candidate.hull;
      defects = candidate.defects;
    }

    var palmCenterX = 0;
    var palmCenterY = 0;
    var cnt = 0;
    defectArray = [];
    if (defects.length >= 4){
      for (var i = 0; i < defects.length; i++){
        defectArray.push({depth:defects[i].depth, x:defects[i].depthPoint.x, y:defects[i].depthPoint.y});

        palmCenterX += defects[i].depthPoint.x;
        palmCenterY += defects[i].depthPoint.y;
        cnt++;
      }

      palmCenterX = Math.round(palmCenterX/cnt);
      palmCenterY = Math.round(palmCenterY/cnt);

      defectArray.sort(function(a, b){
        if(a.depth < b.depth) return 1;
        if(a.depth > b.depth) return -1;
        return 0;
      });
    }

    hullArray = [];
    if (hull.length > 0){
      for (var i = 0; i < hull.length; i++){
        if (i === 0 || Math.hypot(hull[i].x-hull[i-1].x, hull[i].y-hull[i-1].y) > 20){
          hullArray.push({dist:Math.hypot(hull[i].x-palmCenterX, hull[i].y-palmCenterY), x:hull[i].x, y:hull[i].y});
        }
      }
      hullArray.sort(function(a, b){
        if(a.dist < b.dist) return -1;
        if(a.dist > b.dist) return 1;
        return 0;
      });
      hullArray = hullArray.slice(0,5);
    }

    // update and draw data
    for (var i = 0; i < data.length; i+=4){
      if (shortimg.data[i/4] === 0) {
        data[i] = 0;
        data[i+1] = 0;
        data[i+2] = 0;
      } else {
        data[i] = 255;
        data[i+1] = 255;
        data[i+2] = 255;
      }
    }

    idata.data = data;
    context.putImageData(idata,0,0);

    //draw contour and fingertips
    if (contour.length > 0){
      context.beginPath();
      context.lineWidth = 2;
      context.strokeStyle = "red";
      context.moveTo(contour[0].x, contour[0].y);
      for (i = 0; i < contour.length; ++ i){
        context.lineTo(contour[i].x, contour[i].y);
      }
      context.stroke();
      context.closePath();
    }

    if (defectArray.length >= 4){
      context.beginPath();
      context.lineWidth = 2;
      context.strokeStyle = "blue";
      for (var j = 0; j < 4; j++){
        context.strokeRect(defectArray[j].x-2, defectArray[j].y-2, 4, 4);
      }
    }

    if (hullArray.length === 5){
      for (var j = 0; j < 5; j++){
        // context.strokeStyle = "yellow";
        // context.lineWidth = 2;
        // context.strokeRect(hullArray[j].x-4,hullArray[j].y-4,8,8);
      }
      if (firstFrame === true){
        for (var k = 0; k < 5; k++){
          posFingertips[k] = {x:hullArray[k].x, y:hullArray[k].y};
        }
        firstFrame = false;
      }
      closeupCam();
    }
  }
}

var colors = ["red", "yellow", "green", "blue", "purple"];
function closeupCam(){
  var indexOfSmallest;
  var min;
  var closest;
  for (var i = 4; i >= 0; i--){
    min = 400;
    indexOfSmallest = 0;
    closest = {dist:Math.hypot(hullArray[0].x - posFingertips[i].x, hullArray[0].y - posFingertips[i].y), x:hullArray[0].x, y:hullArray[0].y};
    for (var j = 1; j <= i; j++){
      min = Math.min(Math.hypot(hullArray[j].x - posFingertips[i].x, hullArray[j].y - posFingertips[i].y),closest.dist);
      if (min !== closest.dist){
        closest = {dist:min, x:hullArray[j].x, y:hullArray[j].y};
        indexOfSmallest = j;
      }
    }
    posFingertips[i] = {x:closest.x, y:closest.y}
    context.strokeStyle = colors[i];
    context.lineWidth = 4;
    context.strokeRect(posFingertips[i].x-4, posFingertips[i].y-4, 8, 8);
    console.log("========");
    for (var m = 0; m < i+1; m++){
      console.log("hull: " + hullArray[m].x + " " + hullArray[m].y + " posF: " + posFingertips[m].x + " " + posFingertips[m].y);
    }
    hullArray = hullArray.slice(0,indexOfSmallest).concat(hullArray.slice(indexOfSmallest+1,i+1));
    console.log("i: " + i + "indexOfSmallest: " + indexOfSmallest);
  }
}

//makes a binary image, subtracts background, etc
function computeImage() {

  //get data from video stream
  backContext.drawImage(video,0,0,cw,ch);

  idata = backContext.getImageData(0,0,cw,ch);
  data = idata.data;

  //loop through pixels 
  //compare color and intensity data of each pixel at location (x,y) to the average background pixel at location (x,y)
  for(var i = 0; i < data.length; i+=4) {
    var r = data[i];
    var g = data[i+1];
    var b = data[i+2];

    var currI = (3*r+4*g+b)>>>3;
    var backI = backgroundAvg[i+3];
    var iDiff = Math.abs(currI - backI);

    var rDiff = Math.abs(r - backgroundAvg[i]);
    var gDiff = Math.abs(g - backgroundAvg[i+1]);
    var bDiff = Math.abs(b - backgroundAvg[i+2]);
    var totalColorDiff = rDiff + gDiff + bDiff;

    if (iDiff < ithreshold && totalColorDiff < cthreshold) { //background

      //make background pixels black
      //shortimg.data array is for cv stuff
      shortimg.data[i/4] = 0;

      //add color/intensity data about each pixel for average frame background color/intensity
      backmeanI += backI;
      backmeanR += backgroundAvg[i];
      backmeanG += backgroundAvg[i+1];
      backmeanB += backgroundAvg[i+2];
      numback ++;

      //update temporalBCG, this pixel has been a background pixel for +1 more frames
      temporalBCG[i] += 1;

      //to make things faster, dont call updateBackgroundModel
      updateBackgroundModel(currI, backI, i);


    } else { //foreground
      //make foreground pixels white
      //shortimg.data array is for cv stuff
      shortimg.data[i/4] = 1;

      //add color/intensity data about each pixel for average frame foreground color/intensity
      foremeanI += currI;
      foremeanR += r;
      foremeanG += g;
      foremeanB += b;            
      numfore ++;

      //reset temporalBCG, this pixel has been a background pixel for 0 frames (its in the foreground now)
      temporalBCG[i] = 0;
    }
  }

  //adapt the intensity threshold
  ithreshold = ((foremeanI/numfore) + (backmeanI/numback))/2;

  //adapt the color threshold
  var redMid = ((foremeanR/numfore) + (backmeanR/numback))/2;
  var greenMid = ((foremeanG/numfore) + (backmeanG/numback))/2;
  var blueMid = ((foremeanB/numfore) + (backmeanB/numback))/2;
  cthreshold = Math.min(redMid, blueMid, greenMid);

  dilate(dilateRadius);
  erode(erodeRadius);
}

// you can ignore this gnarly math stuff, most of it is just constants have had been empirically determined
// if you really wanna understand it, read the paper referenced above
function updateBackgroundModel(currI, backI, i){
  var iDiff = Math.abs(currI - backI);
  var cbg = Math.min(150,temporalBCG[i]);

  //a1 weights the probability of the background pixel based on how high the difference in intensity is;         
  var exp1 = ((-5) * Math.pow(iDiff,2))/(2 * ithreshold);
  var a1 = Math.pow(Math.E, exp1);
  
  //a2 weights the probability of the background pixel based on how long the background pixel has been a background pixel;
  var exp2 = -Math.pow((150 - cbg),2)/450;
  var a2 = Math.pow(Math.E, exp2);
  
  //weight intensity probability and temporal probability, you can change the weights tho as long as w1 + w2 <= 1
  var alpha = (0.75 * a1) + (0.25 * a2);
  backgroundAvg[i+3] = (alpha * currI) + ((1 - alpha) * backI);
}

function dilate(k){
  
  manhattan(1);
  
  for (var i=0; i<shortimg.height; i++){
    for (var j=0; j<shortimg.width; j++){
      if (shortimg.data[(i*shortimg.width)+j]<=k) {
        shortimg.data[(i*shortimg.width)+j] = 255;
      } else {
        shortimg.data[(i*shortimg.width)+j] = 0;
      }
    }
  }
}

function erode(k){
  
  manhattan(0);
  
  for (var i=0; i<shortimg.height; i++){
    for (var j=0; j<shortimg.width; j++){
      if (shortimg.data[(i*shortimg.width)+j]<=k) {
        shortimg.data[(i*shortimg.width)+j] = 0;
      } else {
        shortimg.data[(i*shortimg.width)+j] = 255;
      }
    }
  }
}

function manhattan(on){
  shortimg.height = ch;
  shortimg.width = cw;
  // traverse from top left to bottom right
  for (var i=0; i<shortimg.height; i++){
    for (var j=0; j<shortimg.width; j++){
      if (shortimg.data[(i*shortimg.width)+j] === on){
        // first pass and pixel was on, it gets a zero
        shortimg.data[(i*shortimg.width)+j] = 0;
      } else {
        // pixel was off
        // It is at most the sum of the lengths of the array
        // away from a pixel that is on
        shortimg.data[(i*shortimg.width)+j] = shortimg.height + shortimg.width;
        // or one more than the pixel to the north
        if (i>0) shortimg.data[(i*shortimg.width)+j] = Math.min(shortimg.data[(i*shortimg.width)+j], shortimg.data[((i-1)*shortimg.width)+j]+1);
        // or one more than the pixel to the west
        if (j>0) shortimg.data[(i*shortimg.width)+j] = Math.min(shortimg.data[(i*shortimg.width)+j], shortimg.data[(i*shortimg.width)+(j-1)]+1);
      }
    }
  }
  // traverse from bottom right to top left
  for (var i=shortimg.height-1; i>=0; i--){
    for (var j=shortimg.width-1; j>=0; j--){
      // either what we had on the first pass
      // or one more than the pixel to the south
      if (i+1<shortimg.height) shortimg.data[(i*shortimg.width)+j] = Math.min(shortimg.data[(i*shortimg.width)+j], shortimg.data[((i+1)*shortimg.width)+j]+1);
      // or one more than the pixel to the east
      if (j+1<shortimg.height) shortimg.data[(i*shortimg.width)+j] = Math.min(shortimg.data[(i*shortimg.width)+j], shortimg.data[(i*shortimg.width)+(j+1)]+1);
    }
  }
}

function fingertipColor(x,y){
  var index;
  var r = 0;
  var g = 0;
  var b = 0;
  var count = 0;
  for (var j = y - 5; j < y + 10; j++){
    for (var i = x - 5; i < x + 10; i++){
      index = (j*shortimg.width)+i;
      if (shortimg.data[index] >= 1){ //if hand
        r += data[index];
        g += data[index + 1];
        b += data[index + 2];
        count++;
      }
    }
  }
  r = Math.round(r/count);
  g = Math.round(g/count);
  b = Math.round(b/count);
  return "rgb(" + r + "," + g + "," + b + ")";
}
