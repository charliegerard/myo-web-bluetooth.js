window.onload = function(){

  let button = document.getElementById("connect");

  button.onclick = function(e){
    var myoController = new MyoWB("Myo");
    myoController.connect();

    myoController.onStateChange(function(state){
      console.log('state: ', state);

      let batteryLevel = state.batteryLevel + '%';
      let orientationData = state.orientation;
      let accelerometerData = state.accelerometer;
      let gyroscopeData = state.gyroscope;

      let poseData = state.pose;

      let emgData = state.emgData;
    });
  }
}
