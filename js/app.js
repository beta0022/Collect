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

    gIntervalBall = setInterval(newBall, 3000)
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

			// TODO - change to short if statement
			// if (currCell.type === FLOOR) cellClass += ' floor';
			// else if (currCell.type === WALL) cellClass += ' wall';
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


function newBall() {
    var emptyCells = getEmptyCells()
    var pos = emptyCells[getRandomIntInt(0, emptyCells.length - 1)]
    gBoard[pos.i][pos.j].gameElement = BALL
    renderCell(pos, BALL_IMG)

    gBallsOnBoard++
}


function addGlue() {
    var emptyCells = getEmptyCells()
    var pos = emptyCells[getRandomIntInt(0, emptyCells.length - 1)]

	if (!pos) return
	
    gBoard[pos.i][pos.j].gameElement = GLUE
    renderCell(pos, GLUE_IMG)

	setTimeout(() => {
		if(gBoard[pos.i][pos.j].gameElement === GLUE){
			gBoard[pos.i][pos.j].gameElement = null
			renderCell(pos, '')
		}
	}, 3000)
}


function addBomb() {
    var emptyCells = getEmptyCells()
    var pos = emptyCells[getRandomIntInt(0, emptyCells.length - 1)]

	if (!pos) return

    gBoard[pos.i][pos.j].gameElement = BOMB
    renderCell(pos, BOMB_IMG)

	setTimeout(() => {
		if(gBoard[pos.i][pos.j].gameElement === BOMB){
			gBoard[pos.i][pos.j].gameElement = null
			renderCell(pos, '')
		}
	}, 5000)
}


// Move the player to a specific location
function moveTo(i, j) {
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
			setPosition(i, j)
			gameOver()
		}

		if (targetCell.gameElement === BALL) {
			COLLECT_SOUND.play()
			console.log('COLLECTING')
			gBallsCollectedCounter++
			gBallsOnBoard--
			document.querySelector('h2 span').innerText = gBallsCollectedCounter

			if (gBallsOnBoard === 0) {
				WIN_SOUND.play()
				gameOver()
			}

		}

		if (targetCell.gameElement === GLUE) {
			GLUE_SOUND.play()
			gIsGlue = true
			console.log('GLUED')
			setTimeout(() => gIsGlue = false, 3000)
		}

		setPosition(i, j)

	} else console.log('TOO FAR')
}


// MOVING from current position
function setPosition(i, j) {
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


function gameOver() {
	gIsGameOn = false
	clearInterval(gIntervalBomb)
	clearInterval(gIntervalBall)
	clearInterval(gIntervalGlue)
	console.log('GAME OVER')

	var elContainer = document.querySelector('.btn-container')
	elContainer.classList.remove('hide')

	if (gIsBomb) {

		for (var i = 0; i < gBoard.length; i++) {
			var releativePositionI = gGamerPos.i - i
	
			if (Math.abs(releativePositionI) <= 1) {
	
				for (var j = 0; j < gBoard[i].length; j++) {
	
					if (gGamerPos.i === i && gGamerPos.j === j) continue
	
					var releativePositionJ = gGamerPos.j - j
	
					if (Math.abs(releativePositionJ) <= 1) {
	
						var bombedCellClassName = "cell-" + i + "-" + j;
						var bombedCell = document.getElementsByClassName(bombedCellClassName)[0]
						bombedCell.style.backgroundColor = "#800000"
					}
				}
			}
		}
	}
}