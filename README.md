# juego Batalla Naval.
# trabajo final realizado por las alumnas Sofia Fuhrmann y Nadia Beltran.
# utilizamos node.js, express, html, css, json, npm.
# este proyecto es para la entrega a la Facultad de Informatica de la UNLP.
# a confirmar link de muestra de proyecto.
<!-- #Reglas del juego -->

# Cada jugador tiene una flota de 5 barcos de diferente tamaño, por lo que cada uno ocupará un
# número determinado de casillas en el tablero:Barcos de la flota

# 2. Controles:
#
# Utiliza el ratón para colocar tus barcos en el tablero de posición. Arrastra el barco hasta el tablero. Adoptará posición vertical. Si quieres que esté horizontal, pulsa dos veces sobre él y se girará.
# Utiliza el ratón también para señalar tu disparo en tu tablero principal.
#
# 3. Terminología y movimientos:
#
# Agua, hundir y tocar
# Agua: cuando disparas sobre una casilla donde no está colocado ningún barco enemigo, disparas al agua. En tu tablero principal aparecerá una X. Pasa el turno a tu oponente.
# Tocado: cuando disparas en una casilla en la que está ubicado un barco enemigo que ocupa 2 o más casillas y destruyes sólo una parte del barco, le has tocado. En tu tablero principal aparece esa parte del barco con fuego. Vuelves a disparar.
# Hundido: si disparas en una casilla en la que está ubicado un fragata (1 casilla) u otro barco con el resto de casillas tocadas, le has hundido, es decir, has eliminado ese barco del juego. Aparecerá en tu tablero principal el barco completo echando humo. Vuelves a disparar, siempre y cuando no hayas hundido toda la flota de tu enemigo, en cuyo caso habrás ganado.
#
# 4. Reglas generales:
#
# Número de jugadores: 2 (mínimo y máximo).
# Una vez posicionas tus barcos y comienzas la partida, no podrás volver a cambiarlos de posición.
# Podrás disparar en cualquier casilla del tablero, salvo en las que ya has disparado.
# No puedes deshacer disparos ni propios ni de tus oponentes.
# Es un juego por turnos: haces tu disparo, si es "agua" el turno pasa a tu oponente; si "tocas" y/o hundes un barco enemigo, vuelves a disparar.
# Tienes tiempo límite de 15 segundos para realizar tu disparo/s, si se pasa el tiempo y no has hecho tu movimiento, pierdes turno.
# La partida acaba cuando un jugador ha hundido la flota completa del enemigo. Comenzará una nueva partida para ambos en 5 segundos.
# Si un jugador abandona la partida, esta finaliza y tienes que empezar otra nueva.
#
# 5. Comienza la partida:
#
# Una vez has elegido sala, crea una partida e invita o espera a que otro jugador entre en tu partida. O si lo prefieres, puedes unirte a una ya creada siempre que no haya empezado el juego.
#
# Todos los jugadores comienzan la partida con su flota de 9 barcos y su tablero de posición.
# El primer movimiento es distribuir tu flota por dicho tablero. Podrás colocar los barcos de forma vertical y horizontal. Arrastra el barco al tablero de posición para colocarlo de forma vertical, y pulsa dos veces sobre él (cuando estén en el tablero) si quieres colocarlo de forma horizontal.
# No podrás ponerlos fuera del tablero, y entre cada barco tendrá que haber una distancia mínima de 1 casilla. Si no se dan estos requisitos, no podrás comenzar la partida.
# Pulsa sobre “Comenzar la partida” y espera a que tu oponente ubique sus barcos.
# 6. Durante la batalla naval:
#
# En el momento que los dos jugadores habéis pulsado “Comenzar partida”, la batalla naval empieza.
# Aparecerán en tu pantalla los dos tableros: el de posición más pequeño (donde colocaste tus barcos) y el principal, más grande, donde realizarás y verás tus disparos, y los barcos tocados y hundidos de tu oponente.
# El primer jugador que dispara es el que ha creado la partida.
# Si disparas y no das a ningún barco (Agua) pasa el turno a tu oponente.
# Si disparas en una casilla donde se encuentra un barco enemigo (tocar y/o hundir) vuelves a disparar.
# 7. Fin de la partida:
# Gana el jugador que antes hunda la flota de su enemigo.
