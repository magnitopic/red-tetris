export default class TetrisGame {
  constructor() {
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
      x: 0,
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
    this.currentPiece.x -= 1;
  }

  moveRight() {
    this.currentPiece.x += 1;
  }

  rotate() {
    this.currentPiece.shape = this.currentPiece.shape[0].map((_, i) =>
      this.currentPiece.shape.map(row => row[i]).reverse()
    );
  }

  drop() {
    this.currentPiece.y += 1;
  }
}
