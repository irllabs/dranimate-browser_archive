var Puppet = function (image) {
	this.image = image;

	this.name = "The Puppet With No Name";
	this.x = 0.0;
	this.y = 0.0;
	this.prevx = this.x;
	this.prevy = this.y;
	this.anchorpointX = 0.0;
	this.anchorpointY = 0.0;
	this.rotation = 0.0;
	this.scale = 1.0;

	// Setup quad image

	var canvas = document.createElement('canvas');
    canvas.width  = this.image.width;
    canvas.height = this.image.height;
    var context = canvas.getContext('2d');
    canvas.getContext('2d');
    context.drawImage(this.image, 0, 0, this.image.width, this.image.height, 0, 0, canvas.width, canvas.height);

    var imageTexture = new THREE.Texture(canvas);
    imageTexture.needsUpdate = true;
    this.texturedMaterial = new THREE.MeshBasicMaterial({
        map: imageTexture,
        transparent: true
    });

    var vertsFlatArray = [0,0, image.width,0, 0,image.height, image.width,image.height];
    var facesFlatArray = [0,2,1, 1,2,3];

    var geometry = new THREE.Geometry();

	for(var i = 0; i < vertsFlatArray.length; i+=2) {
		var x = vertsFlatArray[i];
		var y = vertsFlatArray[i+1];
		geometry.vertices.push( new THREE.Vector3( x, y, 0 ) );
	}
	for(var i = 0; i < facesFlatArray.length; i+=3) {
		var f1 = facesFlatArray[i];
		var f2 = facesFlatArray[i+1];
		var f3 = facesFlatArray[i+2];
		geometry.faces.push( new THREE.Face3( f1, f2, f3 ) );

		geometry.faceVertexUvs[0].push( [
            new THREE.Vector2(geometry.vertices[f1].x/this.image.width, 1-geometry.vertices[f1].y/this.image.height),
            new THREE.Vector2(geometry.vertices[f2].x/this.image.width, 1-geometry.vertices[f2].y/this.image.height),
            new THREE.Vector2(geometry.vertices[f3].x/this.image.width, 1-geometry.vertices[f3].y/this.image.height)
        ]);
	}

	this.threeMesh = new THREE.Mesh(geometry, this.texturedMaterial);

	this.boundingBox = new THREE.BoundingBoxHelper(this.threeMesh, new THREE.Color(0xFF9900));
	this.boundingBox.visible = false;
};

Puppet.prototype.getName = function() { 
	return name; 
};

Puppet.prototype.getPosition = function() { 
	return {x: this.x, y: this.y}; 
};

Puppet.prototype.getRotation = function() { 
	return this.rotation; 
};

Puppet.prototype.getScale = function() { 
	return this.scale; 
};

Puppet.prototype.setRenderWireframe = function (renderWireframe) {
	if(renderWireframe) {
		this.threeMesh.material = this.wireframeMaterial;
	} else {
		this.threeMesh.material = this.texturedMaterial;
	}
}

Puppet.prototype.setImageToMeshData = function (imageNoBG, controlPointPositions, backgroundRemovalData) {
	this.imageNoBG = imageNoBG;
	this.controlPointPositions = controlPointPositions;
	this.backgroundRemovalData = backgroundRemovalData;
}

