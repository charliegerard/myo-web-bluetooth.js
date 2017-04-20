// UUIDs can be generated from here: https://www.guidgenerator.com/online-guid-generator.aspx

const services = {
  controlService: {
    name: 'control service',
    code: 'd5060001-a904-deb9-4748-2c7f4a124842'
  },
  imuDataService :{
    name: 'IMU Data Service',
    code: 'd5060002-a904-deb9-4748-2c7f4a124842'
  },
  emgDataService: {
    name: 'EMG Data Service',
    code: 'd5060005-a904-deb9-4748-2c7f4a124842'
  },
  batteryService: {
    name: 'battery service',
    code: 0x180f
  }
}

const characteristics = {
  commandCharacteristic: {
    name: 'command characteristic',
    code: 'd5060401-a904-deb9-4748-2c7f4a124842'
  },
  imuDataCharacteristic: {
    name: 'imu data characteristic',
    code: 'd5060402-a904-deb9-4748-2c7f4a124842'
  },
  batteryLevelCharacteristic: {
    name: 'battery level characteristic',
    code: 0x2a19
  }
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
          services: [services.batteryService.code, services.imuDataService.code, services.controlService.code, services.emgDataService.code ]
        }
      ]
    })
    .then(device => {
      console.log('Device discovered', device.name);
      return device.gatt.connect();
    })
    .then(server => {
      console.log('server device: '+ Object.keys(server.device));

      standardServer = server;
      getService([services.controlService, services.imuDataService], [characteristics.commandCharacteristic, characteristics.imuDataCharacteristic], server);
      // return getService([services.batteryService.code], [characteristics.batteryLevelCharacteristic.code], server);

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

    console.log('orientation: ', orientationW);
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


  function getService(requestedServices, requestedCharacteristics, server){
    standardServer = server;
    // let { controlService, IMUService } = services;
    // let { commandChar, IMUDataChar } = characteristics;
    if(requestedServices[0].code === services.batteryService.code){
      getBatteryData(requestedServices[0], requestedCharacteristics, standardServer)
    } else if( requestedServices[0].code == services.controlService.code) {
      getControlService(requestedServices, requestedCharacteristics, standardServer);
    }
  }

  function getBatteryData(service, reqChar, server){
    return server.getPrimaryService(service)
    .then(service => {
      console.log('getting battery service');
      if(reqChar[0] === characteristics.batteryLevelCharacteristic.code){
        getBatteryLevel(reqChar[0], service)
      }
    })
  }

  function getBatteryLevel(characteristic, service){
    return service.getCharacteristic(characteristic)
    .then(char => {
      console.log('getting battery level characteristic');
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

  function getControlService(requestedServices, requestedCharacteristics, server){
    let controlService = requestedServices[0].code;
    let IMUService = requestedServices[1].code;
    let commandChar = requestedCharacteristics[0].code;
    let IMUDataChar = requestedCharacteristics[1].code;

    return server.getPrimaryService(controlService)
    .then(service => {
      console.log('getting service: ', requestedServices[0].name);
      return service.getCharacteristic(commandChar);
    })
    .then(characteristic => {
      console.log('getting characteristic: ', requestedCharacteristics[0].name);
      let commandValue = new Uint8Array([0x01,3,0x02,0x01,0x01]);
      characteristic.writeValue(commandValue);
    })
    .then(_ => {
      console.log('getting service: ', requestedServices[1].name);
      return standardServer.getPrimaryService(IMUService)
    })
    .then(newService => {
      console.log('getting characteristic: ', requestedCharacteristics[1].name);
      return newService.getCharacteristic(IMUDataChar)
    })
    .then(char => {
      char.startNotifications().then(res => {
        char.addEventListener('characteristicvaluechanged', handleIMUDataChanged);
      })
    })
  }
}
