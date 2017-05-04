# Myo Web bluetooth - WIP

Connect the MYO armband to a web page using web bluetooth.

#### Services and characteristics:

Available so far:

* Control Service
  * Command characteristic


* IMU Data Service
  * IMU Data characteristic


* EMG Data Service
  * EMG Data characteristic


* Battery Service
  * Battery level characteristic


* Classifier Service
  * Classifier event characteristic

### Example of use:

```javascript
window.onload = function(){

  let button = document.getElementById("connect");

  button.onclick = function(e){
    var myoController = new MyoWB("Myo");
    myoController.connect();

    myoController.onStateChange(function(state){
      let batteryLevel = state.batteryLevel + '%';
      console.log(batteryLevel);
    });
  }
}
```

### TO DO:

* Refactor.
* Allow to query only certain services instead of all.
