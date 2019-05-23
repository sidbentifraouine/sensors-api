var app = require('express')()
var server = require('http').createServer(app)
var io = require('socket.io')(server)

server.listen(3000, () => {
  console.log('✅  The Server is running on port', 3000)
})

io.on('connection', (socket) => {
  console.log(
    `🤝  ${
      socket.handshake.headers['x-forwarded-for'].split(',')[0]
    } is connected`
  )

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
