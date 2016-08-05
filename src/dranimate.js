/* it's dranimate.js ! */

var Dranimate = function () {

    /* debugging memory issue */
    /*
    console.error("NOTE: using da hack to make sure ARAP.js doesn't crash - takes longer than usual")
    var bigVerts = [1,251,1,298,17,415,19,289,21,200,21,248,24,309,26,220,26,377,27,336,31,182,34,426,36,100,36,148,36,402,41,124,41,351,43,296,45,166,47,39,48,376,53,69,54,411,55,139,55,312,56,96,59,332,61,356,64,27,70,397,70,429,73,9,75,319,85,412,93,383,104,400,114,428,169,424,185,409,190,371,199,389,200,18,210,371,210,412,220,21,230,415,237,32,243,12,248,424,249,48,269,44,269,422,276,399,288,51,289,421,292,378,301,403,306,363,307,58,308,428,311,385,321,403,324,349,327,61,329,375,339,394,346,48,347,69,348,412,349,370,359,390,366,358,367,73,376,376,382,58,390,427,394,385,400,408,402,54,416,420,421,64,424,401,431,378,435,46,436,417,441,66,444,397,451,376,457,200,460,73,461,133,463,171,464,113,464,235,466,288,470,265,471,375,473,149,475,190,477,210,480,393,481,315,484,84,484,132,484,235,486,293,490,270,491,368,494,199,496,219,500,308,501,114,502,385,504,72,505,334,509,277,512,242,513,90,513,192,516,212,516,296,518,317,518,372,521,109,522,129,523,259,528,335,80.55878186968839,24.61968838526912,137.36600306278714,13.965543644716693,163.89112050739956,31.55567300916138,211.81783159053384,33.937809576224545,112.12771635531834,50.725505146778495,409.2590815627142,66.89924605894448,80.88259958071279,65.63102725366876,259.0900170648464,69.69752559726962,220.5033222591362,69.22093023255815,364.3978102189781,73.92700729927007,193.7543496271748,75.57995028997514,302.97472924187724,77.52635379061371,318.47571606475714,85.88542963885429,65.79849726775956,96.81693989071039,135.6626582278481,104.94367088607595,423.46301633045147,93.6032660902978,463.42797202797203,86.43076923076923,136.6728778467909,106.2991718426501,106.82441977800202,102.59939455095862,237.0553097345133,100.33185840707965,344.11700182815355,101.04570383912248,494.0654135338346,112.57556390977443,365.81081081081084,82.92792792792793,380.92740740740743,127.78518518518518,403.3921747042766,123.6960873521383,234.49272237196766,111.9099730458221,179.99043715846994,125.74863387978142,290.3218187186301,126.31178033658105,445.84601691143746,141.0809968847352,97.38011695906432,140.8058479532164,61.03651115618661,144.631507775524,503.5636588380717,145.87762669962916,347.7264112072518,141.93778327152864,220.14334239130434,146.32608695652175,134.868438538206,160.68372093023257,405.7881355932203,170.62953995157386,400.53573033707863,173.80449438202248,57.46798266730862,184.58497833413577,187.61516034985422,176.27113702623907,187.45791399817017,178.74290942360477,247.20554035567716,179.9312585499316,304.13187748156554,186.41151446398186,145.38230240549828,183.72508591065292,238.7211055276382,194.29899497487438,353.5825753949258,197.0473910962183,451.40693858415375,202.0225035161744,116.22257300710339,205.14285714285714,313.7708333333333,186.5,421.7841328413284,217.19680196801968,51.12629852378349,222.3925642427556,250.39293849658316,222.87015945330296,493.64482900700455,232.8652657601978,87.18867924528301,229.52830188679246,190.96273291925465,228.92191659272405,161.65915492957745,228.9943661971831,177.52075310226786,241.71801454856654,363.81648258283775,226.2531860662702,120.27862289831866,248.32906325060048,73.89525569932225,254.1195317313617,249.0909645909646,244.11111111111111,394.0329052969502,252.71669341894062,400.4101941747573,239.40533980582524,298.99776286353466,237.36465324384787,324.6008557457213,257.42665036674816,434.2132442284326,262.6895504252734,220.72756071805702,267.62249208025344,271.5184478371501,268.30979643765903,324.36078157711097,255.24563852058617,378.34420955882354,277.87132352941177,29.78846153846154,277.3487614080834,123.80904723779024,277.3390712570056,448.17391304347825,294.7757210503659,314.0885137916838,309.7340469328942,161.9879618098796,307.57700290577003,189.8580034423408,313.23580034423406,102.08519108280255,317.15525477707007,195.79495798319329,319.6078431372549,255.09310986964618,294.584729981378,376.0755033557047,313.3948545861298,67.66543778801844,313.8811059907834,114.73452380952381,323.7136904761905,441.6495901639344,322.7950819672131,250.7168089490727,329.0091256991463,311.6929133858268,332.5472440944882,423.05445544554453,342.09694719471946,495.0326958667489,332.9796421961752,38.33357041251778,341.726173541963,364.9712936046512,354.71911337209303,489.5701342281879,355.42651006711407,192.56911509543087,362.4008097165992,132.22196620583716,371.505376344086,91.09867577958137,363.2964545066211,251.8986013986014,374.69274475524475,311.6834333179511,391.9483156437471,155.5379061371841,398.55354993983156,421.3285946385053,395.60641754671,154.06415620641562,401.46768944676893,247.65858389912705,402.18089233753636,19.482970671712394,397.2445600756859,141,74,422,328];
    var bigFaces = [31,128,47,37,36,48,79,75,84,114,215,122,119,116,125,115,120,125,114,122,126,125,120,126,124,125,126,215,107,122,120,110,121,116,106,125,109,178,116,117,111,123,118,108,119,107,112,122,110,114,121,111,103,158,110,212,114,178,106,116,148,111,117,102,148,117,113,102,117,212,215,114,104,106,178,106,105,115,101,212,110,148,103,111,104,95,106,96,100,107,102,92,148,104,178,109,99,104,109,101,215,212,101,208,215,92,103,148,94,105,106,86,84,100,143,92,102,95,94,106,215,96,107,93,95,104,208,96,215,208,87,96,89,143,102,92,90,103,94,101,105,94,198,101,198,208,101,83,85,89,88,172,93,88,93,99,208,211,87,91,88,98,93,191,95,155,91,97,90,155,97,191,198,94,191,94,95,172,88,91,172,175,93,143,142,92,175,191,93,155,90,92,142,155,92,162,172,91,89,85,143,85,142,143,155,162,91,211,82,87,142,151,155,162,175,172,191,195,198,195,227,198,227,208,198,128,41,47,175,188,191,80,142,85,227,211,208,151,162,155,82,222,86,222,81,86,162,163,175,195,205,227,187,195,191,81,79,84,211,76,82,188,187,191,78,80,83,80,132,142,76,222,82,78,132,80,73,76,211,71,73,211,77,79,81,163,183,175,214,71,211,132,149,142,149,151,142,227,205,211,205,214,211,183,188,175,76,77,222,151,150,162,171,183,163,77,75,79,149,150,151,150,163,162,74,72,132,72,149,132,78,74,132,150,159,163,159,171,163,183,187,188,73,70,76,183,195,187,149,147,150,194,190,183,183,190,195,199,205,195,147,159,150,62,214,205,190,199,195,66,67,136,66,136,72,71,69,73,199,62,205,199,210,62,159,174,171,136,149,72,136,67,149,214,69,71,67,147,149,62,69,214,171,194,183,189,194,171,174,189,171,139,147,67,64,65,69,147,154,159,154,174,159,62,64,69,63,139,67,65,61,68,139,154,147,154,168,174,54,51,59,168,189,174,193,199,190,138,139,63,58,138,63,62,57,64,57,60,64,138,154,139,194,189,190,189,193,190,210,57,62,220,56,61,154,167,168,57,55,60,193,204,199,209,210,199,204,209,199,177,189,168,60,55,220,209,57,210,134,154,138,209,55,57,53,138,58,209,219,55,167,177,168,53,134,138,134,146,154,186,193,189,177,186,189,167,170,177,52,51,54,160,167,154,152,160,154,146,152,154,219,52,55,50,134,53,224,51,52,219,224,52,49,134,50,224,48,51,192,204,193,186,192,193,209,42,219,49,135,134,135,146,134,203,209,204,192,203,204,224,45,48,203,42,209,42,224,219,180,186,177,42,45,224,170,180,177,46,135,49,180,192,186,160,170,167,201,203,192,130,135,46,160,165,170,165,166,170,44,46,47,203,216,42,166,180,170,137,152,146,135,137,146,44,130,46,153,160,152,137,153,152,38,37,43,130,137,135,180,182,192,182,201,192,153,165,160,182,200,201,41,129,130,129,137,130,216,39,42,166,181,180,144,153,137,200,216,203,201,200,203,128,129,41,226,144,137,39,38,40,169,181,166,153,161,165,221,38,39,200,217,216,129,226,137,197,200,182,217,39,216,161,169,165,181,182,180,217,221,39,169,166,165,223,37,38,221,223,38,207,217,200,181,184,182,184,197,182,144,161,153,141,144,226,169,173,181,223,36,37,131,226,129,128,131,129,197,207,200,173,184,181,217,223,221,156,161,144,217,35,223,35,36,223,145,156,144,161,173,169,202,207,197,207,218,217,145,141,226,131,145,226,156,173,161,141,145,144,127,131,128,31,127,128,173,179,184,34,35,217,218,34,217,133,145,131,156,164,173,184,185,197,185,202,197,185,206,202,202,218,207,179,185,184,164,179,173,206,32,202,32,218,202,33,30,36,127,133,131,157,164,156,140,156,145,133,140,145,32,26,218,140,157,156,23,157,140,26,27,218,17,206,185,164,176,179,127,28,133,27,29,218,218,29,34,18,164,157,27,20,29,28,19,133,176,185,179,17,24,206,21,140,133,15,23,140,196,17,185,31,28,127,25,15,140,206,26,32,176,5,185,5,196,185,24,26,206,22,11,30,20,14,22,12,15,25,4,176,164,10,4,164,13,18,157,4,7,176,18,10,164,7,5,176,15,13,23,17,6,24,14,11,22,8,225,14,2,11,14,196,3,17,3,6,17,213,9,16,225,2,14,5,0,196,0,3,196,3,1,6,0,1,3];
    ARAP.createNewARAPMesh(bigVerts, bigFaces);
    ARAP.addControlPoint(0, 226);
    ARAP.addControlPoint(0, 227);
    ARAP.setControlPointPosition(0, 226, 0, 0);
    ARAP.setControlPointPosition(0, 227, 100, 100);
    ARAP.updateMeshDeformation(0);
    ARAP.getDeformedVertices(0, bigVerts.length)*/

    var that = this;

    var container;

    var camera, scene, renderer;

    var mouseState = {down: false};
    var mouseRelative = {x:0, y:0};
    var mouseAbsolute = {x:0, y:0};

    var windowHalfX = window.innerWidth / 2;
    var windowHalfY = window.innerHeight / 2;

    var activeControlPoint = { hoveredOver: false, valid:false };

    var puppets = [];

    var controlPointToControl = 0;

    var panEnabled = false;
    var zoom = 1.0;
    var panPosition = {x:0, y:0};
    var panFromPosition = {x:0, y:0}

    var renderWireframes = false;

    var selectedPuppet = null;

/*****************************
    API
*****************************/

    this.setup = function (canvasContainer) {

        /* Initialize THREE canvas and scene */

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

        renderer = new THREE.WebGLRenderer( { antialias: true } );
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );
        renderer.setClearColor( 0xFFFFFF, 1 );
        THREEContainer = canvasContainer;
        THREEContainer.appendChild( renderer.domElement );

        animate();

        // THREE events

        var updateMousePosition = function (x,y) {
            var boundingRect = renderer.domElement.getBoundingClientRect();

            mouseAbsolute = {
                x: x - boundingRect.left,
                y: y - boundingRect.top
            };

            var zoomTransformed = zoom;
            mouseRelative = {
                x: (x - boundingRect.left) / zoomTransformed - panPosition.x,
                y: (y - boundingRect.top)  / zoomTransformed - panPosition.y
            };
        }

        THREEContainer.addEventListener( 'mousemove', function ( event ) {

            updateMousePosition(event.clientX, event.clientY);

            /* Find control point closest to the mouse */

            if(panEnabled) {
                panPosition.x = mouseAbsolute.x;
                panPosition.y = mouseAbsolute.y;
            } else {
                if(!activeControlPoint.beingDragged) {

                    var foundControlPoint = false;

                    for(var p = 0; p < puppets.length; p++) {

                        var verts = puppets[p].threeMesh.geometry.vertices;
                        var controlPoints = puppets[p].controlPoints;

                        for(var c = 0; c < controlPoints.length; c++) {

                            var vert = verts[controlPoints[c]];
                            var mouseVec = new THREE.Vector3(mouseRelative.x, mouseRelative.y, 0);
                            var dist = vert.distanceTo(mouseVec);

                            if(dist < 40) {
                                activeControlPoint = {
                                    valid: true,
                                    puppetIndex: p,
                                    hoveredOver: true,
                                    beingDragged: false,
                                    controlPointIndex: c
                                };
                                foundControlPoint = true;
                                break;
                            }
                        }
                    }

                    if(foundControlPoint) {
                        THREEContainer.style.cursor = "pointer";
                    } else {
                        THREEContainer.style.cursor = "default";
                        activeControlPoint.hoveredOver = false;
                    }
                }
            }

        }, false );

        THREEContainer.addEventListener( 'mousedown', function( event ) {

            updateMousePosition(event.clientX, event.clientY);
            mouseState.down = true;

            if(panEnabled) {

            } else {
                if(activeControlPoint.hoveredOver) {
                    if(selectedPuppet) {
                        selectedPuppet.boundingBox.visible = false;
                    }
                    selectedPuppet = puppets[activeControlPoint.puppetIndex];
                    selectedPuppet.boundingBox.visible = true;
                    activeControlPoint.beingDragged = true;
                } else {
                    if(selectedPuppet) {
                        selectedPuppet.boundingBox.visible = false;
                        selectedPuppet = null;
                    }
                }
            }

        } , false );

        THREEContainer.addEventListener( 'mouseup', function( event ) {

            updateMousePosition(event.clientX, event.clientY);
            mouseState.down = false;

            if(panEnabled) {

            } else {
                if(activeControlPoint) {
                    activeControlPoint.beingDragged = false;
                    THREEContainer.style.cursor = "default";
                }
            }

        });

        function mousewheel( e ) {
            var d = ((typeof e.wheelDelta != "undefined")?(-e.wheelDelta):e.detail);
            d *= 0.01;

            zoom += d;

            refreshCamera();
        }

        document.body.addEventListener( 'mousewheel', mousewheel, false );
        document.body.addEventListener( 'DOMMouseScroll', mousewheel, false ); // firefox

    }

    this.createNewPuppet = function (vertices, faces, controlPoints, image) {

        /* Create the new Puppet */

        var puppet = new Puppet(image);
        puppet.generateMesh(vertices, faces, controlPoints, scene);
        puppets.push(puppet);

    }

    this.zoomIn = function () {
        zoom += 0.1;
        panPosition.x -= (0.1)*window.innerWidth/2;
        panPosition.y -= (0.1)*window.innerHeight/2;

        refreshCamera();
        camera.updateProjectionMatrix();
    }

    this.zoomOut = function () {
        zoom -= 0.1;
        panPosition.x += (0.1)*window.innerWidth/2;
        panPosition.y += (0.1)*window.innerHeight/2;

        refreshCamera();
        camera.updateProjectionMatrix();
    }

    this.setPanEnabled = function (enable) {
        panEnabled = enable;
    }

    this.getPanEnabled = function (enable) {
        return panEnabled;
    }

    this.getSelectedPuppet = function () {
        return selectedPuppet;
    }

    this.deleteSelectedPuppet = function () {
        if(selectedPuppet) {
            var index = puppets.indexOf(selectedPuppet);
            selectedPuppet.removeFromScene(scene);
            selectedPuppet.cleanup();
            puppets.splice(index, 1);
        }
    }

    this.toggleRenderWireframes = function () {
        renderWireframes = !renderWireframes;
    }

