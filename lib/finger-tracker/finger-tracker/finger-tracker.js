class FT {

  // arguements to construct this class are 
  //1) the context to draw on 
  //2) the radius defining a circle as the boundary the fingertips can be in
  //3) the width and height of the context
  constructor(context, rad, width, height, numFingers){
    this.candidate;
    this.tracker = new HT.Tracker();
    this.contour = [];
    this.hull = [];
    this.defects = [];

    this.palmCenter = {x:0, y:0};
    this.tips = [];

    this.width = width;
    this.height = height;
    this.boundary = {rad:rad, x:width/2, y:height/2, bottom:(height/2)+(0.5*rad)};
    this.context = context;
    
    this.minTipDist = 20;
    this.numFingers = 5;
    this.tipsInitiatedYet = false;
  }

  //this is called for every frame
  analyzeImg(shortimg){
    this.candidate = this.tracker.detect(shortimg);
    if (this.candidate !== undefined){
      this.contour = this.candidate.contour;
      this.hull = this.candidate.hull;
      this.defects = this.candidate.defects;

      var cnt = 0;
      this.palmCenter = {x:0, y:0};
      for (var i = 0; i < this.defects.length; i++){
        this.palmCenter.x += this.defects[i].depthPoint.x;
        this.palmCenter.y += this.defects[i].depthPoint.y;
        cnt++;
      }

      this.palmCenter.x = Math.round(this.palmCenter.x/cnt);
      this.palmCenter.y = Math.round(this.palmCenter.y/cnt);
    }
  }

  showBounds(){
    this.context.strokeStyle = "white";
    this.context.lineWidth = 4;
    this.context.beginPath;
    this.context.arc((this.width/2), (this.height/2), this.boundary.rad, (5/6)*Math.PI, (1/6)*Math.PI);
    this.context.stroke();
  }

  showPalmCenter(shortimg){
    this.context.strokeStyle = "green";
    this.context.strokeRect(this.palmCenter.x-2, this.palmCenter.y-2, 4, 4);
  }

  getFingertips(shortimg){
    var hullArray = [];
    //filter out extraneous hull points by distance from eachother (must be at least 20px away by default)
    if (this.hull.length > 0){
      hullArray.push({dist:Math.hypot(this.hull[0].x-this.palmCenter.x, this.hull[0].y-this.palmCenter.y), x:this.hull[0].x, y:this.hull[0].y})
      for (var i = 1; i < this.hull.length; i++){
        if (this.farEnough(this.hull[i].x, this.hull[i].y, hullArray)){
          hullArray.push({dist:Math.hypot(this.hull[i].x-this.palmCenter.x, this.hull[i].y-this.palmCenter.y), x:this.hull[i].x, y:this.hull[i].y});
        }
      }
      //sort points by distance to palm center and use only the furthest 5 tips
      hullArray.sort(function(a, b){
        if (a.dist < b.dist) return -1;
        if (a.dist > b.dist) return 1;
        return 0;
      });
      hullArray = hullArray.slice(0,this.numFingers);

      // initiate this.tips if not yet initiated and all fingers seen
      if (this.tipsInitiatedYet === false && hullArray.length === this.numFingers){
        var that = this;
        hullArray.sort(function(a, b){
          if ((((a.x-that.palmCenter.x)*(b.y-that.palmCenter.y)) - ((b.x-that.palmCenter.x)*(a.y-that.palmCenter.y))) < 0) return -1;
          if ((((a.x-that.palmCenter.x)*(b.y-that.palmCenter.y)) - ((b.x-that.palmCenter.x)*(a.y-that.palmCenter.y))) > 0) return 1;
          return 0;
        });
        this.tips = hullArray;
        this.tipsInitiatedYet = true;
      }
      
      hullArray = this.interpolatePoints(hullArray, this.tips);

      //sort points clockwise from center of bound
      var that = this;
      hullArray.sort(function(a, b){
        if ((((a.x-that.palmCenter.x)*(b.y-that.palmCenter.y)) - ((b.x-that.palmCenter.x)*(a.y-that.palmCenter.y))) < 0) return -1;
        if ((((a.x-that.palmCenter.x)*(b.y-that.palmCenter.y)) - ((b.x-that.palmCenter.x)*(a.y-that.palmCenter.y))) > 0) return 1;
        return 0;
      });      
      //ignore out of bounds points
      for (var j = 0; j < hullArray.length; j++){
        if (this.outOfBounds(hullArray[j])){
          hullArray[j] = this.tips[j];
        }
      }
      var colors = ["red", "yellow", "green", "blue", "purple"];
      if (hullArray.length <= this.numFingers){
        for (var j = 0; j < hullArray.length; j++){
          this.context.strokeStyle = colors[j];
          this.context.lineWidth = 2;
          this.context.strokeRect(hullArray[j].x-4,hullArray[j].y-4,8,8);
        }
      }
      this.tips = hullArray;
    }
  }

  showDefects(shortimg){
    this.context.beginPath();
    this.context.lineWidth = 2;
    this.context.strokeStyle = "blue";
    for (var j = 0; j < this.defects.length; j++){
      this.context.strokeRect(this.defects[j].depthPoint.x-2, this.defects[j].depthPoint.y-2, 4, 4);
    }
  }

  showContour(shortimg){
    if (this.contour.length > 0){
      this.context.beginPath();
      this.context.lineWidth = 2;
      this.context.strokeStyle = "red";
      this.context.moveTo(this.contour[0].x, this.contour[0].y);
      for (var i = 0; i < this.contour.length; ++ i){
        this.context.lineTo(this.contour[i].x, this.contour[i].y);
      }
      this.context.lineTo(this.contour[0].x, this.contour[0].y);
      this.context.stroke();
      this.context.closePath();
    }
  }

  displayBinImg(shortimg){
    var idata = this.context.getImageData(0,0,shortimg.width,shortimg.height);
    var data = idata.data;
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
    this.context.putImageData(idata,0,0);
  }

  farEnough(x, y, List){
    for (var i = 0; i < List.length; i++){
      if (Math.hypot(x-List[i].x, y-List[i].y) < this.minTipDist){
        return false;
      }
    }
    return true;
  }

  outOfBounds(point){
    if ((Math.hypot(point.x - this.boundary.x, point.y - this.boundary.y) > this.boundary.rad) || (point.y > this.boundary.bottom)) {
      return true;
    } else {
      return false;
    }
  }

  interpolatePoints(newPoints, oldPoints){
    var indexOfMatches = [];
    var newP, oldP;
    var minDist, dist;
    //populate indexOfMatches with closest corresponding oldPoints to newPoints
    for (var i = 0; i < this.numFingers; i++){
      newP = newPoints[i];
      minDist = Infinity;
      for (var j = 0; j < this.numFingers; j++){
        oldP = oldPoints[j];
        dist = Math.hypot(newP.x - oldP.x, newP.y - oldP.y);
        if (dist < minDist){
          minDist = dist;
          indexOfMatches[i] = {index:j, dist:dist, flag:true};
        }
      }
    }
    //flag duplicate indexes as "false"
    for (var i = 0; i < indexOfMatches.length; i++){
      if (indexOfMatches[i].flag === false) {
        continue;
      }
      for (var j = i+1; j < indexOfMatches.length; j++){
        if (indexOfMatches[i].index === indexOfMatches[j].index){
          if (indexOfMatches[i].dist < indexOfMatches[j].dist){
            indexOfMatches[j].flag = false;
          } else {
            indexOfMatches[i].flag = false;
          }
        }
      }
    }
    //unused indices correspond to old points which have not been matched to an new point
    //push newPoints that correspond closely to old points and the old points which had no corresponding points
    var unusedIndices = new Array(this.numFingers).fill(0);
    var result = [];
    for (var i = 0; i < indexOfMatches.length; i++){
      unusedIndices[indexOfMatches[i].index] = 1;
      if (indexOfMatches[i].flag === true){
        result.push(newPoints[i]);
      }
    }
    for (var i = 0; i < unusedIndices.length; i++){
      if (unusedIndices[i] === 0){
        result.push(oldPoints[i]);
      }
    }
    return result;
  }

  initTips(){
    this.tipsInitiatedYet = false;
  }
}