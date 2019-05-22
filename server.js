var app = require('express')()
var server = require('http').createServer(app)
var io = require('socket.io')(server)

server.listen(3000, '172.20.10.8')

io.on('connection', (socket) => {
  console.log('👌  CONNECTED  👌')

  // Smartphone
  socket.on('accelerometer', (data) => {
    console.log('🏎  Accelerometer: ', data)
  })

  socket.on('gyroscope', (data) => {
    console.log('🌍  Gyroscope: ', data)
  })

  socket.on('pedometer', (data) => {
    console.log('🦶  Pedometer: ', data)
  })

  socket.on('pedometer', (data) => {
    console.log('🦶  Pedometer: ', data)
  })

  // Sensor
  socket.on('luminance', (data) => {
    console.log('💡 Luminosity', data)
  })

  socket.on('temperature', (data) => {
    console.log('🔥 Temperature', data)
  })
})
