// UUIDs can be generated from here: https://www.guidgenerator.com/online-guid-generator.aspx

const availableData = {
  controlService: 'd5060001-a904-deb9-4748-2c7f4a124842',
  commandCharacteristic: 'd5060401-a904-deb9-4748-2c7f4a124842',
  IMUDataService: 'd5060002-a904-deb9-4748-2c7f4a124842',
  IMUDataCharacteristic: 'd5060402-a904-deb9-4748-2c7f4a124842',
  EMGDataService: 'd5060005-a904-deb9-4748-2c7f4a124842',
  batteryService: 0x180f,
  batteryLevelCharacteristic: 0x2a19
}

window.onload = function(){
  var button = document.getElementById("connect");
  let batteryLevelCharacteristic;

  let standardServer;

  button.onclick = function(e){
    return navigator.bluetooth.requestDevice({
      filters: [
        {name: "Myo"},
        {
          //Battery Service // IMU Data Service // Control Service // EMG Service
          services: [0x180f, availableData.IMUDataService, availableData.controlService, availableData.EMGDataService ]
        }
      ],
      // optionalServices: ['battery_service']
    })
    .then(device => {
      console.log('Device discovered', device.name);
      return device.gatt.connect();
    })
    .then(server => {
      console.log('server device: '+ Object.keys(server.device));

      standardServer = server;
      // getService([availableData.controlService, availableData.IMUDataService], [availableData.commandCharacteristic, availableData.IMUDataCharacteristic], server);
      return getService([availableData.batteryService], [availableData.batteryLevelCharacteristic], server);

      //Test EMG Data Service
      // return server.getPrimaryService('d5060005-a904-deb9-4748-2c7f4a124842');
    })
    // .then(service => {
    //   console.log('getting service');
    //
    //   // Battery level characteristic
    //   // return service.getCharacteristic('battery_level');
    //   // return service.getCharacteristic(0x2a19);
    //
    //   // Test IMU Data characteristic
    //   // return service.getCharacteristic('d5060402-a904-deb9-4748-2c7f4a124842');
    //
    //   // Command characteristic
    //   // return service.getCharacteristic('d5060401-a904-deb9-4748-2c7f4a124842');
    //
    //   //Test EMG characteristic
    //   // return service.getCharacteristic('d5060205-a904-deb9-4748-2c7f4a124842');
    // })
    // .then(characteristic => {
    //   // batteryLevelCharacteristic = characteristic;
    //   commandCharacteristic = characteristic;
    //   // console.log(batteryLevelCharacteristic);
    //   // return characteristic.startNotifications()
    //
    //   // var value = new Uint8Array([0x03,1,0x03]); //Array made of type of command (vibrate), 1 for activate and last argument for vibration type.
    //   // console.log(value);
    //   // characteristic.writeValue(value);
    //
    //   //return new Buffer([0x01,3,emg_mode,imu_mode,classifier_mode]);
    //
    //   // var commandValue = new Uint8Array([0x01,3,0x02,0x01,0x01]);
    //   // commandCharacteristic.writeValue(commandValue); //This tells the Myo to enable the streaming of data.
    //   // console.log(characteristic.readValue());
    //   //  batteryLevelCharacteristic.addEventListener('characteristicvaluechanged',
    //   //      handleBatteryLevelChanged);
    // })
    // .then(_ => {
    //   // console.log('vibrated');
    //
    //   // Get other service: IMUData Service
    //   return standardServer.getPrimaryService('d5060002-a904-deb9-4748-2c7f4a124842');
    //   // characteristic.addEventListener('characteristicvaluechanged', handleBatteryLevelChanged)
    // })
    // .then(newService => {
    //   //Getting IMUData Characteristic
    //   return newService.getCharacteristic('d5060402-a904-deb9-4748-2c7f4a124842');
    // })
    // .then(char => {
    //   char.startNotifications().then(res => {
    //     char.addEventListener('characteristicvaluechanged', handleIMUDataChanged);
    //   })
    // })
    .catch(error => {console.log('error',error)})
  }

  // function handleValueChanged(event){
  //   // let level = event.target.value.getUint8(0);
  //   // console.log('New value is: ', level);
  //   console.log('here');
  //   console.log(event.target.value);
  // }

  function handleBatteryLevelChanged(event){
    let batteryLevel = event.target.value.getUint8(0);
    console.log('> Battery Level is ' + batteryLevel + '%');
  }

  function handleIMUDataChanged(event){
    //byteLength of ImuData DataView object is 20.
    // imuData return {{orientation: {w: *, x: *, y: *, z: *}, accelerometer: Array, gyroscope: Array}}
    let imuData = event.target.value;

    var orientationW = event.target.value.getInt16(0) / 16384;
    var orientationX = event.target.value.getInt16(2) / 16384;
    var orientationY = event.target.value.getInt16(4) / 16384;
    var orientationZ = event.target.value.getInt16(6) / 16384;

    var accelerometerX = event.target.value.getInt16(8) / 2048;
    var accelerometerY = event.target.value.getInt16(10) / 2048;
    var accelerometerX = event.target.value.getInt16(12) / 2048;

    var gyroscopeX = event.target.value.getInt16(14) / 16;
    var gyroscopeY = event.target.value.getInt16(16) / 16;
    var gyroscopeZ = event.target.value.getInt16(18) / 16;

    console.log(orientationW);
  }

  // var notificationsButton = document.getElementById('start');
  //
  // notificationsButton.onclick = function(){
  //   console.log('Starting IMU Data Notifications...');
  //   batteryLevelCharacteristic.startNotifications()
  //   .then(char => {
  //     batteryLevelCharacteristic.addEventListener('characteristicvaluechanged',
  //                                   handleBatteryLevelChanged);
  //     console.log('> Notifications started');
  //     document.querySelector('#start').disabled = true;
  //     document.querySelector('#stop').disabled = false;
  //   })
  //   .catch(error => {
  //     console.log('Argh! ' + error);
  //   });
  // }


  function getService(services, characteristics, server){
    standardServer = server;
    // let { controlService, IMUService } = services;
    // let { commandChar, IMUDataChar } = characteristics;

    if(services[0] === availableData.batteryService){
      getBatteryData(services[0], characteristics, standardServer)
    } else if( services[0] === availableData.controlService) {
      getControlService(services, characteristics, standardServer);
    }
  }

  function getBatteryData(service, characteristics, server){
    return server.getPrimaryService(service)
    .then(service => {
      if(characteristics[0] === availableData.batteryLevelCharacteristic){
        getBatteryLevel(characteristics[0], service)
      }
    })
  }

  function getBatteryLevel(characteristic, service){
    return service.getCharacteristic(characteristic)
    .then(char => {
      char.addEventListener('characteristicvaluechanged',handleBatteryLevelChanged);
      return char.readValue();
    })
    .then(value => {
      let batteryLevel = value.getUint8(0);
      console.log('> Battery Level is ' + batteryLevel + '%');
    })
    .catch(error => {
      console.log('Error: ', error);
    })
  }

  function getControlService(services, characteristics, server){
    let controlService = services[0];
    let IMUService = services[1];
    let commandChar = characteristics[0];
    let IMUDataChar = characteristics[1];

    return server.getPrimaryService(controlService)
    .then(service => {
      return service.getCharacteristic(commandChar);
    })
    .then(characteristic => {
      let commandValue = new Uint8Array([0x01,3,0x02,0x01,0x01]);
      characteristic.writeValue(commandValue);
    })
    .then(_ => {
      return standardServer.getPrimaryService(IMUService)
    })
    then(newService => {
      return newService.getCharacteristic(IMUDataChar)
    })
    .then(char => {
      char.startNotifications().then(res => {
        char.addEventListener('characteristicvaluechanged', handleIMUDataChanged);
      })
    })
  }
}
