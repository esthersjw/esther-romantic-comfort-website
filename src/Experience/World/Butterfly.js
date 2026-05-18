import * as THREE from "three/webgpu";
import { texture, uv, vec2 } from "three/tsl";
import { Experience } from "../Experience";

const WING_W = 0.5;
const WING_H = 0.38;
const FLAP_SPEED = 20;
const FLAP_RANGE = Math.PI * 0.4;

export class Butterfly {
  constructor() {
    this.experience = Experience.getInstance();
    this.scene = this.experience.scene;
    this._angle = 0;

    // Outer group: position + Y travel rotation
    this.group = new THREE.Group();
    // Inner group: X tilt only — kept separate so Y rotation doesn't fight it
    this._tiltGroup = new THREE.Group();
    this._tiltGroup.rotation.x = 0.3; // nose-down pitch so top of wings faces camera
    this.group.add(this._tiltGroup);
    this.scene.add(this.group);

    this._init();
  }

  _init() {
    const wingTex = this.experience.resources.items.butterflyWingTexture;
    wingTex.colorSpace = THREE.SRGBColorSpace;
    wingTex.generateMipmaps = false;
    wingTex.minFilter = THREE.LinearFilter;
    wingTex.needsUpdate = true;

    // Right wing — horizontal (XZ plane), hinge at x=0, extends right, U-mirrored so root lands at hinge
    const rightGeo = new THREE.PlaneGeometry(WING_W, WING_H);
    rightGeo.rotateX(-Math.PI / 2); // lay flat so flapping is visible from above/front
    rightGeo.translate(WING_W / 2, 0, 0);

    const rightMat = new THREE.MeshBasicNodeMaterial({
      transparent: true,
      alphaTest: 0.1,
      side: THREE.DoubleSide,
    });
    const mirrorUV = vec2(uv().x.oneMinus(), uv().y);
    const rightSample = texture(wingTex, mirrorUV);
    rightMat.colorNode = rightSample.rgb;
    rightMat.opacityNode = rightSample.a;

    this._rightPivot = new THREE.Object3D();
    this._rightPivot.add(new THREE.Mesh(rightGeo, rightMat));

    // Left wing — horizontal (XZ plane), hinge at x=0, extends left, raw UV
    const leftGeo = new THREE.PlaneGeometry(WING_W, WING_H);
    leftGeo.rotateX(-Math.PI / 2);
    leftGeo.translate(-WING_W / 2, 0, 0);

    const leftMat = new THREE.MeshBasicNodeMaterial({
      transparent: true,
      alphaTest: 0.1,
      side: THREE.DoubleSide,
    });
    const leftSample = texture(wingTex, uv());
    leftMat.colorNode = leftSample.rgb;
    leftMat.opacityNode = leftSample.a;

    this._leftPivot = new THREE.Object3D();
    this._leftPivot.add(new THREE.Mesh(leftGeo, leftMat));

    this._tiltGroup.add(this._rightPivot);
    this._tiltGroup.add(this._leftPivot);

    this.group.position.set(0, 2.2, -22);
  }

  update() {
    const t = this.experience.time.elapsed * 0.001;

    // Wing flap — both tips go up/down together
    const flapAngle = Math.sin(t * FLAP_SPEED) * FLAP_RANGE;
    this._rightPivot.rotation.z = flapAngle;
    this._leftPivot.rotation.z = -flapAngle;

    // Wandering path
    this.group.position.x = Math.sin(t * 0.31) * 2.0;
    this.group.position.y = 2.2 + Math.sin(t * 0.53) * 0.4 + Math.cos(t * 0.79) * 0.12;
    this.group.position.z = -22 + Math.cos(t * 0.19) * 2.8 + Math.sin(t * 0.67) * 1.0;

    // Smoothed Y rotation toward travel direction (prevents ±π jitter)
    const vx = Math.cos(t * 0.31) * 0.31 * 2.0;
    const vz = -Math.sin(t * 0.19) * 0.19 * 2.8 + Math.cos(t * 0.67) * 0.67;
    if (Math.abs(vx) + Math.abs(vz) > 0.01) {
      const target = Math.atan2(vx, vz) + Math.PI;
      let diff = target - this._angle;
      if (diff > Math.PI) diff -= Math.PI * 2;
      if (diff < -Math.PI) diff += Math.PI * 2;
      this._angle += diff * 0.08;
      this.group.rotation.y = this._angle;
    }
  }

  destroy() {
    this.scene.remove(this.group);
  }
}
