var ARAP = function() {
	this.VERSION = 'dev';
}

/* Wrapper functions for the emscripten module */
/* Don't call these functions outside of this file. (pretend they're private ok) */

ARAP.setMeshVertexDataWrapper = Module.cwrap(
  'setMeshVertexData', 'number', ['number', 'number']
);

ARAP.getMeshVertexDataWrapper = Module.cwrap(
  'getMeshVertexData', 'number', ['number', 'number']
);

ARAP.setMeshTriangleDataWrapper = Module.cwrap(
  'setMeshTriangleData', 'number', ['number', 'number']
);

ARAP.getMeshTriangleDataWrapper = Module.cwrap(
  'getMeshTriangleData', 'number', ['number', 'number']
);

ARAP.resetMeshWrapper = Module.cwrap(
  'resetMesh', 'number', ['number', 'number']
);

ARAP.setupMeshDeformerWrapper = Module.cwrap(
	'setupMeshDeformer','[number]'
);

ARAP.addControlPointWrapper = Module.cwrap(
	'addControlPoint','[number]'
);

ARAP.setControlPointPositionWrapper = Module.cwrap(
	'setControlPointPosition','[number]', ['number', 'number', 'number']
);

ARAP.updateMeshDeformationWrapper = Module.cwrap(
	'updateMeshDeformation','[number]'
);

/* Small helper function that handles all the nasty memory stuff for arrays. */
/* Don't call this from outside this file (it's also private ok) */
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
	func(dataHeap.byteOffset, data.length);
	var result = new Float32Array(dataHeap.buffer, 
		                          dataHeap.byteOffset, 
		                          data.length);

	// Free memory
	Module._free(dataHeap.byteOffset);

	return result.slice(); // use slice() to make a copy of result
}

/* Setup deform2D inside the module.
 * Call this before doing anything. */
ARAP.setup = function() {
	ARAP.resetMeshWrapper();
}

/* Creates a new mesh inside the module and returns the index of the mesh 
 * in the module's internal array. */
ARAP.createNewARAPMesh = function(verts, tris) {
	// add vertices
	ARAP.doArrayFunction(verts, ARAP.setMeshVertexDataWrapper);

	// add faces
	ARAP.doArrayFunction(tris, ARAP.setMeshTriangleDataWrapper);

	// setup mesh deformer
	ARAP.setupMeshDeformerWrapper();
}

/*  */
ARAP.addControlPoint = function(meshIndex, vertIndex) {
	ARAP.addControlPointWrapper(vertIndex);
}

/*  */
ARAP.setControlPointPosition = function(meshIndex, vertIndex, x, y) {
	ARAP.setControlPointPositionWrapper(vertIndex, x, y);
}

/* Call this after adding and setting the positions of control points. */
ARAP.update = function() {
	ARAP.updateMeshDeformationWrapper();
}

/* Call this after calling update() to get your vertices deformed by the 
 * control points. */
/* ~Possible optimization: return all verts in one big array to avoid memory 
 * stuff overhead*/
ARAP.getDeformedVertices = function(index, verts, size) {
	var empty = [];
	for(var i = 0; i < size; i++) {
		empty.push(0);
	}

	var deformedVerts = ARAP.doArrayFunction(empty, ARAP.getMeshVertexDataWrapper);

	return deformedVerts;
}
