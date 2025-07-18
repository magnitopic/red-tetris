import { Piece } from "./Piece.js";
import { Board } from "./Board.js";

export default class Game {
  constructor(width = 10, height = 22, rng, onStateChange) {
    this.board = new Board(width, height);
    this.currentPiece = Piece.spawn(this.board);
    this.rng = rng;
    this.gameOver = false;
    this.onStateChange = onStateChange;
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

  softDrop() {
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
    this.onStateChange?.();
  }

  async hardDrop() {
    if (this.gameOver || !this.currentPiece) return;

    while (true) {
      if (!this.currentPiece) return; 
      const newY = this.currentPiece.y + 1;

      if (this.board.isValidPosition(this.currentPiece.x, newY, this.currentPiece.shape)) {
        this.currentPiece.y = newY;

        await new Promise(resolve => setTimeout(resolve, 40)); // 40 ms
        this.onStateChange?.();

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
        break;
      }
      //await new Promise(resolve => setTimeout(resolve, 30));
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

  startGravity(speed = 500) {
  if (this.gravityInterval) return;

  this.gravityInterval = setInterval(() => {
    if (!this.gameOver) {
      this.softDrop();
    } else {
      clearInterval(this.gravityInterval);
    }
  }, speed);
}

  getState() {
    return {
      board: this.board.getState(),
      currentPiece: this.currentPiece,
      gameOver: this.gameOver
      
    };
  }
}
