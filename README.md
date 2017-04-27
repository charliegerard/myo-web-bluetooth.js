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
  let myoWB = new MyoWB('Myo');

  let services = myoWB.services;
  let characteristics = myoWB.characteristics;
  let button = document.getElementById("connect");

  button.onclick = function(e){
    return navigator.bluetooth.requestDevice({
      filters: [
        {name: myoWB.name},
        {
          services: [services.batteryService.uuid,
                     services.imuDataService.uuid,
                     services.controlService.uuid,
                     services.emgDataService.uuid]
        }
      ],
      optionalServices: [services.classifierService.uuid]
    })
    .then(device => {
      console.log('Device discovered', device.name);
      return device.gatt.connect();
    })
    .then(server => {
      console.log('server device: '+ Object.keys(server.device));
      var batteryLevel = myoWB.getBatteryData(services.batteryService, characteristics.batteryLevelCharacteristic, server);
      console.log(batteryLevel);

    })
    .catch(error => {console.log('error',error)})
  }
}

```
