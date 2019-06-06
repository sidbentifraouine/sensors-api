var app = require('express')()
var server = require('http').createServer(app)
var io = require('socket.io')(server)
var notifyAlexa = require('./alexa-order')

server.listen(3000, () => {
  console.log('✅  The Server is running on port', 3000)
})

function separator() {
  console.log('\n---------------------\n')
}

io.on('connection', (socket) => {
  separator()
  console.log(
    `🤝  ${
      socket.handshake.headers['x-forwarded-for'].split(',')[0]
    } is connected`
  )

  socket.on('smartphone', (data) => {
    separator()
    console.log('📱 SMARTPHONE: ', data)
    io.emit('smartphone', data)
  })

  socket.on('eye', (data) => {
    separator()
    console.log('👁  EYE: ', data)
    io.emit('eye', data)
  })

  socket.on('wallplug', (data) => {
    separator()
    console.log('🔌  WALLPLUG: ', data)
    io.emit('wallplug', data)
  })

  socket.on('alexaorder', () => {
    separator()
    console.log('🗣  ORDER TO ALEXA')
    notifyAlexa()
      .then((result) => {
        separator()
        console.log('✅  ORDER SENT SUCCESSFULLY', result)
      })
      .catch((err) => {
        separator()
        console.log('❌  ORDER NOT SENT', err)
      })
  })
})
