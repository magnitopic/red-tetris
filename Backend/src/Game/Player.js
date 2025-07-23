export class Player {
  constructor(socketId, name = "DefaultPlayer", isHost = false) {
    this.id = socketId;
    this.name = name;
    this.room = null;
  }
}
