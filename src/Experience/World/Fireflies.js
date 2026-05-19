import * as THREE from "three/webgpu";
import {
  uniform,
  time,
  sin,
  cos,
  smoothstep,
  instanceIndex,
  uv,
  float,
} from "three/tsl";
import { Experience } from "../Experience";

// WebGPU points are fixed at 1px — use instanced billboard quads instead.

const DUMMY = new THREE.Object3D();

export class Fireflies {
  constructor() {
    this.experience = Experience.getInstance();
    this.scene = this.experience.scene;

    this.cfg = {
      count: 100,
      spreadX: 40,
      offsetX: 10,
      spreadZ: 15,
      offsetZ: -20,
      minY: 2,
      maxY: 3.5,
      size: 2.0,
      driftAmount: 1.0,
    };

    // Live uniforms (shader-side)
    this.uColor = uniform(new THREE.Color(1.0, 0.7, 0.4));
    this.uOpacity = uniform(0.0);
    this.uBlinkSlow = uniform(0.8);
    this.uBlinkFast = uniform(3.0);

    this._spawnPos = null;
    this._scales = null;

    this._build();
    this._initGui();
  }

  _build() {
    const { count, spreadX, offsetX, spreadZ, offsetZ, minY, maxY, size } = this.cfg;

    this._spawnPos = new Float32Array(count * 3);
    this._scales = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      this._spawnPos[i * 3 + 0] = (Math.random() - 0.5) * spreadX + offsetX;
      this._spawnPos[i * 3 + 1] = Math.random() * (maxY - minY) + minY;
      this._spawnPos[i * 3 + 2] = (Math.random() - 0.5) * spreadZ + offsetZ;
      this._scales[i] = Math.random();
    }

    // Per-instance phase via golden-ratio sequence — no extra buffer needed
    const uniquePhase = instanceIndex.toFloat().mul(0.618033988749895).fract().mul(Math.PI * 2);
    const fragTime = time.mul(0.5).add(uniquePhase);

    const slowBlink = sin(fragTime.mul(this.uBlinkSlow)).mul(0.5).add(0.5);
    const fastBlink = sin(fragTime.mul(this.uBlinkFast)).mul(0.5).add(0.5);
    const blink = smoothstep(0.3, 0.7, slowBlink.mul(fastBlink));

    // uv() on PlaneGeometry goes 0→1; center is 0.5,0.5
    const dist = uv().sub(0.5).length();
    const strength = float(0.05).div(dist.max(0.001)).sub(0.1).max(0);

    const material = new THREE.MeshBasicNodeMaterial({
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    material.colorNode = this.uColor;
    material.opacityNode = strength.mul(blink).mul(this.uOpacity);

    const geo = new THREE.PlaneGeometry(1, 1);
    this.mesh = new THREE.InstancedMesh(geo, material, count);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    // Initialise matrices so they aren't at origin
    for (let i = 0; i < count; i++) {
      DUMMY.position.set(
        this._spawnPos[i * 3],
        this._spawnPos[i * 3 + 1],
        this._spawnPos[i * 3 + 2],
      );
      DUMMY.scale.setScalar(this._scales[i] * size);
      DUMMY.updateMatrix();
      this.mesh.setMatrixAt(i, DUMMY.matrix);
    }
    this.mesh.instanceMatrix.needsUpdate = true;

    this.scene.add(this.mesh);
  }

  _rebuild() {
    if (this.mesh) {
      this.mesh.geometry.dispose();
      this.mesh.material.dispose();
      this.scene.remove(this.mesh);
    }
    this._build();
  }

  update() {
    if (!this.mesh) return;

    const { count, size, driftAmount } = this.cfg;
    const camera = this.experience.camera.instance;
    // Match TSL time node (seconds elapsed) × 0.5
    const t = performance.now() * 0.0005;

    for (let i = 0; i < count; i++) {
      const sx = this._spawnPos[i * 3];
      const sy = this._spawnPos[i * 3 + 1];
      const sz = this._spawnPos[i * 3 + 2];
      const s = this._scales[i];
      const uo = sx * 0.3 + sz * 0.7; // unique offset

      DUMMY.position.set(
        sx + Math.sin(t + uo) * s * 0.3 * driftAmount,
        sy + Math.cos(t * 0.5 + uo) * s * 0.15 * driftAmount,
        sz + Math.sin(t * 0.7 + uo) * s * 0.2 * driftAmount,
      );
      DUMMY.scale.setScalar(s * size);
      DUMMY.lookAt(camera.position); // billboard toward camera
      DUMMY.updateMatrix();
      this.mesh.setMatrixAt(i, DUMMY.matrix);
    }

    this.mesh.instanceMatrix.needsUpdate = true;
  }

  _initGui() {
    const folder = this.experience.gui.addFolder("Fireflies");

    // --- Geometry (rebuild on release) ---
    const geo = folder.addFolder("Spawn");
    geo.add(this.cfg, "count", 10, 500, 1).name("Count").onFinishChange(() => this._rebuild());
    geo.add(this.cfg, "spreadX", 1, 80, 1).name("Spread X").onFinishChange(() => this._rebuild());
    geo.add(this.cfg, "offsetX", -30, 30, 0.5).name("Offset X").onFinishChange(() => this._rebuild());
    geo.add(this.cfg, "spreadZ", 1, 40, 1).name("Spread Z").onFinishChange(() => this._rebuild());
    geo.add(this.cfg, "offsetZ", -60, 0, 0.5).name("Offset Z").onFinishChange(() => this._rebuild());
    geo.add(this.cfg, "minY", 0, 10, 0.1).name("Min Height").onFinishChange(() => this._rebuild());
    geo.add(this.cfg, "maxY", 0, 15, 0.1).name("Max Height").onFinishChange(() => this._rebuild());
    geo.close();

    // --- Live controls ---
    const proxy = {
      opacity: 0.0,
      size: this.cfg.size,
      drift: this.cfg.driftAmount,
      blinkSlow: 0.8,
      blinkFast: 3.0,
      color: "#ffb366",
    };

    folder.add(proxy, "opacity", 0, 1, 0.01).name("Opacity").onChange((v) => (this.uOpacity.value = v));
    folder.add(proxy, "size", 0.1, 10, 0.1).name("Size").onChange((v) => (this.cfg.size = v));
    folder.add(proxy, "drift", 0, 3, 0.01).name("Drift").onChange((v) => (this.cfg.driftAmount = v));
    folder.add(proxy, "blinkSlow", 0.05, 3, 0.01).name("Blink Slow").onChange((v) => (this.uBlinkSlow.value = v));
    folder.add(proxy, "blinkFast", 0.5, 10, 0.1).name("Blink Fast").onChange((v) => (this.uBlinkFast.value = v));
    folder.addColor(proxy, "color").name("Color").onChange((v) => this.uColor.value.set(v));

    folder.close();
  }

  destroy() {
    if (this.mesh) {
      this.mesh.geometry.dispose();
      this.mesh.material.dispose();
      this.scene.remove(this.mesh);
    }
  }
}
