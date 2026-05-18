import * as THREE from "three/webgpu";
import { Experience } from "../Experience";
import { Character } from "./Character";
import { Environment } from "./Environment";
import { Background } from "./Background";
import { Room } from "./Room";
import { Balloons } from "./Balloons";
import { Butterfly } from "./Butterfly";

export class World {
  constructor() {
    this.experience = Experience.getInstance();

    this.experience.resources.on("ready", () => {
      // this.character = new Character();
      // this.background = new Background();
      this.room = new Room();
      this.environment = new Environment(); // must come before Balloons (provides directionalLight)
      this.butterfly = new Butterfly();
      // this.balloons = new Balloons();
      // this.waterPlane = new WaterPlane();
      // this.experience.outline.apply(this.experience.scene);
    });

    this.init();
  }

  init() {}

  resize() {}

  update() {
    this.environment?.update();
    this.butterfly?.update();
    this.balloons?.update();
    this.test?.update();
    this.newTest?.update();
    this.rain?.update();
  }
}
