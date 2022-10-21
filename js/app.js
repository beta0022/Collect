const WALL = 'WALL'
const FLOOR = 'FLOOR'
const BALL = 'BALL'
const GAMER = 'GAMER'
const GLUE = 'GLUE'
const BOMB = 'BOMB'

const GAMER_IMG = '<img src="img/gamer.png" />'
const BALL_IMG = '<img src="img/ball.png" />'
const GLUE_IMG = '<img src="img/glue.png" />'
const BOMB_IMG = '<img src="img/bomb.png" />'

const COLLECT_SOUND = new Audio('sound/ball.wav')
const GLUE_SOUND = new Audio('sound/glue.wav')
const WIN_SOUND = new Audio('sound/win.wav')
const BOMB_SOUND = new Audio('sound/bomb.wav')

var gBoard
var gGamerPos
var gIsGameOn
var gBallsOnBoard
var gBallsCollectedCounter
var gIntervalBall
var gIsGlue
var gIntervalGlue
var gIsBomb
var gIntervalBomb


function initGame() {
	gGamerPos = { i: 2, j: 9 }
	gBoard = buildBoard()
	renderBoard(gBoard)

	gIsGameOn = true
	gBallsOnBoard = 2
    gBallsCollectedCounter = 0
	gIsGlue = false
	gIsBomb = false

    gIntervalBall = setInterval(addBall, 3000)
	gIntervalGlue = setInterval(addGlue, 5000)
	gIntervalBomb = setInterval(addBomb, 10000)
}


function buildBoard() {
	// Create the Matrix
	var board = createMat(10, 12)

	// Put FLOOR everywhere and WALL at edges
	for (var i = 0; i < board.length; i++) {
		for (var j = 0; j < board[0].length; j++) {
			// Put FLOOR in a regular cell
			var cell = { type: FLOOR, gameElement: null }
			// Place Walls at edges
			if (i === 0 || i === board.length - 1 || j === 0 || j === board[0].length - 1) {
				cell.type = WALL
			}

			// Add created cell to The game board
			board[i][j] = cell
		}
	}

	board[0][Math.floor(board[0].length / 2)].type = FLOOR
	board[board.length - 1][Math.floor(board[0].length / 2)].type = FLOOR
	board[Math.floor(board.length / 2)][0].type = FLOOR
	board[Math.floor(board.length / 2)][board[0].length - 1].type = FLOOR

	// Place the gamer at selected position
	board[gGamerPos.i][gGamerPos.j].gameElement = GAMER

	// Place the Balls (currently randomly chosen positions)
	board[3][8].gameElement = BALL
	board[7][4].gameElement = BALL

	console.log(board)
	return board
}


// Render the board to an HTML table
function renderBoard(board) {
	var strHTML = ''

	for (var i = 0; i < board.length; i++) {
		strHTML += '<tr>\n'

		for (var j = 0; j < board[0].length; j++) {
			var currCell = board[i][j]

			var cellClass = getClassName({ i: i, j: j })

			//TODO - change to short if statement
			cellClass += (currCell.type === FLOOR) ?  ' floor' : ' wall'

			//TODO - Change To template string
			strHTML += '\t<td class="cell ' + cellClass +
				'"  onclick="moveTo(' + i + ',' + j + ')" >\n'

			// TODO - change to switch case statement
			if (currCell.gameElement === GAMER) {
				strHTML += GAMER_IMG
			} else if (currCell.gameElement === BALL) {
				strHTML += BALL_IMG
			}

			strHTML += '\t</td>\n'
		}

		strHTML += '</tr>\n'
	}

	var elBoard = document.querySelector('.board')
	elBoard.innerHTML = strHTML
}


function addBall() {
	addElement(BALL, BALL_IMG)

    gBallsOnBoard++
}


function addGlue() {
	addElement(GLUE, GLUE_IMG)

}


function addBomb() {
	addElement(BOMB, BOMB_IMG)

}


function addElement(gameElement, value) {
	var location = getEmptyCells()

	if (!location) return
	
    gBoard[location.i][location.j].gameElement = gameElement
    renderCell(location, value)

	if (gameElement === GLUE) setTimeout(removeElement, 3000,location)

	else if (gameElement === BOMB) setTimeout(removeElement, 5000,location)
	
}

