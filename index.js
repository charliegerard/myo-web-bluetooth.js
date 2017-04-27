window.onload = function(){

  let button = document.getElementById("connect");

  button.onclick = function(e){
    var myoController = new MyoWB("Myo");
    myoController.connect();

    myoController.onStateChange(function(state){
      console.log('state: ', state);
    })

  }
}
