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
          services: [services.batteryService.uuid, services.imuDataService.uuid, services.controlService.uuid, services.emgDataService.uuid ]
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

      // IMU Data
      // getService([services.controlService, services.imuDataService], [characteristics.commandCharacteristic, characteristics.imuDataCharacteristic], server);

      // Command Data
      // getService([services.controlService, services.classifierService], [characteristics.commandCharacteristic, characteristics.classifierEventCharacteristic], server);

      // EMG Data
      myoWB.getService([services.controlService, services.emgDataService], [characteristics.commandCharacteristic, characteristics.emgData0Characteristic], server);
      // getService([services.batteryService], [characteristics.batteryLevelCharacteristic], server);

      //Test EMG Data Service
      // return server.getPrimaryService('d5060005-a904-deb9-4748-2c7f4a124842');
    })
    .catch(error => {console.log('error',error)})
  }
}
