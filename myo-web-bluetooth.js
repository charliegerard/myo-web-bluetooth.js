/**
* @author Charlie Gerard / http://charliegerard.github.io
*/

const services = {
  controlService: {
    name: 'control service',
    uuid: 'd5060001-a904-deb9-4748-2c7f4a124842'
  },
  imuDataService :{
    name: 'IMU Data Service',
    uuid: 'd5060002-a904-deb9-4748-2c7f4a124842'
  },
  emgDataService: {
    name: 'EMG Data Service',
    uuid: 'd5060005-a904-deb9-4748-2c7f4a124842'
  },
  batteryService: {
    name: 'battery service',
    uuid: 0x180f
  },
  classifierService: {
    name: 'classifier service',
    uuid: 'd5060003-a904-deb9-4748-2c7f4a124842'
  }
}

const characteristics = {
  commandCharacteristic: {
    name: 'command characteristic',
    uuid: 'd5060401-a904-deb9-4748-2c7f4a124842'
  },
  imuDataCharacteristic: {
    name: 'imu data characteristic',
    uuid: 'd5060402-a904-deb9-4748-2c7f4a124842'
  },
  batteryLevelCharacteristic: {
    name: 'battery level characteristic',
    uuid: 0x2a19
  },
  classifierEventCharacteristic: {
    name: 'classifier event characteristic',
    uuid: 'd5060103-a904-deb9-4748-2c7f4a124842'
  },
  emgData0Characteristic: {
    name: 'EMG Data 0 characteristic',
    uuid: 'd5060105-a904-deb9-4748-2c7f4a124842'
  }
}

var _this;
var state = {};

class MyoWebBluetooth{
  constructor(name){

    _this = this;
    this.name = name;
    this.services = services;
    this.characteristics = characteristics;

    this.standardServer;

    // this.state = {};
  }