Puppet.prototype.generateMesh = function (verts, faces, controlPoints) {

	this.hasMeshData = true;

	/* Generate wireframe material */

	this.wireframeMaterial = new THREE.MeshBasicMaterial({
        color: 0xFF0000,
        wireframe: true,
        wireframeLinewidth: 1
    });

    /* Generate image material */

	var canvas = document.createElement('canvas');
    canvas.width  = this.imageNoBG.width;
    canvas.height = this.imageNoBG.height;
    var context = canvas.getContext('2d');
    canvas.getContext('2d');
    context.drawImage(this.imageNoBG, 0, 0, this.imageNoBG.width, this.imageNoBG.height, 0, 0, canvas.width, canvas.height);

    var imageTexture = new THREE.Texture(canvas);
    imageTexture.needsUpdate = true;
    this.texturedMaterial = new THREE.MeshBasicMaterial({
        map: imageTexture,
        transparent: true
    });

	/* Make flat arrays to pass to ARAP.js */

	this.verts = verts.slice();
	this.faces = faces.slice();
	this.controlPoints = controlPoints;

    this.vertsFlatArray = [];
    for(var i = 0; i < this.verts.length; i++) {
        this.vertsFlatArray.push(this.verts[i][0]);
        this.vertsFlatArray.push(this.verts[i][1]);
    }

    this.facesFlatArray = [];
    for(var i = 0; i < faces.length; i++) {
        this.facesFlatArray.push(faces[i]);
    }

    /* Create the THREE geometry */

	var geometry = new THREE.Geometry();

	for(var i = 0; i < this.vertsFlatArray.length; i+=2) {
		var x = this.vertsFlatArray[i];
		var y = this.vertsFlatArray[i+1];
		geometry.vertices.push( new THREE.Vector3( x, y, 0 ) );
	}
	for(var i = 0; i < this.facesFlatArray.length; i+=3) {
		var f1 = this.facesFlatArray[i];
		var f2 = this.facesFlatArray[i+1];
		var f3 = this.facesFlatArray[i+2];
		geometry.faces.push( new THREE.Face3( f1, f2, f3 ) );

		geometry.faceVertexUvs[0].push( [
            new THREE.Vector2(geometry.vertices[f1].x/this.imageNoBG.width, 1-geometry.vertices[f1].y/this.imageNoBG.height),
            new THREE.Vector2(geometry.vertices[f2].x/this.imageNoBG.width, 1-geometry.vertices[f2].y/this.imageNoBG.height),
            new THREE.Vector2(geometry.vertices[f3].x/this.imageNoBG.width, 1-geometry.vertices[f3].y/this.imageNoBG.height)
        ]);
	}

	geometry.dynamic = true;

	/* Expand mesh to show finer edges of image (as opposed to rough triangle edges of mesh) */

	console.log("TODO: expand mesh")

	/* Setup new ARAP mesh */

	this.arapMeshID = ARAP.createNewARAPMesh(this.vertsFlatArray, 
											 this.facesFlatArray);

	/* Add control points */

	for(var i = 0; i < this.controlPoints.length; i++) {
		ARAP.addControlPoint(this.arapMeshID, this.controlPoints[i]);
	}
	for(var i = 0; i < this.controlPoints.length; i++) {
		var cpi = this.controlPoints[i];
		ARAP.setControlPointPosition(this.arapMeshID, cpi, this.verts[cpi][0], this.verts[cpi][1]);
	}

	/* Create the THREE objects */

	this.threeMesh = new THREE.Mesh(geometry, this.texturedMaterial);

	this.boundingBox = new THREE.BoundingBoxHelper(this.threeMesh, new THREE.Color(0xFF9900));
	this.boundingBox.visible = false;

	this.controlPointSpheres = [];
	for(var i = 0; i < this.controlPoints.length; i++) {
		var sphere = new THREE.Mesh( 
			new THREE.SphereGeometry( 5, 32, 32 ), 
			new THREE.MeshBasicMaterial( {color: 0xFFAB40} ) 
		);
		sphere.position.z = 10;
		this.controlPointSpheres.push(sphere);
	}

	/* Save a version of the vertices in their original position */

	this.undeformedVertices = this.verts;

	/* Set needsupdate flag to update to initialze immediately */

	this.needsUpdate = true;
}

Puppet.prototype.setControlPointPosition = function(controlPointIndex, x, y) {

	this.needsUpdate = true;

	ARAP.setControlPointPosition(this.arapMeshID, this.controlPoints[controlPointIndex], x, y);

}