/*****************************
    Dom events
*****************************/

    document.addEventListener('keydown', function(evt) {
        
    });

    window.addEventListener( 'resize', function () {

        refreshCamera();
        renderer.setSize( window.innerWidth, window.innerHeight );

    }, false );

/*****************************
    Draw/update loop
*****************************/

    function animate() {

        requestAnimationFrame( animate );

        update();
        render();

    }

    function update() {

        if(activeControlPoint.beingDragged) {
            var pi = activeControlPoint.puppetIndex;
            var ci = activeControlPoint.controlPointIndex;
            puppets[pi].setControlPointPosition(ci, mouseRelative.x, mouseRelative.y);
        }

        for(var i = 0; i < puppets.length; i++) {
            puppets[i].update();
        }

    }

    function refreshCamera() {

        if(zoom < 0.1) zoom = 0.1;
        if(zoom > 3) zoom = 3;

        camera.left = 0;
        camera.right = window.innerWidth / zoom;
        camera.top = 0;
        camera.bottom = window.innerHeight / zoom;
        camera.updateProjectionMatrix();
        //camera.lookAt( 0, 0, 0 );
    }

    function render() {

        for(var i = 0; i < puppets.length; i++) {
            puppets[i].setRenderWireframe(renderWireframes);
        }

        camera.position.x = -panPosition.x;
        camera.position.y = -panPosition.y;
        camera.position.z = 100;

        renderer.render( scene, camera );

    }

};
