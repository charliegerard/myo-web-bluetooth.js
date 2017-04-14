// UUIDs can be generated from here: https://www.guidgenerator.com/online-guid-generator.aspx

window.onload = function(){
  var button = document.getElementById("connect");
  let batteryLevelCharacteristic;

  button.onclick = function(e){
    return navigator.bluetooth.requestDevice({
      filters: [
        {name: "Myo"},
        {
          //Battery Service // IMU Data Service // Control Service
          services: [0x180f, 'd5060002-a904-deb9-4748-2c7f4a124842', 'd5060001-a904-deb9-4748-2c7f4a124842']
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

      //GCControlService
      return server.getPrimaryService('d5060001-a904-deb9-4748-2c7f4a124842');

      // Battery Service
      // return server.getPrimaryService('battery_service');
      // return server.getPrimaryService(0x180f);

      // Test IMU data service
      // return server.getPrimaryService('d5060002-a904-deb9-4748-2c7f4a124842');
    })
    .then(service => {
      console.log('getting in service');
      // Battery level characteristic
      // return service.getCharacteristic('battery_level');
      // return service.getCharacteristic(0x2a19);

      // Test IMU Data characteristic
      // return service.getCharacteristic('d5060402-a904-deb9-4748-2c7f4a124842');
      
      // Test Command characteristic
      return service.getCharacteristic('d5060401-a904-deb9-4748-2c7f4a124842');
    })
    .then(characteristic => {
      // batteryLevelCharacteristic = characteristic;
      // console.log(batteryLevelCharacteristic);
      var value = new Uint8Array([0x03,1,0x03]);
      console.log(value);
      characteristic.writeValue(value);
      // console.log(characteristic.readValue());
      //  batteryLevelCharacteristic.addEventListener('characteristicvaluechanged',
      //      handleBatteryLevelChanged);
    })
    .then(() => {
      console.log('vibrated');
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
    console.log('not getting here');
    // let batteryLevel = event.target.value.getUint8(0);
    let imuData = event.target.value;
    // console.log('> Battery Level is ' + batteryLevel + '%');
    console.log('> IMU Data is ' + imuData);
  }

  // var notificationsButton = document.getElementById('start');

  // notificationsButton.onclick = function(){
  //   console.log('Starting IMU Data Notifications...');
  //   batteryLevelCharacteristic.startNotifications()
  //   .then(_ => {
  //     console.log('> Notifications started');
  //     document.querySelector('#start').disabled = true;
  //     document.querySelector('#stop').disabled = false;
  //   })
  //   .catch(error => {
  //     console.log('Argh! ' + error);
  //   });
  // }
}
