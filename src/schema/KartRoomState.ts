import { Schema, type, MapSchema } from "@colyseus/schema";

export interface Appearance{
  hat: string;
  hair: string;
  dress: string;
  gloves: string;
  pants: string;
  shoes: string;
}

export class PlayerState extends Schema {
  @type("number") x: number = 0; // x position
  @type("number") y: number = 0; // y position
  @type("number") z: number = 0; // z position
  @type("number") rotX: number = 0; // x rotation
  @type("number") rotY: number = 0; // y rotation
  @type("number") rotZ: number = 0; // z rotation
  @type("number") rotW: number = 0; // w rotation
  @type("string") name = "Unknown"; // player name
  @type("string") hat: string="default";
  @type("string") hair: string="default";
  @type("string") dress: string="default";
  @type("string") gloves: string="default";
  @type("string") pants: string="default";
  @type("string") shoes: string="default";
  @type("boolean") ready: boolean = false;
  @type("boolean") isMapLoaded: boolean = false;
  @type("boolean") finished: boolean = false;
  @type("number") finishTime: number = 0;
  @type("number") score: number = 0;
  @type("string") address: string = '';
}

export class KartRoomState extends Schema {
  @type({ map: PlayerState })
  players: MapSchema<PlayerState> = new MapSchema<PlayerState>();

  @type("string") status: string = "waiting"; // waiting, playing, finished
  @type("number") startTime: number = 0;
  @type("number") finishedCount: number = 0;

  createPlayer(address:string, sessionId: string, name: string, appearance: Appearance) {
    const player = new PlayerState();
    player.name = name;
    
    player.hat = appearance.hat
    player.hair = appearance.hair
    player.dress = appearance.dress
    player.gloves = appearance.gloves
    player.pants = appearance.pants
    player.shoes = appearance.shoes

    player.address = address;
    this.players.set(sessionId, player);
  }

  removePlayer(sessionId: string) {
    this.players.delete(sessionId);
  }

  movePlayer(sessionId: string, movement: any) {
    const player = this.players.get(sessionId);
    if (player) {
      player.x = movement.x;
      player.y = movement.y;
      player.z = movement.z;

      player.rotX = movement.rotX;
      player.rotY = movement.rotY;
      player.rotZ = movement.rotZ;
      player.rotW = movement.rotW;

      // this.players.set(sessionId, player);
    }
  }

  setPlayerReady(sessionId: string) {
    const player = this.players.get(sessionId);
    if (player) {
      player.ready = true;
    }
  }

  setPlayerMapLoaded(sessionId: string){
    const player = this.players.get(sessionId);
    if (player) {
      player.isMapLoaded = true;
    }
  }

  allPlayersReady(maxClients: number) {
    const players = Array.from(this.players.values());
    return players.length === maxClients && players.every(player => player.ready);
  }

  allPlayersMapLoaded(maxClients: number){    
    const players = Array.from(this.players.values());
    console.log("players", players);
    return players.length === maxClients && players.every(player => player.isMapLoaded);
  }

  playerFinished(sessionId: string) {
    const player = this.players.get(sessionId);
    if (player && !player.finished) {
      player.finished = true;
      player.finishTime = Date.now() - this.startTime;
      this.finishedCount++;

      // Assign scores based on finish order
      switch (this.finishedCount) {
        case 1: player.score = 10; break;
        case 2: player.score = 8; break;
        case 3: player.score = 6; break;
        case 4: player.score = 5; break;
      }
    }
  }
}
