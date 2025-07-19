export class Piece {
  constructor(template, rotation, shape, x, y) {
    this.template = template;
    this.rotation = rotation;
    this.shape = shape;
    this.x = x;
    this.y = y;
  }

  static spawn(boardInstance, pieceTemplate) {
    const rotation = 0;
    const shape = pieceTemplate.rotations[rotation].map(row =>
      row.map(cell => (cell ? pieceTemplate.id : 0))
    );

    const x = Math.floor((boardInstance.width - shape[0].length) / 2);
    const y = 0;

    if (!boardInstance.isValidPosition(x, y, shape)) {
      return null;
    }

    return new Piece(pieceTemplate, rotation, shape, x, y);
  }
}
