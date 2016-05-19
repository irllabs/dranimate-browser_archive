/* A wrapper for ARAP.js so we can use ARAP on THREE.js mesh objects. */

var ARAPThreeMesh = function (verts, faces, controlPoints, material, width, height) {
	console.log('New ARAPThreeMesh instantiated');

	this.verts = verts;
	this.faces = faces;
	this.controlPoints = controlPoints;

	/* Make flat arrays to pass to ARAP.js */
    this.vertsFlatArray = [];
    for(var i = 0; i < verts.length; i++) {
        this.vertsFlatArray.push(verts[i][0]);
        this.vertsFlatArray.push(verts[i][1]);
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
            new THREE.Vector2(geometry.vertices[f1].x/width, 1-geometry.vertices[f1].y/height),
            new THREE.Vector2(geometry.vertices[f2].x/width, 1-geometry.vertices[f2].y/height),
            new THREE.Vector2(geometry.vertices[f3].x/width, 1-geometry.vertices[f3].y/height)
        ]);
	}

	geometry.dynamic = true;

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

	/* Create the THREE mesh */

	this.threeMesh = new THREE.Mesh(geometry, material);
};

ARAPThreeMesh.prototype.setControlPointPosition = function(controlPointIndex, x, y) {

	ARAP.setControlPointPosition(this.arapMeshID, this.controlPoints[controlPointIndex], x, y);

}

ARAPThreeMesh.prototype.update = function() {

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

};
