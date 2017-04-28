window.onload = function(){

  let button = document.getElementById("connect");
  let cube, renderer, scene, camera;
  let myoObject;

  let rotationX = 0;
  let rotationY = 0;

  button.onclick = function(e){
    var myoController = new MyoWB("Myo");
    myoController.connect();

    myoController.onStateChange(function(state){
      console.log('state: ', state);

      let batteryLevel = state.batteryLevel + '%';
      let orientationData = state.orientation;
      rotationX = orientationData[0];
      rotationY = orientationData[1];
      let accelerometerData = state.accelerometer;
      let gyroscopeData = state.gyroscope;

      let poseData = state.pose;

      let emgData = state.emgData;
    });
  }

  init();
  render();

  function init(){
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

    renderer = new THREE.WebGLRenderer({alpha: true});
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.getElementsByClassName('container')[0].appendChild( renderer.domElement );

    var loader = new THREE.OBJLoader();

    var material = new THREE.MeshPhongMaterial( { color: 0x000000 } );

    loader.load( 'test.obj', function ( object ) {
      object.traverse( function ( child ) {
        if ( child instanceof THREE.Mesh ) {
          child.material = material;
        }
      });

      object.position.z = -1;
      object.position.y = 1;
      object.scale.set(0.5,0.5,0.5);
      object.rotation.set(0.7, 0.5, 0);
      myoObject = object;
      scene.add( object );
    });

    var light = new THREE.AmbientLight( 0x404040 ); // soft white light
    light.position.set(0,500,0);
    light.castShadow = true;
    scene.add( light );

    // White directional light at half intensity shining from the top.
    var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
    directionalLight.castShadow = true;
    directionalLight.position.set(0,500,0);
    scene.add( directionalLight );

    var light = new THREE.PointLight( 0xff0000, 1, 500 );
    light.position.set( 100, 100, 100 );
    scene.add( light );

    camera.position.z = 5;
  }

  function render(){
    requestAnimationFrame(render);
    if(myoObject){
      myoObject.rotation.x += rotationX;
      myoObject.rotation.y += rotationY;
    }

    renderer.render(scene, camera);
  }

}
