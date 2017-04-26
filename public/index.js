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
  },
  classifierService: {
    name: 'classifier service',
    code: 'd5060003-a904-deb9-4748-2c7f4a124842'
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
  },
  classifierEventCharacteristic: {
    name: 'classifier event characteristic',
    code: 'd5060103-a904-deb9-4748-2c7f4a124842'
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
      ],
      optionalServices: [services.classifierService.code]
    })
    .then(device => {
      console.log('Device discovered', device.name);
      return device.gatt.connect();
    })
    .then(server => {
      console.log('server device: '+ Object.keys(server.device));

      standardServer = server;
      // getService([services.controlService, services.imuDataService], [characteristics.commandCharacteristic, characteristics.imuDataCharacteristic], server);
      getService([services.controlService, services.classifierService], [characteristics.commandCharacteristic, characteristics.classifierEventCharacteristic], server);
      // getService([services.batteryService], [characteristics.batteryLevelCharacteristic], server);

      //Test EMG Data Service
      // return server.getPrimaryService('d5060005-a904-deb9-4748-2c7f4a124842');
    })
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
    return server.getPrimaryService(service.code)
    .then(service => {
      console.log('getting battery service');
      if(reqChar[0].code === characteristics.batteryLevelCharacteristic.code){
        getBatteryLevel(reqChar[0].code, service)
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
      // return new Buffer([0x01,3,emg_mode,imu_mode,classifier_mode]);
      let commandValue = new Uint8Array([0x01,3,0x02,0x03,0x01]);
      characteristic.writeValue(commandValue);
    })
    .then(_ => {
      console.log('getting service: ', requestedServices[1].name);
      if(requestedServices[1].code === services.imuDataService.code){
        getIMUData(requestedServices[1], requestedCharacteristics[1], server)
      } else if(requestedServices[1].code === services.classifierService.code){
        getClassifierData(requestedServices[1], requestedCharacteristics[1], server)
      }
    })
  }

  function getIMUData(service, characteristic, server){
    return server.getPrimaryService(service.code)
    .then(newService => {
      console.log('getting characteristic: ', characteristic.name);
      return newService.getCharacteristic(characteristic.code)
    })
    .then(char => {
      char.startNotifications().then(res => {
        char.addEventListener('characteristicvaluechanged', handleIMUDataChanged);
      })
    })
  }

  function getClassifierData(service, characteristic, server){
    return server.getPrimaryService(service.code)
    .then(newService => {
      console.log('getting characteristic: ', characteristic.name);
      return newService.getCharacteristic(characteristic.code)
    })
    .then(char => {
      char.startNotifications().then(res => {
        console.log('here right??');
        char.addEventListener('characteristicvaluechanged', handlePoseChanged);
      })
    })
  }

  function handlePoseChanged(event){

    let eventReceived = event.target.value.getUint8(0);
    let poseEventCode = event.target.value.getInt16(1) / 256;
    // Arm synced
    if(eventReceived == 1){
      console.log('Arm synced');
      let arm = event.target.value.getUint8(1);
      let x_direction = event.target.value.getUint8(2);

      if(arm == 1){
        console.log('right arm');
      } else if(arm == 2){
        console.log('left arm');
      }

      if(x_direction == 1){
        console.log('towards wrist');
      } else if(x_direction == 2){
        console.log('towards elbow');
      }

      // event pose received
    } else if(eventReceived == 3){
      if( poseEventCode == 2){ //512 in 768 out
        console.log('wave in');
      } else if(poseEventCode == 3){
        console.log('wave out');
      } else if(poseEventCode == 1){
        console.log('fist');
      } else if(poseEventCode == 0){
        console.log('rest');
      } else if(poseEventCode == 4){
        console.log('fingers spread');
      } else if(poseEventCode == 5){
        console.log('double tap');
      } else if(poseEventCode == 255){
        console.log('unknown');
      }
    } else if(eventReceived == 6){
      console.log('arm sync failed');
    } else if(eventReceived == 5){
      console.log('locked');
    } else if(eventReceived == 4){
      console.log('unlocked');
    } else if(eventReceived == 2){
      console.log('arm unsynced');
    }
  }
}