function removeElement(location){
	if (gBoard[location.i][location.j].gameElement !== GAMER) {
		gBoard[location.i][location.j].gameElement = null
		renderCell(location, '')
	}
}


// Move the player to a specific location
function moveTo(i, j) {

	console.log(i,j)

	if (gIsGlue || !gIsGameOn) return

	var targetCell = gBoard[i][j]

	if (targetCell.type === WALL) return

	// Calculate distance to make sure we are moving to a neighbor cell
	var iAbsDiff = Math.abs(i - gGamerPos.i)
	var jAbsDiff = Math.abs(j - gGamerPos.j)

	// If the clicked Cell is one of the four allowed
	if ((iAbsDiff === 1 && jAbsDiff === 0) || (jAbsDiff === 1 && iAbsDiff === 0) || iAbsDiff === gBoard.length - 1 || jAbsDiff === gBoard[0].length - 1) {

		if (targetCell.gameElement === BOMB) {
			BOMB_SOUND.play()
			gIsBomb = true
			gameOver()
			markCellsAround(i,j)
			console.log('BOMB')
		}

		else if (targetCell.gameElement === BALL) {
			COLLECT_SOUND.play()
			console.log('COLLECTING')
			gBallsCollectedCounter++
			gBallsOnBoard--
			document.querySelector('h2 span').innerText = gBallsCollectedCounter
			isVictory ()
		}

		else if (targetCell.gameElement === GLUE) {
			GLUE_SOUND.play()
			gIsGlue = true
			console.log('GLUED')
			setTimeout(() => gIsGlue = false, 3000)
		}

		// Model:
		gBoard[gGamerPos.i][gGamerPos.j].gameElement = null
		// Dom:
		renderCell(gGamerPos, '')
		
		// MOVING to selected position
		// Model:
		gGamerPos.i = i
		gGamerPos.j = j
		gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER
		// DOM:
		renderCell(gGamerPos, GAMER_IMG)

	} else console.log('TOO FAR')
}


// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
	var cellSelector = '.' + getClassName(location)
	var elCell = document.querySelector(cellSelector)
	elCell.innerHTML = value
}


function restarGame() {
    document.querySelector('.btn-container').classList.add('hide')
    initGame()
}


function isVictory () {
	if (gBallsOnBoard === 0) {
		WIN_SOUND.play()
		gameOver()
	}
}


function gameOver() {
	gIsGameOn = false
	clearInterval(gIntervalBomb)
	clearInterval(gIntervalBall)
	clearInterval(gIntervalGlue)
	console.log('GAME OVER')

	var elContainer = document.querySelector('.btn-container')
	elContainer.classList.remove('hide')
}


function markCellsAround(i,j) {

	gGamerPos.i = i
	gGamerPos.j = j

	for (var i = gGamerPos.i - 1; i <= gGamerPos.i + 1; i++) {

        for (var j = gGamerPos.j - 1; j <= gGamerPos.j + 1; j++) {

            if (i === gGamerPos.i && j === gGamerPos.j) continue

			var markCell = getClassName({ i: i, j: j })
			var elBombCell = document.getElementsByClassName(markCell)[0]
			elBombCell.style.backgroundColor = "#800000"
		}
    }
}


// Move the player by keyboard arrows
function handleKey(event) {

	var i = gGamerPos.i
	var j = gGamerPos.j


	switch (event.key) {
		case 'ArrowLeft':
			if (j === 0) j = gBoard[0].length - 1
            else j--
			break

		case 'ArrowRight':
			if (j === gBoard[0].length - 1) j = 0
            else j++
			break

		case 'ArrowUp':
            if (i === 0) i = gBoard.length - 1
            else i--
			break

		case 'ArrowDown':
            if (i === gBoard.length - 1) i = 0
            else i++
			break
	}

    moveTo(i, j)
}


function getEmptyCells(){
	var emptyCells = []
    for (var i = 0; i < gBoard.length; i++) {

        for (var j = 0; j < gBoard[i].length; j++) {
			
            if (gBoard[i][j].gameElement === null && gBoard[i][j].type === FLOOR)
			emptyCells.push({ i, j })
        }
    }

    return emptyCells[getRandomInt(0, emptyCells.length)]
}