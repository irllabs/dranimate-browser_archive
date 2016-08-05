var Puppet = function (image) {
	this.image = image;

	this.name = "The Puppet With No Name";
	this.x = 0.0;
	this.y = 0.0;
	this.rotation = 0.0;
	this.scale = 1.0;
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

Puppet.prototype.generateMesh = function (verts, faces, controlPoints, scene) {

	/* Generate wireframe material */

	this.wireframeMaterial = new THREE.MeshBasicMaterial({
        color: 0xFF0000,
        wireframe: true,
        wireframeLinewidth: 1
    });

    /* Generate image material */

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
            new THREE.Vector2(geometry.vertices[f1].x/this.image.width, 1-geometry.vertices[f1].y/this.image.height),
            new THREE.Vector2(geometry.vertices[f2].x/this.image.width, 1-geometry.vertices[f2].y/this.image.height),
            new THREE.Vector2(geometry.vertices[f3].x/this.image.width, 1-geometry.vertices[f3].y/this.image.height)
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
			new THREE.MeshBasicMaterial( {color: 0xffff00} ) 
		);
		sphere.position.z = 10;
		this.controlPointSpheres.push(sphere);
		scene.add(sphere);
	}

	scene.add(this.threeMesh);
	scene.add(this.boundingBox);

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

		for(var i = 0; i < this.controlPoints.length; i++) {
			var cpi = this.controlPoints[i];
			var v = this.threeMesh.geometry.vertices[cpi];
			this.controlPointSpheres[i].position.x = v.x;
			this.controlPointSpheres[i].position.y = v.y;
		}

		this.needsUpdate = false;

	}

};

Puppet.prototype.getImageAsDataURL = function () {
	var canvas = document.createElement('canvas');
    canvas.width  = this.image.width;
    canvas.height = this.image.height;
    var context = canvas.getContext('2d');
    canvas.getContext('2d');
    context.drawImage(this.image, 0, 0, this.image.width, this.image.height, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL();
}

Puppet.prototype.getJSONData = function () {
	var puppetData = {
	    verts: this.verts,
	    faces: this.faces,
	    controlPoints: this.controlPoints,
	    imageData: this.getImageAsDataURL()
	};
	return JSON.stringify(puppetData);
}

Puppet.prototype.removeFromScene = function (scene) {

	scene.remove(this.threeMesh);
	scene.remove(this.boundingBox);
	for(var i = 0; i < this.controlPointSpheres.length; i++) {
		scene.remove(this.controlPointSpheres[i]);
	}

}

Puppet.prototype.cleanup = function () {

	console.error("Warning: Puppet.cleanup() not yet implemented! You are wasting memory! >:(")

}

Puppet.prototype.setSelectionGUIVisible = function (visible) {
	this.boundingBox.visible = visible;
	for(var i = 0; i < this.controlPointSpheres.length; i++) {
		this.controlPointSpheres[i].visible = visible;
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
