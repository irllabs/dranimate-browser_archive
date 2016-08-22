/*       
 *        ImageToMesh 
 *
 * lil app made to:
 *  - superpixel segment images
 *  - detect contours
 *  - triangulate points
 *
 */

var ImageToMesh = function () {

    var that = this;

    var canvas;
    var context;

    var mouse;
    var mouseAbs;

    var image;
    var originalImageData;

    var slic;
    var slicSegmentsCentroids;

    var highlightData;
    var highlightImage;

    var imageNoBackgroundData;
    var imageNoBackgroundImage;

    var imageBackgroundMaskData;
    var imageBackgroundMaskImage;

    var contourData;
    var contourImage;

    var contourPoints;

    var controlPoints;
    var controlPointIndices;

    var vertices;
    var triangles;

    var dummyCanvas;
    var dummyContext;

    var zoom;

    var addPixels;
    var addControlPoints;

    var onlySelectionImage;

    var panEnabled;
    var panPosition;
    var panFromPosition;

    var onChangeCallback = function () {};

/*****************************
    API
*****************************/

    this.onChange = function (callback) {
        onChangeCallback = callback;
    }

    this.setup = function (i2mCanvas) {
        canvas = i2mCanvas;
        context = canvas.getContext('2d');

        canvas.addEventListener('mousemove', function(evt) {
            evt.preventDefault();

            var rect = canvas.getBoundingClientRect();

            mouseAbs.x = (evt.clientX - rect.left) / zoom;
            mouseAbs.y = (evt.clientY - rect.top)  / zoom;
            mouse.x = mouseAbs.x - panPosition.x;
            mouse.y = mouseAbs.y - panPosition.y;
            mouse.x = Math.round(mouse.x);
            mouse.y = Math.round(mouse.y);

            if(!panEnabled && !addControlPoints) {
                that.updateHighligtedSuperpixel();
            }

            if(mouse.leftClickDown && !addControlPoints) {
                if(panEnabled) {
                    panPosition.x += mouseAbs.x - panFromPosition.x;
                    panPosition.y += mouseAbs.y - panFromPosition.y;
                    panFromPosition = {x:mouseAbs.x, y:mouseAbs.y};
                    redraw();
                } else {
                    if(addPixels) {
                        that.addSelectionToNoBackgroundImage();
                    } else {
                        that.removeSelectionToNoBackgroundImage();
                    }
                }
            }
        }, false);

        canvas.addEventListener('mousedown', function(evt) {
            evt.preventDefault(); 

            panFromPosition = {x:mouseAbs.x, y:mouseAbs.y};

            if(!panEnabled) {
                if (addControlPoints) {
                    controlPoints.push([mouse.x, mouse.y]);
                    redraw();
                } else {
                    if(addPixels) {
                        that.addSelectionToNoBackgroundImage();
                    } else {
                        that.removeSelectionToNoBackgroundImage();
                    }
                }
            }

            if(evt.which == 3) {
                mouse.rightClickDown = true;
            } else {
                mouse.leftClickDown = true;
            }
        });

        canvas.addEventListener('contextmenu', function(evt) {
            evt.preventDefault();
            mouse.rightClickDown = true;
            return false;
        }, false);


        canvas.addEventListener('mouseup', function(evt) {
            evt.preventDefault();
            if(evt.which == 3) {
                mouse.rightClickDown = false;
            } else {
                mouse.leftClickDown = false;
            }
        });
    }

    this.generateMesh = function () {

        this.recalculateCentroids(); 
        this.findEdgesOfImage();
        this.removeBackgroundFromImage();
        this.recalculateContourPoints();
        this.generateTriangles();
        redraw();
    }

    this.editImage = function (imageData, controlPointPositions, backgroundRemovalData) {

        mouse = {};
        mouseAbs = {};

        slic = undefined;
        slicSegmentsCentroids = undefined;

        highlightData = undefined;
        highlightImage = new Image();

        imageNoBackgroundData = undefined;
        imageNoBackgroundImage = new Image();

        imageBackgroundMaskData = undefined;
        imageBackgroundMaskImage = new Image();

        contourData = undefined;
        contourImage = new Image();

        contourPoints = undefined;

        controlPoints = [];
        controlPointIndices = [];

        vertices = undefined;
        triangles = undefined;

        zoom = 1.0;
        panEnabled = false;
        addPixels = true;
        addControlPoints = false;
        panPosition = {x:0, y:0};
        panFromPosition = {x:0, y:0}

        if(controlPointPositions) {
            controlPoints = controlPointPositions;
        }

        if(backgroundRemovalData) {
            imageNoBackgroundData = backgroundRemovalData;
        }

        image = new Image();
        image.onload = function(){

            var normWidth = image.width;
            var normHeight = image.height;

            var largerSize;
            if(normWidth > normHeight) {
                largerSize = normWidth;
            } else {
                largerSize = normHeight;
            }

            normWidth /= largerSize;
            normHeight /= largerSize;

            normWidth *= 400;
            normHeight *= 400;

            dummyCanvas.width = normWidth;
            dummyCanvas.height = normHeight;

            canvas.width = normWidth;
            canvas.height = normHeight;

            dummyContext.clearRect(
                0, 0, 
                dummyCanvas.width, dummyCanvas.height);
            dummyContext.drawImage(
                image, 
                0, 0, 
                image.width, image.height,
                0, 0, 
                dummyCanvas.width, dummyCanvas.height);

            image.src = dummyCanvas.toDataURL("image/png");
            image.onload = function() {
                that.doSLICOnImage();
            }

            
        }
        image.src = imageData;

        /*dummyCanvas.width = image.width;
        dummyCanvas.height = image.height;

        canvas.width = image.width;
        canvas.height = image.height;*/

        dummyCanvas = document.createElement("canvas");
        dummyContext = dummyCanvas.getContext("2d");
    }

    this.getCanvas = function () {
        return canvas;
    }

    this.getVertices = function () {
        return vertices;
    }

    this.getTriangles = function () {
        return triangles;
    }

    this.getImage = function() {
        return image;
    }

    this.getImageNoBackground = function() {
        return onlySelectionImage;
    }

    this.getSelectionData = function () {
        return imageBackgroundMaskData;
    }

    this.getControlPoints = function () {
        return controlPoints;
    }

    this.getControlPointIndices = function () {
        return controlPointIndices;
    }

    this.getBackgroundRemovalData = function () {
        return imageNoBackgroundData;
    }

    this.zoomIn = function () {
        zoom += 0.1;
        redraw();
    }

    this.zoomOut = function () {
        zoom -= 0.1;
        redraw();
    }

    this.setAddPixels = function (enabled) {
        addPixels = enabled;
    }

    this.getAddPixels = function () {
        return addPixels;
    }

    this.setPanEnabled = function (enabled) {
        panEnabled = enabled;
        onChangeCallback();
    }

    this.getPanEnabled = function () {
        return panEnabled;
    }

    this.setAddControlPoints = function (enabled) {
        addControlPoints = enabled;
        onChangeCallback();
    }

    this.getAddControlPoints = function () {
        return addControlPoints;
    }

/*****************************
    Private stuff
*****************************/

    this.doSLICOnImage = function () {

        dummyContext.drawImage(image, 0, 0, image.width, image.height,
                                      0, 0, dummyCanvas.width, dummyCanvas.height);
        originalImageData = dummyContext.getImageData(0, 0,
                                                  dummyCanvas.width,
                                                  dummyCanvas.height);

        slic = new SLIC(originalImageData, { method: "slic", regionSize: 30 });
        imageNoBackgroundData = context.createImageData(slic.result.width, slic.result.height);
        imageBackgroundMaskData = context.createImageData(slic.result.width, slic.result.height);
        for (var i = 0; i < slic.result.data.length; i += 4) {
            imageBackgroundMaskData.data[i]     = 0;
            imageBackgroundMaskData.data[i + 1] = 0;
            imageBackgroundMaskData.data[i + 2] = 0;
            imageBackgroundMaskData.data[i + 3] = 0;
        }

        redraw();
    }

    this.getEncodedSLICLabel = function (array, offset) {
        return array[offset] |
              (array[offset + 1] << 8) |
              (array[offset + 2] << 16);
    }

    this.recalculateContourPoints = function () {

        var contourPointsRaw = [];
        
        /* Convert contour image into list of points */

        for (var x = 0; x < contourData.width; ++x) {
            for (var y = 0; y < contourData.height; ++y) {
                if(CanvasUtils.getColorAtXY(x,y,"a",contourData) == 255) {
                    contourPointsRaw.push([x,y]);
                }
            }
        }

        /* Resample list of points */

        contourPoints = [];

        var resampleDist = 10;
        for(var i = 0; i < contourPointsRaw.length; i++) {
            var a = contourPointsRaw[i];
            for(var j = 0; j < contourPointsRaw.length; j++) {
                if(i != j) {
                    var b = contourPointsRaw[j];
                    var ax = a[0];
                    var ay = a[1];
                    var bx = b[0];
                    var by = b[1];
                    var dx = Math.abs(bx - ax);
                    var dy = Math.abs(by - ay);
                    if(Math.sqrt(dx*dx+dy*dy) < resampleDist) {
                        contourPointsRaw.splice(j, 1);
                        j--;
                    }
                }
            }
        }
        contourPoints = contourPointsRaw;

        redraw();

    }

    this.recalculateCentroids = function () {

        slicSegmentsCentroids = [];

        for(var i = 0; i < slic.result.numSegments; i++) {
            this.findCentroidOfSLICSegment(slic.result,i);
        }

    }

    this.findCentroidOfSLICSegment = function (slicImageData, SLICLabel) {

        /* Find all pixels that have the label we're looking for */

        var pixelPoints = []

        for (var x = 0; x < slicImageData.width; ++x) {
            for (var y = 0; y < slicImageData.height; ++y) {
                var index = CanvasUtils.getIndexOfXY(x,y,slicImageData);
                var currentSLICLabel = this.getEncodedSLICLabel(slicImageData.data, index);
                if(currentSLICLabel == SLICLabel) {
                    pixelPoints.push([x,y]);
                }
            }
        }

        /* Calculate centroid (average points) */

        var totalX = 0;
        var totalY = 0;
        for(var i = 0; i < pixelPoints.length; i++) {
            totalX += pixelPoints[i][0];
            totalY += pixelPoints[i][1];
        }
        var avgX = totalX / pixelPoints.length;
        var avgY = totalY / pixelPoints.length;

        var centroid = [avgX,avgY];

        /* Update slicSegmentsCentroids if the centroid is not part of the background */

        var roundedCentroid = [Math.round(centroid[0]), Math.round(centroid[1])];
        if(CanvasUtils.getColorAtXY(roundedCentroid[0], roundedCentroid[1], "a", imageNoBackgroundData) == 255) {
            slicSegmentsCentroids[SLICLabel] = centroid;
        }

    }

    this.findEdgesOfImage = function () {

        var width = imageNoBackgroundData.width;
        var height = imageNoBackgroundData.height;
        var data = imageNoBackgroundData.data;

        /* Generate contour image */

        contourData = context.createImageData(slic.result.width, slic.result.height);

        for (var i = 0; i < height; ++i) {
          for (var j = 0; j < width; ++j) {
            var offset = 4 * (i * width + j);
            var alpha = data[4 * (i * width + j) + 3];
            var isSLICBoundary = (alpha !== data[4 * (i * width + j - 1)] ||
                                  alpha !== data[4 * (i * width + j + 1)] ||
                                  alpha !== data[4 * ((i - 1) * width + j)] ||
                                  alpha !== data[4 * ((i + 1) * width + j)]);
            var isOnImageBorder = i === 0 ||
                                  j === 0 ||
                                  i === (height - 1) ||
                                  j === (width - 1);
            var isBoundary = isSLICBoundary && !isOnImageBorder;

            var p = 4 * (i * width + j);
            if (isBoundary) {
              contourData.data[p] = 255;
              contourData.data[p+1] = 0;
              contourData.data[p+2] = 0;
              contourData.data[p+3] = 255;
            } else {
              contourData.data[p] = 255;
              contourData.data[p+1] = 0;
              contourData.data[p+2] = 0;
              contourData.data[p+3] = 0;
            }

          }
        }

        /* Resample contour image */

        /*
        for (var x = 0; x < contourData.width; ++x) {
            for (var y = 0; y < contourData.height; ++y) {
                if(getColorAtXY(x,y,"a",contourData) == 255) {

                    setColorAtXY(x+1,y,"a",contourData,0);
                    setColorAtXY(x,y+1,"a",contourData,0);
                    setColorAtXY(x-1,y,"a",contourData,0);
                    setColorAtXY(x,y-1,"a",contourData,0);

                    setColorAtXY(x+1,x+1,"a",contourData,0);
                    setColorAtXY(x+1,y-1,"a",contourData,0);
                    setColorAtXY(x-1,y-1,"a",contourData,0);
                    setColorAtXY(x-1,y+1,"a",contourData,0);
                }
            }
        }
        */

        dummyContext.putImageData(contourData, 0, 0);
        contourImage.src = dummyCanvas.toDataURL("image/png");
        contourImage.onload = function() {
            redraw();
        }

    }

    this.removeBackgroundFromImage = function () {

        for (var i = 0; i < slic.result.data.length; i += 4) {
            if(imageBackgroundMaskData.data[i+3] != 255) {
                originalImageData.data[i]     = 0;
                originalImageData.data[i + 1] = 0;
                originalImageData.data[i + 2] = 0;
                originalImageData.data[i + 3] = 0;
            }
        }

        dummyContext.putImageData(originalImageData, 0, 0);
        onlySelectionImage = new Image();
        onlySelectionImage.src = dummyCanvas.toDataURL("image/png");
        onlySelectionImage.onload = function() {
            redraw();
        }

    }

    this.addSelectionToNoBackgroundImage = function () {

        for (var i = 0; i < slic.result.data.length; i += 4) {
            if(highlightData.data[i+3] == 255) {
                imageNoBackgroundData.data[i]     = 255;
                imageNoBackgroundData.data[i + 1] = 255;
                imageNoBackgroundData.data[i + 2] = 255;
                imageNoBackgroundData.data[i + 3] = 255;

                imageBackgroundMaskData.data[i]     = 255;
                imageBackgroundMaskData.data[i + 1] = 255;
                imageBackgroundMaskData.data[i + 2] = 255;
                imageBackgroundMaskData.data[i + 3] = 255;
            }
        }

        dummyContext.putImageData(imageNoBackgroundData, 0, 0);
        imageNoBackgroundImage.src = dummyCanvas.toDataURL("image/png");
        imageNoBackgroundImage.onload = function() {
            redraw();
        }

        dummyContext.putImageData(imageBackgroundMaskData, 0, 0);
        imageBackgroundMaskImage.src = dummyCanvas.toDataURL("image/png");
        imageBackgroundMaskImage.onload = function() {
            redraw();
        }
    }

    this.removeSelectionToNoBackgroundImage = function () {

        for (var i = 0; i < slic.result.data.length; i += 4) {
            if(highlightData.data[i+3] == 255) {
                imageNoBackgroundData.data[i]     = 0;
                imageNoBackgroundData.data[i + 1] = 0;
                imageNoBackgroundData.data[i + 2] = 0;
                imageNoBackgroundData.data[i + 3] = 0;

                imageBackgroundMaskData.data[i]     = 0;
                imageBackgroundMaskData.data[i + 1] = 0;
                imageBackgroundMaskData.data[i + 2] = 0;
                imageBackgroundMaskData.data[i + 3] = 0;
            }
        }

        dummyContext.putImageData(imageNoBackgroundData, 0, 0);
        imageNoBackgroundImage.src = dummyCanvas.toDataURL("image/png");
        imageNoBackgroundImage.onload = function() {
            redraw();
        }

        dummyContext.putImageData(imageBackgroundMaskData, 0, 0);
        imageBackgroundMaskImage.src = dummyCanvas.toDataURL("image/png");
        imageBackgroundMaskImage.onload = function() {
            redraw();
        }
    }

    this.updateHighligtedSuperpixel = function () {
        if(slic) {
            var selectedLabel = [];
            var selectedIndex = 4*(mouse.y*slic.result.width+mouse.x);
            selectedLabel.push(slic.result.data[selectedIndex]);
            selectedLabel.push(slic.result.data[selectedIndex+1]);
            selectedLabel.push(slic.result.data[selectedIndex+2]);

            highlightData = context.createImageData(slic.result.width, slic.result.height);

            for (var i = 0; i < slic.result.data.length; i += 4) {
                if(selectedLabel[0] === slic.result.data[i] &&
                   selectedLabel[1] === slic.result.data[i+1] &&
                   selectedLabel[2] === slic.result.data[i+2]) {
                    highlightData.data[i]     = 255;
                    highlightData.data[i + 1] = 0;
                    highlightData.data[i + 2] = 0;
                    highlightData.data[i + 3] = 255;
                } else {
                    highlightData.data[i]     = 255;
                    highlightData.data[i + 1] = 0;
                    highlightData.data[i + 2] = 0;
                    highlightData.data[i + 3] = 0;
                }
            }

            dummyContext.putImageData(highlightData, 0, 0);
            highlightImage.src = dummyCanvas.toDataURL("image/png");
            highlightImage.onload = function() {
                redraw();
            }
        }
    }

    this.generateTriangles = function() {
        /* Create list of vertices from superpixel centroids and contour points */

        vertices = [];

        for(var i = 0; i < contourPoints.length; i++) {
            vertices.push(contourPoints[i]);
        }

        // Don't actually add the slic centroids as points lol
        // (Just uncomment that line if u want to tho.)
        for(var i = 0; i < slicSegmentsCentroids.length; i++) {
            var segment = slicSegmentsCentroids[i];
            if(segment) {
                //vertices.push(slicSegmentsCentroids[i]);
            }
        }

        /* Add vertices for requested control points as well */

        for(var i = 0; i < controlPoints.length; i++) {
            controlPointIndices.push(vertices.length);
            vertices.push(controlPoints[i]);
        }

        /* Run delaunay on vertices to generate mesh */

        var rawTriangles = Delaunay.triangulate(vertices);

        /* Remove trianges whose centroids are in the image background */

        triangles = [];

        for(var i = 0; i < rawTriangles.length; i+=3) {
            var x1 = vertices[rawTriangles[i]][0];
            var y1 = vertices[rawTriangles[i]][1];

            var x2 = vertices[rawTriangles[i+1]][0];
            var y2 = vertices[rawTriangles[i+1]][1];

            var x3 = vertices[rawTriangles[i+2]][0];
            var y3 = vertices[rawTriangles[i+2]][1];

            var centroidX = Math.round((x1 + x2 + x3) / 3);
            var centroidY = Math.round((y1 + y2 + y3) / 3);

            if(CanvasUtils.getColorAtXY(centroidX,centroidY,"a",imageNoBackgroundData) == 255) {
                triangles.push(rawTriangles[i]);
                triangles.push(rawTriangles[i+1]);
                triangles.push(rawTriangles[i+2]);
            }
        }

        /* Remove vertices that aren't part of any triangle */

        for(var vi = 0; vi < vertices.length; vi++) {

            var vertexIsPartOfATriangle = false;

            for(var ti = 0; ti < triangles.length; ti++) {
                if(vi == triangles[ti]) {
                    vertexIsPartOfATriangle = true;
                }
            }

            if(!vertexIsPartOfATriangle) {
                vertices.splice(vi, 1)

                /* Since we removed a vertex from the verts array, we need to update the 
                 * control points and triangles because they point to the vertices by index. */

                for(var ti = 0; ti < triangles.length; ti++) {
                    if(triangles[ti] > vi) {
                        triangles[ti] -= 1;
                    }
                }
                for(var cpi = 0; cpi < controlPointIndices.length; cpi++) {
                    if(controlPointIndices[cpi] > vi) {
                        controlPointIndices[cpi] -= 1;
                    }
                }
            }
        }

    }

    var redraw = function () {

        context.clearRect(0, 0, canvas.width, canvas.height);

        context.save();
        context.scale(zoom, zoom);
        context.translate(panPosition.x, panPosition.y);

        context.globalAlpha = 1.0;
        context.drawImage(image, 0, 0, image.width, image.height,
                                0, 0, canvas.width, canvas.height);
        context.drawImage(highlightImage, 
                                                0, 0, highlightImage.width, highlightImage.height,
                                                0, 0, canvas.width, canvas.height);
        context.globalAlpha = 0.8;
        context.drawImage(imageNoBackgroundImage, 
                                                0, 0, imageNoBackgroundImage.width, imageNoBackgroundImage.height,
                                                0, 0, canvas.width, canvas.height);
        context.globalAlpha = 1.0;
        context.drawImage(contourImage, 
                                                0, 0, contourImage.width, contourImage.height,
                                                0, 0, canvas.width, canvas.height);

        if(slicSegmentsCentroids) {
            for(var i = 0; i < slicSegmentsCentroids.length; i++) {
                var segment = slicSegmentsCentroids[i];
                if(segment) {
                    var centroidX = slicSegmentsCentroids[i][0];
                    var centroidY = slicSegmentsCentroids[i][1];

                    context.beginPath();
                    context.arc(centroidX, centroidY, 3, 0, 2 * Math.PI, false);
                    context.fillStyle = 'yellow';
                    context.fill();
                }
            }
        }
        if(contourPoints) {
            for(var i = 0; i < contourPoints.length; i++) {
                var centroidX = contourPoints[i][0];
                var centroidY = contourPoints[i][1];

                context.beginPath();
                context.arc(centroidX, centroidY, 3, 0, 2 * Math.PI, false);
                context.fillStyle = '#00FF00';
                context.fill();
            }
        }
        if(controlPoints) {
            for(var i = 0; i < controlPoints.length; i++) {
                var cpx = controlPoints[i][0];
                var cpy = controlPoints[i][1];

                context.beginPath();
                context.arc(cpx, cpy, 3, 0, 2 * Math.PI, false);
                context.fillStyle = '#00FFFF';
                context.fill();
            }
        }

        if(vertices) {
            for(var i = 0; i < vertices.length; i++) {
                var centroidX = vertices[i][0];
                var centroidY = vertices[i][1];

                context.beginPath();
                context.arc(centroidX, centroidY, 3, 0, 2 * Math.PI, false);
                context.fillStyle = '#FF00FF';
                context.fill();
            }
        }

        if(triangles) {
            for(var i = 0; i < triangles.length; ) {
                context.beginPath();
                context.moveTo(vertices[triangles[i]][0], vertices[triangles[i]][1]); i++;
                context.lineTo(vertices[triangles[i]][0], vertices[triangles[i]][1]); i++;
                context.lineTo(vertices[triangles[i]][0], vertices[triangles[i]][1]); i++;
                context.closePath();
                context.stroke();
            }
        }

        context.restore();
    }

}