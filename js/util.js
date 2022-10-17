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
    for (var i = 1; i < 9; i++) {

        for (var j = 1; j < 11; j++) {
            if (gBoard[i][j].gameElement === null) emptyCells.push({ i, j })
        }
    }

    return emptyCells
}


// Returns the class name for a specific cell
function getClassName(location) {
	var cellClass = 'cell-' + location.i + '-' + location.j
	return cellClass
}


function getRandomIntInt(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1) + min)
}


function createMat(ROWS, COLS) {
    var mat = []

    for (var i = 0; i < ROWS; i++) {
        var row = []

        for (var j = 0; j < COLS; j++) {
            row.push('')
        }

        mat.push(row)
    }

    return mat
}