Puppet.prototype.update = function() {

	this.anchorpointX = this.boundingBox.position.x;
	this.anchorpointY = this.boundingBox.position.y;

	var dx = this.x - this.prevx;
	var dy = this.y - this.prevy;

	if(dx != 0 || dy != 0) {
		for(var i = 0; i < this.controlPoints.length; i++) {
			var cpx = this.threeMesh.geometry.vertices[this.controlPoints[i]].x;
			var cpy = this.threeMesh.geometry.vertices[this.controlPoints[i]].y;
			this.setControlPointPosition(i, cpx + dx, cpy + dy);
		}
	}

	this.prevx = this.x;
	this.prevy = this.y;

	if(this.needsUpdate) {
	
		/* update ARAP deformer */
		ARAP.updateMeshDeformation(this.arapMeshID);

		var deformedVerts = ARAP.getDeformedVertices(this.arapMeshID, this.vertsFlatArray.length);

		for(var i = 0; i < deformedVerts.length; i+=2) {
			var x = deformedVerts[i];
			var y = deformedVerts[i+1];
			this.threeMesh.geometry.vertices[i/2].x = x;
			this.threeMesh.geometry.vertices[i/2].y = y;
		}
		this.threeMesh.geometry.dynamic = true;
		this.threeMesh.geometry.verticesNeedUpdate = true;

		//this.threeMesh.geometry.computeBoundingBox();
		//console.log(this.boundingBox)
		this.boundingBox.update();
		this.boundingBox.scale.z = 1; // To make sure volume != 0 (this will cause that warning to show up)

		for(var i = 0; i < this.controlPoints.length; i++) {
			var cpi = this.controlPoints[i];
			var v = this.threeMesh.geometry.vertices[cpi];
			this.controlPointSpheres[i].position.x = v.x;
			this.controlPointSpheres[i].position.y = v.y;
		}

		this.needsUpdate = false;

	}

};

Puppet.prototype.getImageAsDataURL = function (img) {
	var canvas = document.createElement('canvas');
    canvas.width  = img.width;
    canvas.height = img.height;
    var context = canvas.getContext('2d');
    canvas.getContext('2d');
    context.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL();
}

Puppet.prototype.getJSONData = function () {
	var puppetData = {
	    verts: this.verts,
	    faces: this.faces,
	    controlPoints: this.controlPoints,
	    controlPointPositions: this.controlPointPositions,
	    backgroundRemovalData: this.backgroundRemovalData,
	    imageData: this.getImageAsDataURL(this.image),
	    imageNoBGData: this.getImageAsDataURL(this.imageNoBG)
	};
	return JSON.stringify(puppetData);
}

Puppet.prototype.cleanup = function () {

	console.error("Warning: Puppet.cleanup() not yet implemented! You are wasting memory! >:(")

}

Puppet.prototype.setSelectionGUIVisible = function (visible) {
	if(this.hasMeshData) {
		this.boundingBox.visible = visible;
		for(var i = 0; i < this.controlPointSpheres.length; i++) {
			this.controlPointSpheres[i].visible = visible;
		}
	}
}

Puppet.prototype.pointInsideMesh = function (x, y) {

	//http://stackoverflow.com/questions/2049582/how-to-determine-a-point-in-a-triangle

	var sign = function (x1, y1, x2, y2, x3, y3) {
		return (x1 - x3) * (y2 - y3) - (x2 - x3) * (y1 - y3);
	}

	var pointInsideTriangle = function (px, py, x1, y1, x2, y2, x3, y3) {
		var b1, b2, b3;
    
	    b1 = sign(px,py, x1,y1, x2,y2) < 0.0;
	    b2 = sign(px,py, x2,y2, x3,y3) < 0.0;
	    b3 = sign(px,py, x3,y3, x1,y1) < 0.0;
	    
	    return ((b1 == b2) && (b2 == b3));
	}

	var allFaces = this.threeMesh.geometry.faces;
	var allVerts = this.threeMesh.geometry.vertices;
	for(var i = 0; i < allFaces.length; i++) {
		var v1 = allVerts[allFaces[i].a];
		var v2 = allVerts[allFaces[i].b];
		var v3 = allVerts[allFaces[i].c];

		if(pointInsideTriangle(x, y, v1.x, v1.y, v2.x, v2.y, v3.x, v3.y)) {
			return true;
		}
	}

	return false;

}
