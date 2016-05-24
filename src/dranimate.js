var container;

var camera, scene, renderer;

var mouseX = 0, mouseY = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var activeControlPoint = { hoveredOver: false };

stats = new Stats();
document.body.appendChild( stats.domElement );

/* Setup ImageToMesh and some buttons for it */

ImageToMesh.setup();

var START_WITH_TEST_IMAGE = true;
if(START_WITH_TEST_IMAGE) {
	ImageToMesh.loadTestImage();
	document.getElementById("meshGenerationWindow").style.visibility = "visible";
    document.getElementById("newPuppetWindow").style.visibility = "hidden";
} else {
	document.getElementById("meshGenerationWindow").style.visibility = "hidden";
    document.getElementById("newPuppetWindow").style.visibility = "visible";
}

ImageToMesh.setup();

var imageLoader = document.getElementById('imageLoader');
imageLoader.addEventListener('change', function(e){
	document.getElementById("meshGenerationWindow").style.visibility = "visible";
    document.getElementById("newPuppetWindow").style.visibility = "hidden";
    ImageToMesh.reset();
});

document.getElementById("showMeshButton").onclick = function() {
    ImageToMesh.generateMesh();
    ImageToMesh.redraw();
};

document.getElementById("createPuppetButton").onclick = function() {
	ImageToMesh.generateMesh();
	setupMeshAndARAP();
    document.getElementById("meshGenerationWindow").style.visibility = "hidden";
    document.getElementById("newPuppetWindow").style.visibility = "visible";
}

var puppets = [];

var controlPointToControl = 0;

init();
animate();

function init() {

	/* Initialize THREE canvas and scene */

	container = document.createElement( 'div' );
	container.id = "THREEContainer";
	document.body.appendChild( container );

	camera = new THREE.OrthographicCamera( 0, 
		                                   window.innerWidth, 
		                                   0, 
		                                   window.innerHeight, 
		                                   0.1, 1000 );
	camera.updateProjectionMatrix();

	scene = new THREE.Scene();

	var ambient = new THREE.AmbientLight( 0x101030 );
	scene.add( ambient );

	var directionalLight = new THREE.DirectionalLight( 0xffeedd );
	directionalLight.position.set( 0, 0, 1 );
	scene.add( directionalLight );

	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setClearColor( 0xFFFFFF, 1 );
	container.appendChild( renderer.domElement );

}

function setupMeshAndARAP() {

	/* Setup ARAP on mesh */

	var vertices = ImageToMesh.getVertices();
	var faces = ImageToMesh.getTriangles();
	var controlPoints = ImageToMesh.getControlPointIndices();

	var i2mCanvas = ImageToMesh.getCanvas();
	var i2mContext = i2mCanvas.getContext('2d');

	var image = ImageToMesh.getImage();

	ImageToMesh.eraseUnselectedPixels();

	/* Create THREE texture from image used by ImageToMesh */

	var canvasTexture = new THREE.Texture(document.getElementById("imageToMeshCanvas"));
	canvasTexture.needsUpdate = true;

	/* Create THREE material using that image */

	var wireframeMaterial = new THREE.MeshBasicMaterial({
        color: 0xFF0000,
        wireframe: true,
        wireframeLinewidth: 1
    });

	var texturedMaterial = new THREE.MeshBasicMaterial({
		map: canvasTexture
    });

	/* Create the new ARAPThreeMesh */

	var arapThreeMesh = new ARAPThreeMesh(
		vertices, faces, controlPoints, texturedMaterial, image.width, image.height
	);
	scene.add(arapThreeMesh.threeMesh);
	puppets.push(arapThreeMesh);

}

document.getElementById("THREEContainer").addEventListener( 'mousemove', function ( event ) {

	mouseX = event.clientX;
	mouseY = event.clientY;

	/* Find control point closest to the mouse */

	if(!activeControlPoint.beingDragged) {

		var foundControlPoint = false;

		for(var p = 0; p < puppets.length; p++) {

			var verts = puppets[p].threeMesh.geometry.vertices;
			var controlPoints = puppets[p].controlPoints;

			for(var c = 0; c < controlPoints.length; c++) {

				var vert = verts[controlPoints[c]];
				var mouseVec = new THREE.Vector3(mouseX, mouseY, 0);
				var dist = vert.distanceTo(mouseVec);

				if(dist < 40) {
					activeControlPoint = { 
						puppetIndex: p, 
						hoveredOver: true, 
						beingDragged: false, 
						controlPointIndex: c 
					};
					foundControlPoint = true;
					break;
				}
			}
			/*
			for(var c = 0; c < verts.length; c++) {
				var vert = verts[c];
				var mouseVec = new THREE.Vector3(mouseX, mouseY, 0);
				var dist = vert.distanceTo(mouseVec);
				if(dist < 5) {
					
					console.log(c)
					
				}
			}*/
		}

		if(foundControlPoint) {
			document.getElementById("THREEContainer").style.cursor = "pointer";
		} else {
			document.getElementById("THREEContainer").style.cursor = "default";
			activeControlPoint.hoveredOver = false;
		}
	}

}, false );

document.getElementById("THREEContainer").addEventListener( 'mousedown', function( event ) {
	
	mouseX = event.clientX;
	mouseY = event.clientY;

	if(activeControlPoint.hoveredOver) {
		activeControlPoint.beingDragged = true;
	}

} , false );

document.getElementById("THREEContainer").addEventListener( 'mouseup', function( event ) {
	
	mouseX = event.clientX;
	mouseY = event.clientY;

	if(activeControlPoint) {
		activeControlPoint.beingDragged = false;
		document.getElementById("THREEContainer").style.cursor = "default";
	}

});

document.addEventListener('keydown', function(evt) {
	if(evt.keyCode == 39) { // right arrow
		controlPointToControl++;
		if(controlPointToControl >= puppets[puppets.length-1].controlPoints.length) {
			controlPointToControl = 0;
		}
	}
	if(evt.keyCode == 37) { // left arrow
		controlPointToControl--;
		if(controlPointToControl < 0) {
			controlPointToControl = puppets[puppets.length-1].controlPoints.length-1;
		}
	}
});

window.addEventListener( 'resize', function () {

	camera.left = 0;
	camera.right = window.innerWidth;
	camera.top = 0;
	camera.bottom = window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );

}, false );

function animate() {

	requestAnimationFrame( animate );

	update();
	render();

	stats.update();

}

function update() {

	if(activeControlPoint) {
		if(activeControlPoint.beingDragged) {
			var pi = activeControlPoint.puppetIndex;
			var ci = activeControlPoint.controlPointIndex;
			puppets[pi].setControlPointPosition(ci, mouseX, mouseY);
		}
	}

	for(var i = 0; i < puppets.length; i++) {
		if(activeControlPoint.beingDragged && activeControlPoint.puppetIndex == i) {
			puppets[i].update();
		}
	}

}

function render() {

	camera.position.x = 0;
	camera.position.y = 0;
	camera.position.z = 100;
	camera.lookAt( window.innerWidth/2, window.innerHeight/2, 0 );

	renderer.render( scene, camera );

}