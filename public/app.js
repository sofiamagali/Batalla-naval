document.addEventListener('DOMContentLoaded', () => {
  const userGrid = document.querySelector('.grid-user')
  const computerGrid = document.querySelector('.grid-computer')
  const displayGrid = document.querySelector('.grid-display')
  const ships = document.querySelectorAll('.ship')
  const destroyer = document.querySelector('.destroyer-container')
  const submarine = document.querySelector('.submarine-container')
  const cruiser = document.querySelector('.cruiser-container')
  const battleship = document.querySelector('.battleship-container')
  const carrier = document.querySelector('.carrier-container')
  const startButton = document.querySelector('#start')
  const rotateButton = document.querySelector('#rotate')
  const turnDisplay = document.querySelector('#whose-go')
  const infoDisplay = document.querySelector('#info')
  const setupButtons = document.getElementById('setup-buttons')
  const userSquares = []
  const computerSquares = []
  let isHorizontal = true
  let isGameOver = false
  let currentPlayer = 'user'
  const width = 10
  let playerNum = 0
  let ready = false
  let enemyReady = false
  let allShipsPlaced = false
  let shotFired = -1
  //barcos
  const shipArray = [
    {
      name: 'destroyer',
      directions: [
        [0, 1],//lugares que ocupa el barco
        [0, width] //espacio
      ]
    },
    {
      name: 'submarine',
      directions: [
        [0, 1, 2],
        [0, width, width*2]
      ]
    },
    {
      name: 'cruiser',
      directions: [
        [0, 1, 2],
        [0, width, width*2]
      ]
    },
    {
      name: 'battleship',
      directions: [
        [0, 1, 2, 3],
        [0, width, width*2, width*3]
      ]
    },
    {
      name: 'carrier',
      directions: [
        [0, 1, 2, 3, 4],
        [0, width, width*2, width*3, width*4]
      ]
    },
  ]

  createBoard(userGrid, userSquares) //creamos el tablero del usuario
  createBoard(computerGrid, computerSquares)//creamos el tablero cp

  // seleccionamos el modo del juego
  if (gameMode === 'singlePlayer') {
    startSinglePlayer()
  } else {
    startMultiPlayer()
  }

  // multijugador
  function startMultiPlayer() {
    const socket = io();// Al ser el mismo dominio que el servidor lo llamamos
                        //usamos esta biblioteca para una mejor comunicacion bidiereccional
    // asignamos numero de jugador
    socket.on('player-number', num => {
      if (num === -1) {//si no es el jugador se da aviso
        infoDisplay.innerHTML = "Sorry, the server is full"
      } else {
        playerNum = parseInt(num) //utilizamos parseInt para que nos devuelva un entero
        if(playerNum === 1) currentPlayer = "enemy"

        console.log(playerNum)

        // obtenemos el estado de otro jugador
        socket.emit('check-players')//enviamos el evento para checkear los jugadores
      }
    })

    socket.on('player-connection', num => { //verifico el exito de la coneccion
      console.log(`Player number ${num} esta conectado o desconectado`)
      playerConnectedOrDisconnected(num)
    })

    // EL enemigo esta listo
    socket.on('enemy-ready', num => { //verifico que la coneccion con el enemigo este lista
      enemyReady = true
      playerReady(num)
      if (ready) {
        playGameMulti(socket)
        setupButtons.style.display = 'none'
      }
    })

    // verificamos el estado de los jugadores
    socket.on('check-players', players => {
      players.forEach((p, i) => {
        if(p.connected) playerConnectedOrDisconnected(i)
        if(p.ready) {
          playerReady(i)
          if(i !== playerReady) enemyReady = true
        }
      })
    })

    // asignamos maxima de tiempo de jugada
    socket.on('timeout', () => {
      infoDisplay.innerHTML = 'You have reached the 10 minute limit'
    })

     // Listo button click
    startButton.addEventListener('click', () => {
      if(allShipsPlaced) playGameMulti(socket)
      else infoDisplay.innerHTML = "Please place all ships"
    })

    // Configurar detectores de eventos para disparar
    computerSquares.forEach(square => {
      square.addEventListener('click', () => {
        if(currentPlayer === 'user' && ready && enemyReady) {
          shotFired = square.dataset.id
          socket.emit('fire', shotFired)
        }
      })
    })

    // On Fire Received
    socket.on('fire', id => {
      enemyGo(id)
      const square = userSquares[id]
      socket.emit('fire-reply', square.classList)
      playGameMulti(socket)
    })

    // On Fire Reply Received
    socket.on('fire-reply', classList => {
      revealSquare(classList)
      playGameMulti(socket)
    })

    function playerConnectedOrDisconnected(num) {
      let player = `.p${parseInt(num) + 1}`
      document.querySelector(`${player} .connected`).classList.toggle('active')
      if(parseInt(num) === playerNum) document.querySelector(player).style.fontWeight = 'bold'
    }
    }



  

  // un solo jugador
  function startSinglePlayer() {//genero los barcos y da play
    generate(shipArray[0])
    generate(shipArray[1])
    generate(shipArray[2])
    generate(shipArray[3])
    generate(shipArray[4])

    startButton.addEventListener('click', () => {
      setupButtons.style.display = 'none'
      playGameSingle()
    })
  }

  //Creamos tablero
  function createBoard(grid, squares) {
    for (let i = 0; i < width*width; i++) {
      const square = document.createElement('div')
      square.dataset.id = i
      grid.appendChild(square)
      squares.push(square)
    }
  }

  //pone los barcos de la computadora de forma aleartoria
  function generate(ship) {
    let randomDirection = Math.floor(Math.random() * ship.directions.length)
    let current = ship.directions[randomDirection]
    if (randomDirection === 0) direction = 1
    if (randomDirection === 1) direction = 10
    let randomStart = Math.abs(Math.floor(Math.random() * computerSquares.length - (ship.directions[0].length * direction)))

    const isTaken = current.some(index => computerSquares[randomStart + index].classList.contains('taken'))
    const isAtRightEdge = current.some(index => (randomStart + index) % width === width - 1)
    const isAtLeftEdge = current.some(index => (randomStart + index) % width === 0)

    if (!isTaken && !isAtRightEdge && !isAtLeftEdge) current.forEach(index => computerSquares[randomStart + index].classList.add('taken', ship.name))

    else generate(ship)
  }
  

  //rotamacion de barcos
  function rotate() {
    if (isHorizontal) {
      destroyer.classList.toggle('destroyer-container-vertical')
      submarine.classList.toggle('submarine-container-vertical')
      cruiser.classList.toggle('cruiser-container-vertical')
      battleship.classList.toggle('battleship-container-vertical')
      carrier.classList.toggle('carrier-container-vertical')
      isHorizontal = false
      return
    }
    if (!isHorizontal) {
      destroyer.classList.toggle('destroyer-container-vertical')
      submarine.classList.toggle('submarine-container-vertical')
      cruiser.classList.toggle('cruiser-container-vertical')
      battleship.classList.toggle('battleship-container-vertical')
      carrier.classList.toggle('carrier-container-vertical')
      isHorizontal = true
      return
    }
  }
  rotateButton.addEventListener('click', rotate)

  //moverse por el barco del usuario
  ships.forEach(ship => ship.addEventListener('dragstart', dragStart))
  userSquares.forEach(square => square.addEventListener('dragstart', dragStart))
  userSquares.forEach(square => square.addEventListener('dragover', dragOver))
  userSquares.forEach(square => square.addEventListener('dragenter', dragEnter))
  userSquares.forEach(square => square.addEventListener('dragleave', dragLeave))
  userSquares.forEach(square => square.addEventListener('drop', dragDrop))
  userSquares.forEach(square => square.addEventListener('dragend', dragEnd))

  let selectedShipNameWithIndex
  let draggedShip //arrastre de barco
  let draggedShipLength

  ships.forEach(ship => ship.addEventListener('mousedown', (e) => {
    selectedShipNameWithIndex = e.target.id
    // console.log(selectedShipNameWithIndex)
  }))

  function dragStart() { //comienza a arrastrar el barco seleccionado
    draggedShip = this
    draggedShipLength = this.childNodes.length
    // console.log(draggedShip)
  }

  function dragOver(e) {//termina de arrastrarlo
    e.preventDefault()
  }

  function dragEnter(e) {//lo posiciona
    e.preventDefault()
  }

  function dragLeave() {//deberia abandonar la operacion de posicionar barco
    // console.log('drag leave')
  }

  function dragDrop() {// lugar donde los barcos ya estan posicionados
    let shipNameWithLastId = draggedShip.lastChild.id
    let shipClass = shipNameWithLastId.slice(0, -2)
    // console.log(shipClass)
    let lastShipIndex = parseInt(shipNameWithLastId.substr(-1))
    let shipLastId = lastShipIndex + parseInt(this.dataset.id)
    // console.log(shipLastId)
    const notAllowedHorizontal = [0,10,20,30,40,50,60,70,80,90,1,11,21,31,41,51,61,71,81,91,2,22,32,42,52,62,72,82,92,3,13,23,33,43,53,63,73,83,93]
    const notAllowedVertical = [99,98,97,96,95,94,93,92,91,90,89,88,87,86,85,84,83,82,81,80,79,78,77,76,75,74,73,72,71,70,69,68,67,66,65,64,63,62,61,60]

    let newNotAllowedHorizontal = notAllowedHorizontal.splice(0, 10 * lastShipIndex)
    let newNotAllowedVertical = notAllowedVertical.splice(0, 10 * lastShipIndex)

    selectedShipIndex = parseInt(selectedShipNameWithIndex.substr(-1))

    shipLastId = shipLastId - selectedShipIndex
    // console.log(shipLastId)

    if (isHorizontal && !newNotAllowedHorizontal.includes(shipLastId)) {
      for (let i=0; i < draggedShipLength; i++) {
        let directionClass
        if (i === 0) directionClass = 'start'
        if (i === draggedShipLength - 1) directionClass = 'end'
        userSquares[parseInt(this.dataset.id) - selectedShipIndex + i].classList.add('taken', 'horizontal', directionClass, shipClass)
      }
    //¡Siempre y cuando el índice de la barra que está arrastrando no esté en la matriz newNotAllowedVertical! Esto significa que, a veces, si arrastra la barra por su
    //índice-1, índice-2, etc., la barra volverá a la cuadrícula de visualización.
    } else if (!isHorizontal && !newNotAllowedVertical.includes(shipLastId)) {
      for (let i=0; i < draggedShipLength; i++) {
        let directionClass
        if (i === 0) directionClass = 'start'
        if (i === draggedShipLength - 1) directionClass = 'end'
        userSquares[parseInt(this.dataset.id) - selectedShipIndex + width*i].classList.add('taken', 'vertical', directionClass, shipClass)
      }
    } else return

    displayGrid.removeChild(draggedShip)
    if(!displayGrid.querySelector('.ship')) allShipsPlaced = true
  }

  function dragEnd() {
    // console.log('dragend')
  }

  // logica del multijugador
  function playGameMulti(socket) {
    setupButtons.style.display = 'none'
    if(isGameOver) return
    if(!ready) {
      socket.emit('player-ready')
      ready = true
      playerReady(playerNum)
    }

    if(enemyReady) {
      if(currentPlayer === 'user') {
        turnDisplay.innerHTML = 'tu turno'
      }
      if(currentPlayer === 'enemy') {
        turnDisplay.innerHTML = "turno del enemigo"
      }
    }
  }

  function playerReady(num) {
    let player = `.p${parseInt(num) + 1}`
    document.querySelector(`${player} .ready`).classList.toggle('active')
  }

  // Lógica de juego para un jugador
  function playGameSingle() {
    if (isGameOver) return
    if (currentPlayer === 'user') {
      turnDisplay.innerHTML = 'tu turno'
      computerSquares.forEach(square => square.addEventListener('click', function(e) { //si escucha dl tiro de la pc
        shotFired = square.dataset.id //le pasa el id del tiro/jugada de la pc
        revealSquare(square.classList) //muestra el tablero con la jugada
      }))
    }
    if (currentPlayer === 'enemy') {
      turnDisplay.innerHTML = 'turno del jugador pc'
      setTimeout(enemyGo, 1000)
    }
  }
//necesitamos en 0 para poder verificar quien gana
  let destroyerCount = 0
  let submarineCount = 0
  let cruiserCount = 0
  let battleshipCount = 0
  let carrierCount = 0
//estas jugadas implican a los barcos que el player le derriba a la pc
  function revealSquare(classList) {
    const enemySquare = computerGrid.querySelector(`div[data-id='${shotFired}']`) //le asigno al cuadrado de jugadas del enemigo 
    const obj = Object.values(classList) //creo un objeto con todos los barcos x jugador
    if (!enemySquare.classList.contains('boom') && currentPlayer === 'user' && !isGameOver) { //si la pc le dio a un barco y si el juego no termino
      if (obj.includes('destroyer')) destroyerCount++ //le sumo la parte del barco que derrumbó..barco perteneciente al jugador player
      if (obj.includes('submarine')) submarineCount++
      if (obj.includes('cruiser')) cruiserCount++
      if (obj.includes('battleship')) battleshipCount++
      if (obj.includes('carrier')) carrierCount++


    }
    if (obj.includes('taken')) { //verifico si el tiro fue errado o no
      enemySquare.classList.add('boom')
    } else {
      enemySquare.classList.add('miss')
    }
    checkForWins() //verifico si ganó
    currentPlayer = 'enemy'
    if(gameMode === 'singlePlayer') playGameSingle()
  }

  //pongo en 0 los barcos del cpu
  let cpuDestroyerCount = 0
  let cpuSubmarineCount = 0
  let cpuCruiserCount = 0
  let cpuBattleshipCount = 0
  let cpuCarrierCount = 0

//estas jugadas implican a los barcos que la pc le derriba al player

  function enemyGo(square) {
    if (gameMode === 'singlePlayer') square = Math.floor(Math.random() * userSquares.length) //hace randmons de tiros
    if (!userSquares[square].classList.contains('boom')) { //si el tiro de la le da a una parte del barco de player
      const hit = userSquares[square].classList.contains('taken') //
      userSquares[square].classList.add(hit ? 'boom' : 'miss') // si es boom sigue sino no suma a una parte de ningiun barco
      if (userSquares[square].classList.contains('destroyer')) cpuDestroyerCount++ //suma un lugar al barco que le pegaron
      if (userSquares[square].classList.contains('submarine')) cpuSubmarineCount++
      if (userSquares[square].classList.contains('cruiser')) cpuCruiserCount++
      if (userSquares[square].classList.contains('battleship')) cpuBattleshipCount++
      if (userSquares[square].classList.contains('carrier')) cpuCarrierCount++
      checkForWins() //verifica ganador
    } else if (gameMode === 'singlePlayer') enemyGo() //si no finalizo la partida, juega el player
    currentPlayer = 'user'
    turnDisplay.innerHTML = 'Tú turno'
  }

  function checkForWins() {
    let contador = 0
    contador = contador +1;
    console.log("el total del contador deberia ser  " + contador);
    let enemy = 'computer'
    if(gameMode === 'multiPlayer') enemy = 'enemy'
    if (destroyerCount === 2) { //verifico con cada cantidad de espacio que ocupa cada barco si los barcos de la pc se hundieron
      infoDisplay.innerHTML = `Hundiste el ${enemy}'s destroyer` 
      destroyerCount = 10
      console.log("BARCO 1 "+ destroyerCount);
    }
    if (submarineCount === 3) {
      infoDisplay.innerHTML = `Hundiste el ${enemy}'s submarine`
      submarineCount = 10
      console.log("BARCO 2 "+ submarineCount);

    }
    if (cruiserCount === 3) {
      infoDisplay.innerHTML = `Hundiste el ${enemy}'s cruiser`
      cruiserCount = 10
      console.log("BARCO 3 " + cruiserCount);

    }
    if (battleshipCount === 4) {
      infoDisplay.innerHTML = `Hundiste el ${enemy}'s battleship`
      battleshipCount = 10
      console.log("BARCO 4 " + battleshipCount);

    }
    if (carrierCount === 5) {
      infoDisplay.innerHTML = `Hundiste el ${enemy}'s carrier`
      carrierCount = 10
      console.log("BARCO 5 " + carrierCount);

    }
    if (cpuDestroyerCount === 2) { //verifico si se hundieron los barcos de el player
      infoDisplay.innerHTML = `${enemy} destruyó tú barco destroyer`
      cpuDestroyerCount = 10
      console.log("BARCO 6 " + cpuDestroyerCount);

    }
    if (cpuSubmarineCount === 3) {
      infoDisplay.innerHTML = `${enemy} destruyó tú barco submarine`
      cpuSubmarineCount = 10
      console.log("BARCO 7 " + cpuSubmarineCount);

    }
    if (cpuCruiserCount === 3) {
      infoDisplay.innerHTML = `${enemy} destruyó tú barco cruiser`
      cpuCruiserCount = 10
      console.log("BARCO 8 " + cpuCruiserCount);

    }
    if (cpuBattleshipCount === 4) {
      infoDisplay.innerHTML = `${enemy} destruyó tú barco battleship`
      cpuBattleshipCount = 10
      console.log("BARCO 9 " + cpuBattleshipCount);

    }
    if (cpuCarrierCount === 5) {
      infoDisplay.innerHTML = `${enemy} destruyó tú barco carrier`
      cpuCarrierCount = 10
      console.log("BARCO 10 " + cpuCarrierCount);

    }

    if ((destroyerCount + submarineCount + cruiserCount + battleshipCount + carrierCount) === 50) { 
      infoDisplay.innerHTML = "Ganaaasteee!"
      gameOver()
    }
    if ((cpuDestroyerCount + cpuSubmarineCount + cpuCruiserCount + cpuBattleshipCount + cpuCarrierCount) === 50) {
      infoDisplay.innerHTML = `${enemy.toUpperCase()} ganó`
      gameOver()
    }
  }

  function gameOver() { //frena el juego avisando previamente al ganador
    isGameOver = true
    startButton.removeEventListener('click', playGameSingle)
  }
})
