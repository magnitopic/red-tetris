import { isValidPosition, lockPiece, spawnPiece } from "./MovementUtils.js";

export default class TetrisGame {
  constructor(width = 10, height = 20) {
    this.width = width;
    this.height = height;
    this.board = this.createEmptyBoard();
    this.currentPiece = spawnPiece(this.board, this.width);
    this.gameOver = false;
  }

  createEmptyBoard() {
    return Array.from({ length: this.height }, () => Array(this.width).fill(0));
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
			// Lock piece
      this.board =  lockPiece(this.board, this.currentPiece);

			// Spawn new piece
      this.currentPiece = spawnPiece(this.board, this.width);

			// check if new spawn collides
      if (this.currentPiece === null) {
        this.gameOver = true;
      }

    }
  }

  rotate() {
    if (!this.currentPiece)	
			return;

		const { template, rotation, x, y } = this.currentPiece;
		const nextRotation = (rotation + 1) % template.rotations.length;

		const newShape = template.rotations[nextRotation].map(row =>
			row.map(cell => (cell ? template.id : 0))
		);

		if (isValidPosition(this.board, x, y, newShape)) {
			this.currentPiece.rotation = nextRotation;
			this.currentPiece.shape = newShape;
		}
  }
}
