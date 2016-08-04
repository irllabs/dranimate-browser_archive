/* Some utility functions for html5 canvas images. -zrispo */

var CanvasUtils = (function () {

    var canvasUtils = { };

    canvasUtils.getIndexOfXY = function (x,y,imageData) {
        return 4 * (y * imageData.width + x);
    }

    canvasUtils.getColorAtXY = function (x,y,value,imageData) {

        var index = canvasUtils.getIndexOfXY(x,y,imageData);
        var valueIndex = -1;

        if(value === "r") {
            valueIndex = index;
        } else if(value === "g") {
            valueIndex = index + 1;
        } else if(value === "b") {
            valueIndex = index + 2;
        } else if(value === "a") {
            valueIndex = index + 3;
        } else {
            console.log("Invalid value param for getColorAtXY! (r,g,b,or a expected!!)");
            return null;
        }

        return imageData.data[valueIndex];
    }

    canvasUtils.setColorAtXY = function (x,y,value,imageData,newValue) {

        var index = canvasUtils.getIndexOfXY(x,y,imageData);
        var valueIndex = -1;

        if(value === "r") {
            valueIndex = index;
        } else if(value === "g") {
            valueIndex = index + 1;
        } else if(value === "b") {
            valueIndex = index + 2;
        } else if(value === "a") {
            valueIndex = index + 3;
        } else {
            console.log("Invalid value param for setColorAtXY! (r,g,b,or a expected!!)");
        }

        imageData.data[valueIndex] = newValue;
    }

    return canvasUtils;

})();