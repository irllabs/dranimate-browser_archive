var ARAP = function() {
	this.VERSION = 'dev';
}

/* Wrapper functions for the emscripten module */

ARAP.createNewMeshWrapper = Module.cwrap(
  'createNewMesh','[number]',['number']
);

ARAP.setMeshVertexDataWrapper = Module.cwrap(
  'setMeshVertexData', 'number', ['number', 'number', 'number']
);

ARAP.setMeshTriangleDataWrapper = Module.cwrap(
  'setMeshTriangleData', 'number', ['number', 'number', 'number']
);

ARAP.setupMeshDeformerWrapper = Module.cwrap(
	'setupMeshDeformer','number', ['number']
);

ARAP.addControlPointWrapper = Module.cwrap(
	'addControlPoint','number', ['number','number']
);

ARAP.setControlPointPositionWrapper = Module.cwrap(
	'setControlPointPosition','[number]', ['number', 'number', 'number', 'number']
);

ARAP.updateMeshDeformationWrapper = Module.cwrap(
	'updateMeshDeformation','[number]', ['number']
);

ARAP.getMeshVertexDataWrapper = Module.cwrap(
  'getMeshVertexData', 'number', ['number', 'number', 'number']
);

/* Small helper function that handles all the nasty memory stuff for arrays. */
ARAP.doArrayFunction = function(arr, func) {
	// Create data
	var data = new Float32Array(arr);

	// Get data byte size, allocate memory on Emscripten heap, and get pointer
	var nDataBytes = data.length * data.BYTES_PER_ELEMENT;
	var dataPtr = Module._malloc(nDataBytes); // call malloc in js lol welcome 2 hell

	// Copy data to Emscripten heap (directly accessed from Module.HEAPU8)
	var dataHeap = new Uint8Array(Module.HEAPU8.buffer, 
		                          dataPtr, 
		                          nDataBytes);
	dataHeap.set(new Uint8Array(data.buffer));

	// Call function and get result
	func(0, dataHeap.byteOffset, data.length);
	var result = new Float32Array(dataHeap.buffer, 
		                          dataHeap.byteOffset, 
		                          data.length);

	// Free memory
	Module._free(dataHeap.byteOffset);

	return result.slice(); // use slice() to make a copy of result
}

/* Creates a new mesh inside the module and returns the index of the mesh 
 * in the module's internal array. */
ARAP.createNewARAPMesh = function(verts, tris) {
	// make new mesh
	ARAP.createNewMeshWrapper();

	// add vertices
	ARAP.doArrayFunction(verts, ARAP.setMeshVertexDataWrapper);

	// add faces
	ARAP.doArrayFunction(tris, ARAP.setMeshTriangleDataWrapper);

	// setup mesh deformer
	ARAP.setupMeshDeformerWrapper(0);
}

/*  */
ARAP.addControlPoint = function(meshIndex, vertIndex) {
	ARAP.addControlPointWrapper(meshIndex, vertIndex);
}

/*  */
ARAP.setControlPointPosition = function(meshIndex, vertIndex, x, y) {
	ARAP.setControlPointPositionWrapper(meshIndex, vertIndex, x, y);
}

/* Call this after adding and setting the positions of control points. */
ARAP.updateMeshDeformation = function(meshIndex) {
	ARAP.updateMeshDeformationWrapper(meshIndex);
}

/* Call this after calling update() to get your vertices deformed by the 
 * control points. */
/* ~Possible optimization: return all verts in one big array to avoid memory 
 * stuff overhead*/
ARAP.getDeformedVertices = function(meshIndex, verts, size) {
	var empty = [];
	for(var i = 0; i < size; i++) {
		empty.push(0);
	}

	var deformedVerts = ARAP.doArrayFunction(empty, ARAP.getMeshVertexDataWrapper);

	return deformedVerts;
}
