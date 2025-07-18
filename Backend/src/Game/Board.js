export class Board {
	constructor(width = 10, height = 22) {
		this.width = width;
		this.height = height;
		this.grid = this.createEmptyBoard();
	}

	createEmptyBoard() {
    return Array.from({ length: this.height}, () => Array(this.width).fill(0));
  }

	reset() {
    this.grid = this.createEmptyBoard();
  }

  isValidPosition(x, y, shape) {
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col] !== 0) {
          const boardX = x + col;
          const boardY = y + row;

          if (boardX < 0 || boardX >= this.width || boardY >= this.height) 
            return false;
          if (boardY >= 0 && this.grid[boardY][boardX] !== 0)
            return false;
        }
      }
    }
    return true;
  }

  lockPiece(piece) {
    const { shape, x: posX, y: posY } = piece;

    shape.forEach((row, dy) => {
      row.forEach((cell, dx) => {
        if (cell) {
          const y = posY + dy;
          const x = posX + dx;

          if (y >= 0 && y < this.height &&
            	x >= 0 && x < this.width) 
					{
            this.grid[y][x] = cell;
          }
        }
      });
    });
    // Clean possible complete lines
    return this.clearLines();
  }

  clearLines() {
    let linesCleared = 0;

    for (let y = this.height - 1; y >= 0; y--) {
      if (this.grid[y].every(cell => cell !== 0)) {
        // Clean complete lines
        this.grid.splice(y, 1);

        // New empty line on top
        this.grid.unshift(new Array(this.width).fill(0));
        linesCleared++;
        y++;
      }
    }
    return linesCleared;
  }

  getState() {
    return this.grid;
  }
}


