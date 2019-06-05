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

  socket.on('smartphone', (data) => {
    console.log('📱 SMARTPHONE: ', data)
    io.emit('smartphone', data)
  })

  socket.on('eye', (data) => {
    console.log('👁  EYE: ', data)
    io.emit('eye', data)
  })

  socket.on('wallplug', (data) => {
    console.log('🔌  WALLPLUG: ', data)
    io.emit('wallplug', data)
  })
})
