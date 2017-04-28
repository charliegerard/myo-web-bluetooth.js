window.onload = function(){

  let button = document.getElementById("connect");
  let cube, renderer, scene, camera;

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

    var geometry = new THREE.BoxGeometry( 1, 1, 1 );
    var material = new THREE.MeshBasicMaterial( { color: 0x0000ff } );
    cube = new THREE.Mesh( geometry, material );
    scene.add( cube );

    camera.position.z = 5;
  }

  function render(){
    requestAnimationFrame(render);

    cube.rotation.x += rotationX;
    cube.rotation.y += rotationY;

    renderer.render(scene, camera);
  }

}
