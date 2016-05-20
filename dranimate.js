var container;

var camera, scene, renderer;

var mouseX = 0, mouseY = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

stats = new Stats();
document.body.appendChild( stats.domElement );

/* Setup ImageToMesh and some buttons for it */

ImageToMesh.setup();

document.getElementById("genMeshButton").onclick = function() {
    ImageToMesh.generateMesh();
    ImageToMesh.redraw();
};

document.getElementById("testARAPButton").onclick = function() {
	setupMeshAndARAP();
    document.getElementById("meshGenerationWindow").style.display = "none";
}

var arapThreeMesh;

var controlPointToControl = 0;

init();
animate();

function init() {

	/* Initialize THREE canvas and scene */

	container = document.createElement( 'div' );
	document.body.appendChild( container );

	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
	camera.position.z = -600;

	scene = new THREE.Scene();

	var ambient = new THREE.AmbientLight( 0x101030 );
	scene.add( ambient );

	var directionalLight = new THREE.DirectionalLight( 0xffeedd );
	directionalLight.position.set( 0, 0, 1 );
	scene.add( directionalLight );

	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
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

	/* Create THREE texture from image used by ImageToMesh */

	i2mContext.clearRect(0, 0, i2mCanvas.width, i2mCanvas.height);
	i2mContext.drawImage(image, 0, 0, image.width, image.height,
                             0, 0, i2mCanvas.width, i2mCanvas.height);
	var canvasTexture = new THREE.Texture(document.getElementById("imageToMeshCanvas"));
	canvasTexture.needsUpdate = true;

	/* Create THREE material using that image */

	var material = new THREE.MeshBasicMaterial({
					// uncomment if you need a wireframe...
	                /* color: 0xFFFFFF,
	                wireframe: true,
	                wireframeLinewidth: 1*/
					map: canvasTexture
	            });

	/* Create the new ARAPThreeMesh */

	arapThreeMesh = new ARAPThreeMesh(vertices, faces, controlPoints, material, image.width, image.height);
	scene.add(arapThreeMesh.threeMesh);

}

document.addEventListener( 'mousemove', function ( event ) {

	mouseX = ( event.clientX - windowHalfX ) / 2;
	mouseY = ( event.clientY - windowHalfY ) / 2;

	if(arapThreeMesh) {
		arapThreeMesh.setControlPointPosition(controlPointToControl, mouseX*3, mouseY*3);
	}

}, false );

document.addEventListener( 'mousedown', function( event ) {
		
} , false );

document.addEventListener('keydown', function(evt) {
	if(evt.keyCode == 39) { // right arrow
		controlPointToControl++;
		if(controlPointToControl >= arapThreeMesh.controlPoints.length) {
			controlPointToControl = 0;
		}
	}
	if(evt.keyCode == 37) { // left arrow
		controlPointToControl--;
		if(controlPointToControl < 0) {
			controlPointToControl = arapThreeMesh.controlPoints.length-1;
		}
	}
});

window.addEventListener( 'resize', function () {

	windowHalfX = window.innerWidth / 2;
	windowHalfY = window.innerHeight / 2;

	camera.aspect = window.innerWidth / window.innerHeight;
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
	
	if(arapThreeMesh) {
		arapThreeMesh.update();
	}

}

function render() {

	//camera.lookAt( scene.position );
	camera.lookAt( new THREE.Vector3(ImageToMesh.getCanvas().width/2,
		                             ImageToMesh.getCanvas().height/2,
		                             0) );                
	camera.rotation.z = 0;

	renderer.render( scene, camera );

}