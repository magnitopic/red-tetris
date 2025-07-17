import { Piece } from "./Piece.js";
import { Board } from "./Board.js";

export default class Game {
  constructor(width = 10, height = 20, rng) {
    this.board = new Board(width, height);
    this.currentPiece = Piece.spawn(this.board);
    this.rng = rng;
    this.gameOver = false;
  }

  moveLeft() {
		if (this.gameOver || !this.currentPiece) return;

    const newX = this.currentPiece.x - 1;
    if (this.board.isValidPosition(newX, this.currentPiece.y, this.currentPiece.shape)) {
      this.currentPiece.x = newX;
    }
  }

  moveRight() {
		if (this.gameOver || !this.currentPiece) return;

    const newX = this.currentPiece.x + 1;
    if (this.board.isValidPosition(newX, this.currentPiece.y, this.currentPiece.shape)) {
      this.currentPiece.x = newX;
    }
  }

  drop() {
		if (this.gameOver || !this.currentPiece) return;

    const newY = this.currentPiece.y + 1;
    if (this.board.isValidPosition(this.currentPiece.x, newY, this.currentPiece.shape)) {
      this.currentPiece.y = newY;
    } else {
			// Lock piece
      this.board.lockPiece(this.currentPiece);

			// Spawn new piece
      this.currentPiece = Piece.spawn(this.board);

			// check if new spawn collides
      if (this.currentPiece === null) {
        this.gameOver = true;
        console.log("Game over!!!")
      }

    }
  }

  rotate() {
		if (this.gameOver || !this.currentPiece) return;

		const { template, rotation, x, y } = this.currentPiece;
		const nextRotation = (rotation + 1) % template.rotations.length;

		const newShape = template.rotations[nextRotation].map(row =>
			row.map(cell => (cell ? template.id : 0))
		);

		if (this.board.isValidPosition(x, y, newShape)) {
			this.currentPiece.rotation = nextRotation;
			this.currentPiece.shape = newShape;
		}
  }

  getState() {
    return {
      board: this.board.getState(),
      currentPiece: this.currentPiece,
      gameOver: this.gameOver
    };
  }
}
