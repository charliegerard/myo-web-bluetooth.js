// UUIDs can be generated from here: https://www.guidgenerator.com/online-guid-generator.aspx

window.onload = function(){
  var button = document.getElementById("connect");

  button.onclick = function(e){
    return navigator.bluetooth.requestDevice({
      filters: [
        {name: "Myo"},
        {
          //GCControlService
          services: ['d5060001-a904-deb9-4748-2c7f4a124842']
        }
      ],
      optionalServices: ['d5060001-a904-deb9-4748-2c7f4a124842']
    })
    .then(device => {
      console.log('Device discovered', device.name);
      return device.gatt.connect();
    })
    .then(server => {
      console.log('server device: '+ Object.keys(server.device));

      //GCControlService
      return server.getPrimaryService('d5060001-a904-deb9-4748-2c7f4a124842');

    })
    .then(service => {
      console.log('getting in service');
      //Command characteristic - WriteValue to indicate a device is listening
      return service.getCharacteristic("d5060401-a904-deb9-4748-2c7f4a124842");
    })
    .then(characteristic => {
      var value = new Uint8Array([0x03,0x01])
      return characteristic.writeValue(value)
    })
    .then(() => {
      console.log('vibrated');
    })
    .catch(error => {console.log('error',error)})
  }

  function handleValueChanged(event){
    // let level = event.target.value.getUint8(0);
    // console.log('New value is: ', level);
    console.log('here');
    console.log(event.target.value);
  }
}
