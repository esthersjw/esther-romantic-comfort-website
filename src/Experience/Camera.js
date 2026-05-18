import * as THREE from "three/webgpu";
import { Experience } from "./Experience";
import { OrbitControls } from "three/examples/jsm/Addons.js";

export class Camera {
  constructor() {
    this.experience = Experience.getInstance();

    this.mousePositionStrength = 3;
    this.mouseRotationStrength = 0.05;
    this.basePosition = new THREE.Vector3(
      -1,
      2.3276204297380789,
      10.9035362538756501,
    );
    this.targetPosition = new THREE.Vector3();

    this.init();
    this.setOrbitControls();
    this.addGuiToggle();
  }

  init() {
    this.instance = new THREE.PerspectiveCamera(
      40,
      this.experience.sizes.aspect,
      0.1,
      1000,
    );

    this.instance.position.copy(this.basePosition);

    this.experience.scene.add(this.instance);
  }

  setOrbitControls() {
    this.controls = new OrbitControls(
      this.instance,
      this.experience.canvasElement,
    );
    this.controls.enableDamping = true;
    this.controls.target.set(0, 7.30654614930856, -0.9060611041720253);
    this.controls.enabled = false;

    // set rotation after OrbitControls constructor (which calls update() internally and overwrites rotation)
    this.instance.rotation.set(0, 0, 0);
  }

  addGuiToggle() {
    const folder = this.experience.gui.addFolder("Camera");
    folder.add(this.controls, "enabled").name("Orbit Controls");
  }

  resize() {
    this.instance.aspect = this.experience.sizes.aspect;
    this.instance.updateProjectionMatrix();
  }

  update() {
    if (this.controls.enabled) {
      this.controls.update();
      return;
    }

    const mouse = this.experience.mouse.instance;

    this.targetPosition.set(
      this.basePosition.x + mouse.x * this.mousePositionStrength,
      this.basePosition.y + mouse.y * this.mousePositionStrength,
      this.basePosition.z,
    );
    this.instance.position.lerp(this.targetPosition, 0.15);

    this.instance.rotation.x = THREE.MathUtils.lerp(
      this.instance.rotation.x,
      mouse.y * this.mouseRotationStrength,
      0.1,
    );
    this.instance.rotation.y = THREE.MathUtils.lerp(
      this.instance.rotation.y,
      -mouse.x * this.mouseRotationStrength,
      0.1,
    );
  }
}
