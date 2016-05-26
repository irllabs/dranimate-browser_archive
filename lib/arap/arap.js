/*  ARAP.js  *
 * zrispo.co */

 /* this library only uses flat arrays that represent vertices and triangles 
  * for simplicity, it's recommended to use arap-three.js which wraps this
  * code and handles all that nasty stuff for you. */

var ARAP = (function () {

	var arap = { REVISION: "dev" };

/* Wrapper functions for the emscripten module */

	var createNewMeshWrapper = Module.cwrap(
	  'createNewMesh','[number]',['number']
	);

	var setMeshVertexDataWrapper = Module.cwrap(
	  'setMeshVertexData', 'number', ['number', 'number', 'number']
	);

	var setMeshTriangleDataWrapper = Module.cwrap(
	  'setMeshTriangleData', 'number', ['number', 'number', 'number']
	);

	var setupMeshDeformerWrapper = Module.cwrap(
		'setupMeshDeformer','number', ['number']
	);

	var addControlPointWrapper = Module.cwrap(
		'addControlPoint','number', ['number','number']
	);

	var setControlPointPositionWrapper = Module.cwrap(
		'setControlPointPosition','[number]', ['number', 'number', 'number', 'number']
	);

	var updateMeshDeformationWrapper = Module.cwrap(
		'updateMeshDeformation','[number]', ['number']
	);

	var getMeshVertexDataWrapper = Module.cwrap(
	  'getMeshVertexData', 'number', ['number', 'number', 'number']
	);

/* Small helper function that handles all the nasty memory stuff for arrays */

	var doArrayFunction = function(arr, func, optionalArg) {

		// Create data
		var data = new Float32Array(arr);

		// Get data byte size, allocate memory on Emscripten heap, and get pointer
		var nDataBytes = data.length * data.BYTES_PER_ELEMENT;
		var dataPtr = Module._malloc(nDataBytes);

		// Copy data to Emscripten heap (directly accessed from Module.HEAPU8)
		var dataHeap = new Uint8Array(Module.HEAPU8.buffer, 
			                          dataPtr, 
			                          nDataBytes);
		dataHeap.set(new Uint8Array(data.buffer));

		// Call function and get result
		func(optionalArg, dataHeap.byteOffset, data.length);
		var result = new Float32Array(dataHeap.buffer, 
			                          dataHeap.byteOffset, 
			                          data.length);

		// Free memory
		Module._free(dataPtr);

		//return result.slice(); // use slice() to make a copy of result
		return result;

	}

/* Exposed functions */

	/* Creates a new mesh inside the module and returns the index of the mesh 
	 * in the module's internal array. */
	arap.createNewARAPMesh = function(verts, tris) {
		// make new mesh
		var meshIndex = createNewMeshWrapper();

		// add vertices
		doArrayFunction(verts, setMeshVertexDataWrapper, meshIndex);

		// add faces
		doArrayFunction(tris, setMeshTriangleDataWrapper, meshIndex);

		// setup mesh deformer
		setupMeshDeformerWrapper(meshIndex);

		console.log("new mesh created with ID " + meshIndex)
		return meshIndex;
	}

	/*  */
	arap.addControlPoint = function(meshIndex, vertIndex) {
		addControlPointWrapper(meshIndex, vertIndex);
	}

	/*  */
	arap.setControlPointPosition = function(meshIndex, vertIndex, x, y) {
		setControlPointPositionWrapper(meshIndex, vertIndex, x, y);
	}

	/* Call this after adding and setting the positions of control points.
	 * This is where all the work for mesh deformation is done. 
	 * Note that the first time you call updateMeshDeformation after adding
	 * or removing control points, deform2d must recompute a bunch of
	 * stuff which is very slow. */
	arap.updateMeshDeformation = function(meshIndex) {
		updateMeshDeformationWrapper(meshIndex);
	}

	/* Call this after calling update() to get your vertices deformed by the 
	 * control points. */
	/* ~Possible optimization: return all verts in one big array to avoid memory 
	 * stuff overhead*/
	arap.getDeformedVertices = function(meshIndex, size) {
		var empty = [];
		for(var i = 0; i < size; i++) {
			empty.push(0);
		}

		/* use optionalArg for meshIndex (this is gross - should make a better way) */
		//var deformedVerts = doArrayFunction(empty, getMeshVertexDataWrapper, meshIndex);

		var numBytes = empty.length * Float32Array.BYTES_PER_ELEMENT;
		var ptr = Module._malloc(numBytes);
		getMeshVertexDataWrapper(meshIndex, ptr, empty.length)

		var deformedVerts = []

		for(var i = 0; i < empty.length; i++) {
			var v = HEAPF32[(ptr/Float32Array.BYTES_PER_ELEMENT)+i]
			deformedVerts.push(v)
		}

		return deformedVerts;
	}

	return arap;

})();