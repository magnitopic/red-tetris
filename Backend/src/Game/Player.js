export class Player {
    constructor(userId, name = 'DefaultPlayer', socketId = null, room = null) {
        this.id = userId;
        this.socketId = socketId; // Current socket connection (changes on reconnect)
        this.name = name;
        this.room = room; // Room the player is currently in
    }
}
