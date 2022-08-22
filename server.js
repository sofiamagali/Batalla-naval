const express = require('express')
const path = require('path')
const http = require('http')
const PORT = process.env.PORT || 3000
const socketio = require('socket.io')
const app = express()
const server = http.createServer(app)
const io = socketio(server)

app.use(express.static(path.join(__dirname, "public")))

// iniciamos el servidor
server.listen(PORT, () => console.log(`Server running on port ${PORT}`))

// Manejar una solicitud de conexión de socket del cliente web
const connections = [null, null]

io.on('connection', socket => {

  //buscamos un numero de jugador disponible
  let playerIndex = -1; 
  for (const i in connections) {
    if (connections[i] === null) {
      playerIndex = i
      break
    }
  }

  // le decimos al cliente que numnero de jugador es
  socket.emit('player-number', playerIndex) 

  console.log(`Player ${playerIndex} has connected`)

  // verificamos que no se permitan mas de dos jugadores
  if (playerIndex === -1) return

  connections[playerIndex] = false

  //avisamos que numero de jugador se acaba de conectar
  socket.broadcast.emit('player-connection', playerIndex)

  //desconectar
  socket.on('disconnect', () => {
    console.log(`Player ${playerIndex} disconnected`) 
    connections[playerIndex] = null
    //informamos que numero de jugador se desconecto
    socket.broadcast.emit('player-connection', playerIndex)
  })

  // iniciamos el juego
  socket.on('player-ready', () => {
    socket.broadcast.emit('enemy-ready', playerIndex)
    connections[playerIndex] = true
  })

  // verificamos la coneccion de los jugadores
  socket.on('check-players', () => {
    const players = []
    for (const i in connections) {
      connections[i] === null ? players.push({connected: false, ready: false}) : players.push({connected: true, ready: connections[i]}) //si la coneccion no es nula, cambiamos el estado de la variable connected a verdadero. Ese jugador esta conectado correctamente
    }
    socket.emit('check-players', players)
  })

  // hace una jugada y emite a la pantalla la jugada
  socket.on('fire', id => {
    console.log(`Disparo de ${playerIndex}`, id)
    socket.broadcast.emit('fire', id)
  })

  // emite a la pantalla del enemigo la jugada realizada previamente
  socket.on('fire-reply', square => {
    console.log(square)
    socket.broadcast.emit('fire-reply', square)
  })

  // tiempo de coneccion
  setTimeout(() => {
    connections[playerIndex] = null
    socket.emit('timeout')
    socket.disconnect()
  }, 600000) // 10 minutos limites por jugador
})