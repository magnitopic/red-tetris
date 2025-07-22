import { Piece } from "./Piece.js";
import { Board } from "./Board.js";
import { TETROMINOES } from "./Tetrominoes.js";

export default class Game {
  constructor(width = 10, height = 22, onStateChange, OnGameOver, gameRoom, userId, socketId) {
    this.board = new Board(width, height);
    this.gameRoom = gameRoom;
    this.gameOver = false;
    this.onStateChange = onStateChange;
    this.OnGameOver = OnGameOver;
    this.userId = userId;
    this.socketId = socketId
    
    if (!this.gameRoom.pieceQueue) this.gameRoom.pieceQueue = [];
    this.pieceIndex = 0;
    this.currentPiece = this.spawnNextPiece();
  }

  getPieceTemplateById(piece) {
    return TETROMINOES.find(t => t.name === piece);
  }

  spawnNextPiece() {
    if (this.pieceIndex >= this.gameRoom.pieceQueue.length - 7) {
      const pieces = TETROMINOES.map(t => t.name);
      const bag = [...pieces];
      const rng = this.gameRoom.rng;

      for (let i = bag.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [bag[i], bag[j]] = [bag[j], bag[i]];
      }
      this.gameRoom.pieceQueue.push(...bag);
    }

    const pieceId = this.gameRoom.pieceQueue[this.pieceIndex];
    this.pieceIndex++;

    const pieceTemplate = this.getPieceTemplateById(pieceId);
    if (!pieceTemplate) {
      console.error("Error: undefined piece", pieceId);
      return null;
    }

    return Piece.spawn(this.board, pieceTemplate);
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
      const clearedLines = this.board.lockPiece(this.currentPiece);

      if (clearedLines > 0) {
        this.sendGarbageToOthers(clearedLines);
      }

			// Spawn new piece
      this.currentPiece = this.spawnNextPiece();

			// check if new spawn collides
      if (this.currentPiece === null) {
        this.gameOver = true;
        console.log("Game over!!!")
        this.OnGameOver?.(this.userId);
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

        await new Promise(resolve => setTimeout(resolve, 5)); // 5 ms
        this.onStateChange?.();

      } else {
        // Lock piece
        const clearedLines = this.board.lockPiece(this.currentPiece);

        if (clearedLines > 0) {
          this.sendGarbageToOthers(clearedLines);
        }
        
        // Spawn new piece
        this.currentPiece = this.spawnNextPiece();
        
        // check if new spawn collides
        if (this.currentPiece === null) {
          this.gameOver = true;
          console.log("Game over!!!")
          this.OnGameOver?.(this.userId);
        }
        break;
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

  sendGarbageToOthers(linesCleared) {
    const penaltyLines = linesCleared - 1;
    if (penaltyLines <= 0) return;

    for (const [playerId, otherGame] of this.gameRoom.playerGames.entries()) {
      if (otherGame === this) continue;
      otherGame.board.addGarbageLines(penaltyLines);
      // Send socket-state to other players
      this.gameRoom.io.to(otherGame.socketId).emit("game_state", otherGame.getState()); 
      otherGame.onStateChange?.();
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
