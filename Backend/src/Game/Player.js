export class Player {
  constructor(socketId, name = "DefaultPlayer") {
    this.id = socketId;
    this.name = name;
    this.room = null;
  }
}
