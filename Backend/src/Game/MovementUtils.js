import { TETROMINOES } from "./Tetrominoes.js";

export function isValidPosition(board, x, y, shape) {
  const width = board[0].length;
  const height = board.length;

  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (shape[row][col] !== 0) {
        const boardX = x + col;
        const boardY = y + row;

        if (boardX < 0 || boardX >= width || 
            boardY < 0 || boardY >= height) 
        {
          return false; // Board Collision
        } else if (board[boardY][boardX] !== 0) {
          return false; // Piece Collision
        }
      }
    }
  }
  return true;
};

export function lockPiece(board, piece) {
  const { shape, x: posX, y: posY } = piece;
  const newBoard = board.map(row => [...row]);

  shape.forEach((row, dy) => {
    row.forEach((cell, dx) => {
      if (cell) {
        const y = posY + dy;
        const x = posX + dx;
        if (y >= 0 && y < newBoard.length &&
            x >= 0 && x < newBoard[0].length
        ) {
          newBoard[y][x] = cell;
        }
      }
    });
  });

  return newBoard;
}

export function spawnPiece(board, width) {
  const randomIndex = Math.floor(Math.random() * TETROMINOES.length);
  const pieceTemplate = TETROMINOES[randomIndex];

  const rotation = 0;
  const shape = pieceTemplate.rotations[rotation].map(row =>
    row.map(cell => (cell ? pieceTemplate.id : 0))
  );

  const x = Math.floor((width - shape[0].length) / 2);
  const y = 0;

  if (!isValidPosition(board, x, y, shape)) {
    return null;
  }

  return {
    template: pieceTemplate,
    rotation,
    shape,
    x,
    y,
  };
}