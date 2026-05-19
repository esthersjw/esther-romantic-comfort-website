import * as THREE from "three/webgpu";
import { Experience } from "../Experience";
import gsap from "gsap";
import { Howl } from "howler";

const PHOTOS_POS = { x: -10.818357, y: 8.656318, z: -10.226414 };

export class Raycaster {
  constructor() {
    this.experience = Experience.getInstance();
    this.cameraObj = this.experience.camera;
    this.camera = this.experience.camera.instance;
    this.canvas = this.experience.canvasElement;
    this.mouse = this.experience.mouse;

    this.raycaster = new THREE.Raycaster();
    this.meshes = [];
    this.inFocus = false;
    this.musicPlaying = false;

    this.backBtn = document.getElementById("back-btn");

    this.music = new Howl({
      src: ["/audio/music/Married_Life.mp3"],
      loop: true,
      volume: 0,
    });

    this.loadHitboxes();
    this.init();
  }

  loadHitboxes() {
    const model = this.experience.resources.items.hitboxes;
    this.experience.scene.add(model.scene);
    model.scene.traverse((child) => {
      if (child.isMesh) {
        child.material = child.material.clone();
        child.material.visible = false;
        this.meshes.push(child);
      }
    });
  }

  init() {
    const handleInteraction = (e) => {
      if (this.inFocus) return;

      if (e.type === "touchend") {
        const touch = e.changedTouches[0];
        this.mouse.instance.x = (touch.clientX / window.innerWidth) * 2 - 1;
        this.mouse.instance.y = -(touch.clientY / window.innerHeight) * 2 + 1;
      }

      this.raycaster.setFromCamera(this.mouse.instance, this.camera);
      const intersects = this.raycaster.intersectObjects(this.meshes);
      if (!intersects.length) return;

      const name = intersects[0].object.name;
      console.log(name);

      if (name === "Photos_Raycaster_Hitbox") this.goToPhotos();
      if (name === "Music_Raycaster_Hitbox") this.toggleMusic();
    };

    this.canvas.addEventListener("click", handleInteraction);
    this.canvas.addEventListener("touchend", handleInteraction);
    this.backBtn.addEventListener("click", () => this.goHome());
  }

  goToPhotos() {
    this.inFocus = true;
    this.cameraObj.locked = true;

    gsap.to(this.cameraObj.instance.position, {
      x: PHOTOS_POS.x,
      y: PHOTOS_POS.y,
      z: PHOTOS_POS.z,
      duration: 2,
      ease: "power2.inOut",
    });
    gsap.to(this.cameraObj.instance.rotation, {
      x: 0,
      y: 0,
      z: 0,
      duration: 2,
      ease: "power2.inOut",
      onComplete: () => {
        this.cameraObj.basePosition.set(PHOTOS_POS.x, PHOTOS_POS.y, PHOTOS_POS.z);
        this.cameraObj.mousePositionStrength = 0;
        this.cameraObj.mouseRotationStrength = 0;
        this.cameraObj.locked = false;
        this.backBtn.classList.add("back-btn--visible");
        gsap.to(this.cameraObj, {
          mousePositionStrength: 0.5,
          mouseRotationStrength: 0.01,
          duration: 0.6,
          ease: "power2.out",
        });
      },
    });
  }

  goHome() {
    this.cameraObj.locked = true;
    this.backBtn.classList.remove("back-btn--visible");

    const home = this.cameraObj.homePosition;

    gsap.to(this.cameraObj.instance.position, {
      x: home.x,
      y: home.y,
      z: home.z,
      duration: 2,
      ease: "power2.inOut",
    });
    gsap.to(this.cameraObj.instance.rotation, {
      x: 0,
      y: 0,
      z: 0,
      duration: 2,
      ease: "power2.inOut",
      onComplete: () => {
        this.cameraObj.basePosition.copy(home);
        this.cameraObj.mousePositionStrength = 0;
        this.cameraObj.mouseRotationStrength = 0;
        this.cameraObj.locked = false;
        this.inFocus = false;
        gsap.to(this.cameraObj, {
          mousePositionStrength: 3,
          mouseRotationStrength: 0.05,
          duration: 0.6,
          ease: "power2.out",
        });
      },
    });
  }

  toggleMusic() {
    const isNight = this.experience.world.room?.isNight ?? false;
    const targetVolume = isNight ? 0.25 : 1;

    if (this.musicPlaying) {
      this.musicPlaying = false;
      this.music.fade(this.music.volume(), 0, 1500);
      this.music.once("fade", () => {
        if (!this.musicPlaying) this.music.pause();
      });
    } else {
      this.musicPlaying = true;
      if (!this.music.playing()) {
        this.music.volume(0);
        this.music.play();
      }
      this.music.fade(this.music.volume(), targetVolume, 1500);
    }
  }

  setDayNightVolume(isNight) {
    if (!this.musicPlaying) return;
    const targetVolume = isNight ? 0.25 : 1;
    this.music.fade(this.music.volume(), targetVolume, 1500);
  }

  update() {
    if (this.inFocus) {
      document.body.style.cursor = "default";
      return;
    }

    this.raycaster.setFromCamera(this.mouse.instance, this.camera);
    const intersects = this.raycaster.intersectObjects(this.meshes);

    document.body.style.cursor = intersects.length ? "pointer" : "default";
  }
}
