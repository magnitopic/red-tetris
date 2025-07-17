import { isValidPosition, lockPiece } from "./MovementUtils.js";

export default class TetrisGame {
  constructor(width = 10, height = 20) {
    this.width = width;
    this.height = height;
    this.board = this.createEmptyBoard();
    this.currentPiece = this.spawnPiece();
    this.gameOver = false;
  }

  createEmptyBoard() {
    return Array.from({ length: 20 }, () => Array(10).fill(0));
  }

  spawnPiece() {
    // example: shape "----"
    return {
      shape: [[1, 1, 1, 1]],
      x: Math.floor(this.width / 2) - 2,
      y: 0
    };
  }

  getState() {
    return {
      board: this.board,
      currentPiece: this.currentPiece,
      gameOver: this.gameOver
    };
  }

  moveLeft() {
    const newX = this.currentPiece.x - 1;
    if (isValidPosition(this.board, newX, this.currentPiece.y, this.currentPiece.shape)) {
      this.currentPiece.x = newX;
    }
  }

  moveRight() {
    const newX = this.currentPiece.x + 1;
    if (isValidPosition(this.board, newX, this.currentPiece.y, this.currentPiece.shape)) {
      this.currentPiece.x = newX;
    }
  }

  drop() {
    const newY = this.currentPiece.y + 1;
    if (isValidPosition(this.board, this.currentPiece.x, newY, this.currentPiece.shape)) {
      this.currentPiece.y = newY;
    } else {
      this.board =  lockPiece(this.board, this.currentPiece);
      this.currentPiece = this.spawnPiece();

			// check if new spawn collides
			if (!isValidPosition(this.board, this.currentPiece.x, this.currentPiece.y, this.currentPiece.shape)) {
        this.gameOver = true;
      }
    }
  }

  rotate() {
    const rotatedShape = this.currentPiece.shape[0].map((_, i) =>
      this.currentPiece.shape.map(row => row[i]).reverse()
    );
    if (isValidPosition(this.board, this.currentPiece.x, this.currentPiece.y, rotatedShape)) {
      this.currentPiece.shape = rotatedShape;
    }
  }
}
