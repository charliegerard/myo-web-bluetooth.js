// UUIDs can be generated from here: https://www.guidgenerator.com/online-guid-generator.aspx

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
          services: [0x180f, 'd5060002-a904-deb9-4748-2c7f4a124842', 'd5060001-a904-deb9-4748-2c7f4a124842', 'd5060005-a904-deb9-4748-2c7f4a124842' ]
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

      //GCControlService
      return server.getPrimaryService('d5060001-a904-deb9-4748-2c7f4a124842');

      // Battery Service
      // return server.getPrimaryService('battery_service');
      // return server.getPrimaryService(0x180f);

      // Test IMU data service
      // return server.getPrimaryService('d5060002-a904-deb9-4748-2c7f4a124842');

      //Test EMG Data Service
      // return server.getPrimaryService('d5060005-a904-deb9-4748-2c7f4a124842');
    })
    .then(service => {
      console.log('getting service');

      // Battery level characteristic
      // return service.getCharacteristic('battery_level');
      // return service.getCharacteristic(0x2a19);

      // Test IMU Data characteristic
      // return service.getCharacteristic('d5060402-a904-deb9-4748-2c7f4a124842');

      // Command characteristic
      return service.getCharacteristic('d5060401-a904-deb9-4748-2c7f4a124842');

      //Test EMG characteristic
      // return service.getCharacteristic('d5060205-a904-deb9-4748-2c7f4a124842');
    })
    .then(characteristic => {
      // batteryLevelCharacteristic = characteristic;
      commandCharacteristic = characteristic;
      // console.log(batteryLevelCharacteristic);
      // return characteristic.startNotifications()

      // var value = new Uint8Array([0x03,1,0x03]); //Array made of type of command (vibrate), 1 for activate and last argument for vibration type.
      // console.log(value);
      // characteristic.writeValue(value);

      //return new Buffer([0x01,3,emg_mode,imu_mode,classifier_mode]);

      var commandValue = new Uint8Array([0x01,3,0x02,0x01,0x01]);
      commandCharacteristic.writeValue(commandValue); //This tells the Myo to enable the streaming of data.
      // console.log(characteristic.readValue());
      //  batteryLevelCharacteristic.addEventListener('characteristicvaluechanged',
      //      handleBatteryLevelChanged);
    })
    .then(_ => {
      // console.log('vibrated');

      // Get other service: IMUData Service
      return standardServer.getPrimaryService('d5060002-a904-deb9-4748-2c7f4a124842');
      // characteristic.addEventListener('characteristicvaluechanged', handleBatteryLevelChanged)
    })
    .then(newService => {
      //Getting IMUData Characteristic
      return newService.getCharacteristic('d5060402-a904-deb9-4748-2c7f4a124842');
    })
    .then(char => {
      char.startNotifications().then(res => {
        char.addEventListener('characteristicvaluechanged', handleIMUDataChanged);
      })
    })
    .catch(error => {console.log('error',error)})
  }

  // function handleValueChanged(event){
  //   // let level = event.target.value.getUint8(0);
  //   // console.log('New value is: ', level);
  //   console.log('here');
  //   console.log(event.target.value);
  // }

  function handleBatteryLevelChanged(event){
    // let batteryLevel = event.target.value.getUint8(0);
    // console.log('> Battery Level is ' + batteryLevel + '%');
  }

  function handleIMUDataChanged(event){
    //byteLength of ImuData DataView object is 20.
    let imuData = event.target.value;
    // console.log(imuData.byteLength);
    // let imuDataX = event.target.value.getUint8(0);
    let imuDataX = event.target.value.getInt16(0);
    let imuDataY = event.target.value.getUint8(1);
    let imuDataZ = event.target.value.getUint8(2);
    let imuDataTest = event.target.value.getUint8(3);
    console.log(imuDataX / 16384);
    // console.log('> IMU Data is ' + imuDataX + 'Y ' + imuDataY + 'here', imuDataZ);
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
}
