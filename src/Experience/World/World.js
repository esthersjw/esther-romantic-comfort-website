import * as THREE from "three/webgpu";
import { Experience } from "../Experience";
import { Character } from "./Character";
import { Environment } from "./Environment";
import { Background } from "./Background";
import { Room } from "./Room";
import { Balloons } from "./Balloons";
import { Butterfly } from "./Butterfly";
import { Fireflies } from "./Fireflies";

export class World {
  constructor() {
    this.experience = Experience.getInstance();

    this.experience.resources.on("ready", () => {
      // this.character = new Character();
      // this.background = new Background();
      this.room = new Room();
      this.environment = new Environment(); // must come before Balloons (provides directionalLight)
      this.butterflies = [
        new Butterfly(
          {
            x: -21.9,
            y: 2.2,
            z: -22,
            radiusX: 8,
            radiusZ: 2.8,
            heightVar: 0.4,
            flapSpeed: 20,
            scale: 1.4,
            phase: 0,
          },
          "Butterfly 1",
        ),
        new Butterfly(
          {
            x: 16.3,
            y: 0,
            z: -19,
            radiusX: 5.9,
            radiusZ: 2.8,
            heightVar: 1.4,
            flapSpeed: 20,
            scale: 1.4,
            phase: 2.1,
          },
          "Butterfly 2",
        ),
        new Butterfly(
          {
            x: -2,
            y: 10,
            z: -25,
            radiusX: 2,
            radiusZ: 2.8,
            heightVar: 0.4,
            flapSpeed: 20,
            scale: 1.4,
            phase: 4.2,
          },
          "Butterfly 3",
        ),
      ];
      this.fireflies = new Fireflies();
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
    this.butterflies?.forEach((b) => b.update());
    this.fireflies?.update();
    this.balloons?.update();
    this.test?.update();
    this.newTest?.update();
    this.rain?.update();
  }
}