  connect(){
    return navigator.bluetooth.requestDevice({
      filters: [
        {name: this.name},
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

      this.getServices([services.batteryService, services.controlService, services.emgDataService, services.imuDataService, services.classifierService], [characteristics.batteryLevelCharacteristic, characteristics.commandCharacteristic, characteristics.emgData0Characteristic, characteristics.imuDataCharacteristic, characteristics.classifierEventCharacteristic], server);

      // this.getServices([services], [characteristics], server);

      // this.getBatteryData(services.batteryService, characteristics.batteryLevelCharacteristic, server);

      //Test EMG Data Service
      // return server.getPrimaryService('d5060005-a904-deb9-4748-2c7f4a124842');
    })
    .catch(error => {console.log('error',error)})
  }

  getServices(requestedServices, requestedCharacteristics, server){
    this.standardServer = server;

    requestedServices.filter((service) => {
      if(service.uuid == services.batteryService.uuid){
        // No need to pass in all requested characteristics for the battery service as the battery level is the only characteristic available.
        _this.getBatteryData(service, characteristics.batteryLevelCharacteristic, this.standardServer)
      } else if(service.uuid == services.controlService.uuid){
        _this.getControlService(requestedServices, requestedCharacteristics, this.standardServer);
      }
    })
  }

  getBatteryData(service, reqChar, server){
    return server.getPrimaryService(service.uuid)
    .then(service => {
      console.log('getting battery service');
      _this.getBatteryLevel(reqChar.uuid, service)
    })
  }

  getBatteryLevel(characteristic, service){
    return service.getCharacteristic(characteristic)
    .then(char => {
      console.log('getting battery level characteristic');
      char.addEventListener('characteristicvaluechanged', _this.handleBatteryLevelChanged);
      return char.readValue();
    })
    .then(value => {
      let batteryLevel = value.getUint8(0);
      console.log('> Battery Level is ' + batteryLevel + '%');
      state.batteryLevel = batteryLevel;
    })
    .catch(error => {
      console.log('Error: ', error);
    })
  }

  getControlService(requestedServices, requestedCharacteristics, server){
      let controlService = requestedServices.filter((service) => { return service.uuid == services.controlService.uuid});
      let commandChar = requestedCharacteristics.filter((char) => {return char.uuid == characteristics.commandCharacteristic.uuid});

      // Before having access to IMU, EMG and Pose data, we need to indicate to the Myo that we want to receive this data.
      return server.getPrimaryService(controlService[0].uuid)
      .then(service => {
        console.log('getting service: ', controlService[0].name);
        return service.getCharacteristic(commandChar[0].uuid);
      })
      .then(characteristic => {
        console.log('getting characteristic: ', commandChar[0].name);
        // return new Buffer([0x01,3,emg_mode,imu_mode,classifier_mode]);
        // The values passed in the buffer indicate that we want to receive all data without restriction;
        let commandValue = new Uint8Array([0x01,3,0x02,0x03,0x01]);
        characteristic.writeValue(commandValue);
      })
      .then(_ => {
        let IMUService = requestedServices.filter((service) => {return service.uuid == services.imuDataService.uuid});
        let EMGService = requestedServices.filter((service) => {return service.uuid == services.emgDataService.uuid});
        let classifierService = requestedServices.filter((service) => {return service.uuid == services.classifierService.uuid});

        let IMUDataChar = requestedCharacteristics.filter((char) => {return char.uuid == characteristics.imuDataCharacteristic.uuid});
        let EMGDataChar = requestedCharacteristics.filter((char) => {return char.uuid == characteristics.emgData0Characteristic.uuid});
        let classifierEventChar = requestedCharacteristics.filter((char) => {return char.uuid == characteristics.classifierEventCharacteristic.uuid});

        if(IMUService.length > 0){
          console.log('getting service: ', IMUService[0].name);
          _this.getIMUData(IMUService[0], IMUDataChar[0], server);
        }
        if(EMGService.length > 0){
          console.log('getting service: ', EMGService[0].name);
          _this.getEMGData(EMGService[0], EMGDataChar[0], server);
        }
        if(classifierService.length > 0){
          console.log('getting service: ', classifierService[0].name);
          _this.getClassifierData(classifierService[0], classifierEventChar[0], server);
        }
      })
      .catch(error =>{
        console.log('error: ', error);
      })
  }

  handleBatteryLevelChanged(event){
    let batteryLevel = event.target.value.getUint8(0);
    state.batteryLevel = batteryLevel;

    console.log('> Battery Level is ' + batteryLevel + '%');

    _this.onStateChangeCallback(state);
  }

  handleIMUDataChanged(event){
    //byteLength of ImuData DataView object is 20.
    // imuData return {{orientation: {w: *, x: *, y: *, z: *}, accelerometer: Array, gyroscope: Array}}
    let imuData = event.target.value;

    let orientationW = event.target.value.getInt16(0) / 16384;
    let orientationX = event.target.value.getInt16(2) / 16384;
    let orientationY = event.target.value.getInt16(4) / 16384;
    let orientationZ = event.target.value.getInt16(6) / 16384;

    let accelerometerX = event.target.value.getInt16(8) / 2048;
    let accelerometerY = event.target.value.getInt16(10) / 2048;
    let accelerometerZ = event.target.value.getInt16(12) / 2048;

    let gyroscopeX = event.target.value.getInt16(14) / 16;
    let gyroscopeY = event.target.value.getInt16(16) / 16;
    let gyroscopeZ = event.target.value.getInt16(18) / 16;

    var data = {
      orientation: {
        x: orientationX,
        y: orientationY,
        z: orientationZ,
        w: orientationW
      },
      accelerometer: {
        x: accelerometerX,
        y: accelerometerY,
        z: accelerometerZ
      },
      gyroscope: {
        x: gyroscopeX,
        y: gyroscopeY,
        z: gyroscopeZ
      }
    }

    // var orientationOffset = {x : 0,y : 0,z : 0,w : 1};

    // var ori = _this.quatRotate(orientationOffset, data.orientation);

    state = {
      orientation: data.orientation,
      accelerometer: data.accelerometer,
      gyroscope: data.gyroscope
    }

    _this.onStateChangeCallback(state);
  }

  onStateChangeCallback() {
    // return _this.state
  }

  getIMUData(service, characteristic, server){
    return server.getPrimaryService(service.uuid)
    .then(newService => {
      console.log('getting characteristic: ', characteristic.name);
      return newService.getCharacteristic(characteristic.uuid)
    })
    .then(char => {
      char.startNotifications().then(res => {
        char.addEventListener('characteristicvaluechanged', _this.handleIMUDataChanged);
      })
    })
  }

  getEMGData(service, characteristic, server){
    return server.getPrimaryService(service.uuid)
    .then(newService => {
      console.log('getting characteristic: ', characteristic.name);
      return newService.getCharacteristic(characteristic.uuid)
    })
    .then(char => {
      char.startNotifications().then(res => {
        char.addEventListener('characteristicvaluechanged', _this.handleEMGDataChanged);
      })
    })
  }

  getClassifierData(service, characteristic, server){
    return server.getPrimaryService(service.uuid)
    .then(newService => {
      console.log('getting characteristic: ', characteristic.name);
      return newService.getCharacteristic(characteristic.uuid)
    })
    .then(char => {
      char.startNotifications().then(res => {
        char.addEventListener('characteristicvaluechanged', _this.handlePoseChanged);
      })
    })
  }

  handlePoseChanged(event){
    let eventReceived = event.target.value.getUint8(0);
    let poseEventCode = event.target.value.getInt16(1) / 256;
    let armSynced, armType, myoDirection, myoLocked;

    let arm = event.target.value.getUint8(1);
    let x_direction = event.target.value.getUint8(2);

    switch(eventReceived){
      case 1:
        _this.eventArmSynced(arm, x_direction);
        armSynced = true;
        break;
      case 2:
        armSynced = false;
        break;
      case 3:
        _this.getPoseEvent(poseEventCode);
        break;
      case 4:
        myoLocked = false;
        break;
      case 5:
        myoLocked = true;
        break;
      case 6:
        armSynced = false;
        break;
    }

    state.armSynced = armSynced;
    state.myoLocked = myoLocked;

    _this.onStateChangeCallback(state);
  }

  eventArmSynced(arm, x_direction){
    armType = (arm == 1) ? 'right' : ((arm == 2) ? 'left' : 'unknown');
    myoDirection = (x_direction == 1) ? 'wrist' : ((x_direction == 2) ? 'elbow' : 'unknown');

    state.armType = armType;
    state.myoDirection = myoDirection;

    _this.onStateChangeCallback(state);
  }

  getPoseEvent(code){
    let pose;
    switch(code){
      case 1:
        pose = 'fist';
        break;
      case 2:
        pose = 'wave in';
        break;
      case 3:
        pose = 'wave out';
        break;
      case 4:
        pose = 'fingers spread';
        break;
      case 5:
        pose = 'double tap';
        break;
      case 255:
        pose = 'unknown'
        break;
    }

    if(pose){
      state.pose = pose;
      _this.onStateChangeCallback(state);
    }
  }

  handleEMGDataChanged(event){
      //byteLength of ImuData DataView object is 20.
      // imuData return {{orientation: {w: *, x: *, y: *, z: *}, accelerometer: Array, gyroscope: Array}}
      let emgData = event.target.value;

      let sample1 = [
        emgData.getInt8(0),
        emgData.getInt8(1),
        emgData.getInt8(2),
        emgData.getInt8(3),
        emgData.getInt8(4),
        emgData.getInt8(5),
        emgData.getInt8(6),
        emgData.getInt8(7)
      ]

      let sample2 = [
        emgData.getInt8(8),
        emgData.getInt8(9),
        emgData.getInt8(10),
        emgData.getInt8(11),
        emgData.getInt8(12),
        emgData.getInt8(13),
        emgData.getInt8(14),
        emgData.getInt8(15)
      ]

      // console.log('emg data: ', sample1);
      state.emgData = sample1;

      _this.onStateChangeCallback(state);
  }

  onStateChange(callback){
    _this.onStateChangeCallback = callback;
  }

  quatRotate(q, r){
    return {
				w: q.w * r.w - q.x * r.x - q.y * r.y - q.z * r.z,
				x: q.w * r.x + q.x * r.w + q.y * r.z - q.z * r.y,
				y: q.w * r.y - q.x * r.z + q.y * r.w + q.z * r.x,
				z: q.w * r.z + q.x * r.y - q.y * r.x + q.z * r.w
			};
  }

}
