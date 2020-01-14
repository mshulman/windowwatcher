const Gpio = require('onoff').Gpio
const fetch = require('node-fetch')
const sensor = new Gpio(18, 'in', 'both', {debounceTimeout: 1000});

console.log('starting...')

var isClosed = false

const protocol = 'http://'
const serverIP = '192.168.85.100'
const serverPort = '51828'
const accessoryId = 'sensor1'
// built URL looks like 'http://192.168.85.100:51828?accessoryId=sensor1&state=false'

function buildURL (isClosed) {
  var newState = 'true'
  if (isClosed === false) {
    newState = 'false'
  }
  return protocol + serverIP + ':' + serverPort +
    '?accessoryId=' + accessoryId +
    '&state=' + newState
}

function updateServer (isClosed) {
  const finalURL = buildURL(isClosed)
  console.log(finalURL)

  fetch(finalURL)
    .then(res => res.json())
    .then(json => console.log(json))
}

sensor.watch((err, value) => {
  if (err) {
    throw err;
  }
  console.log('The value is ' + value);
  updateServer(!value) // true for isClosed
})

process.on('SIGINT', _ => {
  sensor.unexport();
});
