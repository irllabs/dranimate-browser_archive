var ARAP = function() {
	this.VERSION = 'dev';
}

/* Create functions from emscripten module */

ARAP.setMeshVertexData = Module.cwrap(
  'setMeshVertexData', 'number', ['number', 'number']
);

ARAP.getMeshVertexData = Module.cwrap(
  'getMeshVertexData', 'number', ['number', 'number']
);

ARAP.setMeshTriangleData = Module.cwrap(
  'setMeshTriangleData', 'number', ['number', 'number']
);

ARAP.getMeshTriangleData = Module.cwrap(
  'getMeshTriangleData', 'number', ['number', 'number']
);

ARAP.resetMesh = Module.cwrap(
  'resetMesh', 'number', ['number', 'number']
);

ARAP.setupMeshDeformer = Module.cwrap(
	'setupMeshDeformer','[number]'
);

ARAP.addControlPoint = Module.cwrap(
	'addControlPoint','[number]'
);

ARAP.setControlPointPosition = Module.cwrap(
	'setControlPointPosition','[number]', ['number', 'number', 'number']
);

ARAP.updateMeshDeformation = Module.cwrap(
	'updateMeshDeformation','[number]'
);

/* Small helper function that handles all the nasty array memory stuff for you. */
ARAP.doArrayFunction = function(arr, func) {
	// Create data
	var data = new Float32Array(arr);

	// Get data byte size, allocate memory on Emscripten heap, and get pointer
	var nDataBytes = data.length * data.BYTES_PER_ELEMENT;
	var dataPtr = Module._malloc(nDataBytes);

	// Copy data to Emscripten heap (directly accessed from Module.HEAPU8)
	var dataHeap = new Uint8Array(Module.HEAPU8.buffer, dataPtr, nDataBytes);
	dataHeap.set(new Uint8Array(data.buffer));

	// Call function and get result
	func(dataHeap.byteOffset, data.length);
	var result = new Float32Array(dataHeap.buffer, dataHeap.byteOffset, data.length);

	// Free memory
	Module._free(dataHeap.byteOffset);

	return result.slice(); // use slice() to make a copy of result
}