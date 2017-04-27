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


### Getting started:

* Add the file `MyoWB.js` in your app.

* Create a new instance of the module:

```
var myoWB = new MyoWB('Myo');
```

* Call methods to get services and pass in the UUIDs of the services and characteristics wanted.

```
  myoWB.getServices([])
```
