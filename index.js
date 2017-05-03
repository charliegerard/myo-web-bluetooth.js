window.onload = function(){

  let button = document.getElementById("connect");
  let cube, renderer, scene, camera;
  let myoObject;
  var mesh;

  let orientationX = 0;
  let orientationY = 0;
  let orientationZ = 0;
  let orientationW = 0;

  let eulerAngle;

  var axis = new THREE.Vector3();
	var quaternion = new THREE.Quaternion();
	var quaternionHome = new THREE.Quaternion();
	var initialised = false;
	var timeout = null;


  button.onclick = function(e){
    var myoController = new MyoWB("Myo");
    myoController.connect();

    window.quaternion = new THREE.Quaternion();

    myoController.onStateChange(function(state){
      // console.('state: ', state);

      // let batteryLevel = state.batteryLevel + '%';
      let accelerometerData = state.accelerometer;
      let gyroscopeData = state.gyroscope;
      let poseData = state.pose;
      let emgData = state.emgData;

      let orientationData = state.orientation;
      orientationX = orientationData.x;
      orientationY = orientationData.y;
      orientationZ = orientationData.z;

      if(poseData){
        // console.log(poseData);
        var poseDiv = document.getElementsByClassName('pose-data')[0];
        poseDiv.innerHTML = poseData;
      }


      // window.quaternion.x = state.orientation.y;
      // window.quaternion.y = state.orientation.z;
      // window.quaternion.z = -state.orientation.x;
      // window.quaternion.w = state.orientation.w;
      //
      // if(!window.baseRotation) {
      //     window.baseRotation = quaternion.clone();
      //     window.baseRotation = window.baseRotation.conjugate();
      // }
      //
      // window.quaternion.multiply(baseRotation);
      // window.quaternion.normalize();
      // window.quaternion.z = -quaternion.z;

      // if(mesh !== undefined){
      //   var angle = Math.sqrt( orientationData.x * orientationData.x + orientationData.y * orientationData.y + orientationData.z * orientationData.z );
      //
			// 	if ( angle > 0 ) {
			// 		axis.set( orientationData.x, orientationData.y, orientationData.z )
			// 		axis.multiplyScalar( 1 / angle );
			// 		quaternion.setFromAxisAngle( axis, angle );
      //
			// 		// if ( initialised === false ) {
			// 		// 	quaternionHome.copy( quaternion );
			// 		// 	quaternionHome.inverse();
			// 		// 	initialised = true;
			// 		// }
			// 	} else {
			// 		quaternion.set( 0, 0, 0, 1 );
			// 	}
      //
      //   // mesh.quaternion.copy( quaternionHome );
			// 	mesh.quaternion.multiply( quaternion );
      // }
    });
  }

  init();
  render();

  function init(){
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.001, 10 );

    renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.getElementsByClassName('container')[0].appendChild( renderer.domElement );

    var loader = new THREE.JSONLoader()
    loader.load('myo.json', function(geometry){
      var material = new THREE.MeshPhongMaterial( { color: 0x888899, shininess: 15, side: THREE.DoubleSide } );
				mesh = new THREE.Mesh( geometry, material );
        mesh.rotation.x = 0.5;
        mesh.scale.set(0.5, 0.5, 0.5);
				scene.add( mesh );
    })

    // var geometry = new THREE.BoxGeometry(1, 1, 1);
    // var material = new THREE.MeshPhongMaterial({color: 0x888899, shininess: 15, side: THREE.DoubleSide });
    // mesh = new THREE.Mesh(geometry, material);
    // mesh.rotation.x = 0.5;
    // scene.add(mesh);

    var light = new THREE.HemisphereLight( 0xddddff, 0x808080, 0.7 );
  			light.position.set( 0, 1, 0 );
  			scene.add( light );

		var light = new THREE.DirectionalLight( 0xffffff, 0.6 );
  			light.position.set( 1, 1, 1 );
  			scene.add( light );

		var light = new THREE.DirectionalLight( 0xffffff, 0.4 );
  			light.position.set( 1, -1, 1 );
  			scene.add( light );

    camera.position.z = 5;
  }

  function render(){
    requestAnimationFrame(render);

    if(cube && window.quaternion){
      // mesh.setRotationFromQuaternion(window.quaternion)

      // numbers found here: https://github.com/logotype/myodaemon/blob/master/native-osx/visualizer/visualizer.html#L207

      // cube.rotation.x = orientationX - 1.3;
      // cube.rotation.y = orientationY;
      // cube.rotation.z = orientationZ + 0.6;
    }

    renderer.render(scene, camera);
  }

}
