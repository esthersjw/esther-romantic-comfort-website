import * as THREE from "three/webgpu";
import { Experience } from "../Experience";
import gsap from "gsap";
import { Howl } from "howler";

const PHOTOS_POS = { x: -10.818357, y: 8.656318, z: -10.226414 };
const CALENDAR_POS = { x: 15.57131, y: 4.268601, z: -21.012699 };
const HOUSE_POS = { x: -1.271494, y: 3.436944, z: -13.345522 };
const HOUSE_ROT = { x: -0.264897, y: 0, z: 0 };
const HOUSE_DRAG_LIMIT = 7;
const HOUSE_DRAG_SENSITIVITY = 0.02;
const MESSAGES_POS = { x: 7.869, y: 8.3452, z: -23.766 };
const MESSAGES_ROT = { x: -Math.PI / 2, y: 0, z: -0.2426 };

let dragHintDismissed = false;

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

    this._houseDragOffset = 0;
    this._houseDragTargetX = HOUSE_POS.x;
    this._isDragging = false;
    this._inHouseMode = false;
    this._inMessagesMode = false;
    this._dragStartX = 0;
    this._dragStartY = 0;
    this._dragStartOffset = 0;
    this._attachmentMeshes = [];
    this._attachmentFlipState = {};
    this._wasDrag = false;
    this._hoveredAttachmentMesh = null;
    this._flipProxies = new Map();
    this._flipIndices = new Map();
    this._textsMesh = null;
    this._savedHouseDragX = null;

    this.backBtn = document.getElementById("back-btn");
    this._createDragHint();
    this._createHoverLabel();
    this._createMessagesBackBtn();
    this._currentHoveredName = null;

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

      this._currentHoveredName = null;
      this._hideHoverLabel();

      if (name === "Photos_Raycaster_Hitbox") this.goToPhotos();
      if (name === "Calendar_Raycaster_Hitbox") this.goToCalendar();
      if (name === "House_Raycaster_Hitbox") this.goToHouse();
      if (name === "Music_Raycaster_Hitbox") this.toggleMusic();
    };

    this.canvas.addEventListener("click", handleInteraction);
    this.canvas.addEventListener("touchend", handleInteraction);
    this.backBtn.addEventListener("click", () => this.goHome());
  }

  goToPhotos() {
    this.inFocus = true;
    this.cameraObj.locked = true;

    const dest = this.cameraObj.zoomedDestination(PHOTOS_POS);
    gsap.to(this.cameraObj.instance.position, {
      x: dest.x,
      y: dest.y,
      z: dest.z,
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
        this.cameraObj.basePosition.set(
          PHOTOS_POS.x,
          PHOTOS_POS.y,
          PHOTOS_POS.z,
        );
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

  goToCalendar() {
    this.inFocus = true;
    this.cameraObj.locked = true;

    const dest = this.cameraObj.zoomedDestination(CALENDAR_POS);
    gsap.to(this.cameraObj.instance.position, {
      x: dest.x,
      y: dest.y,
      z: dest.z,
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
        this.cameraObj.basePosition.set(
          CALENDAR_POS.x,
          CALENDAR_POS.y,
          CALENDAR_POS.z,
        );
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

  goToHouse() {
    this.inFocus = true;
    this.cameraObj.locked = true;

    const dest = this.cameraObj.zoomedDestination(HOUSE_POS, HOUSE_ROT.x, HOUSE_ROT.y, HOUSE_ROT.z);
    gsap.to(this.cameraObj.instance.position, {
      x: dest.x,
      y: dest.y,
      z: dest.z,
      duration: 2,
      ease: "power2.inOut",
    });
    gsap.to(this.cameraObj.instance.rotation, {
      x: HOUSE_ROT.x,
      y: HOUSE_ROT.y,
      z: HOUSE_ROT.z,
      duration: 2,
      ease: "power2.inOut",
      onComplete: () => {
        this.cameraObj.basePosition.set(HOUSE_POS.x, HOUSE_POS.y, HOUSE_POS.z);
        this.cameraObj.baseRotation.set(HOUSE_ROT.x, HOUSE_ROT.y, HOUSE_ROT.z);
        this.cameraObj.mousePositionStrength = 0;
        this.cameraObj.mouseRotationStrength = 0;
        this.cameraObj.locked = false;
        this.backBtn.classList.add("back-btn--visible");
        this.enableHouseDrag();
      },
    });
  }

  _createDragHint() {
    const style = document.createElement("style");
    style.textContent = `
      #house-drag-hint {
        position: fixed;
        bottom: 48px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        align-items: center;
        gap: 14px;
        color: rgba(255, 255, 255, 0.85);
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.5s ease;
        user-select: none;
      }
      #house-drag-hint.visible { opacity: 1; }
      #house-drag-hint .hint-arrow {
        font-size: 18px;
        opacity: 0.6;
      }
      #house-drag-hint .hint-icon {
        font-size: 22px;
        display: block;
        animation: hintSlide 1.6s ease-in-out infinite;
      }
      @keyframes hintSlide {
        0%, 100% { transform: translateX(-10px); }
        50%       { transform: translateX(10px); }
      }
    `;
    document.head.appendChild(style);

    this._dragHint = document.createElement("div");
    this._dragHint.id = "house-drag-hint";
    this._dragHint.innerHTML = `
      <span class="hint-arrow">←</span>
      <span class="hint-icon">✋</span>
      <span class="hint-arrow">→</span>
    `;
    document.body.appendChild(this._dragHint);
  }

  _createHoverLabel() {
    const style = document.createElement("style");
    style.textContent = `
      #hover-label {
        position: fixed;
        bottom: 32px;
        left: 50%;
        color: rgba(255, 255, 255, 0.9);
        font-size: 14px;
        font-family: inherit;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        pointer-events: none;
        user-select: none;
        white-space: nowrap;
        text-align: center;
      }
    `;
    document.head.appendChild(style);

    this._hoverLabel = document.createElement("div");
    this._hoverLabel.id = "hover-label";
    document.body.appendChild(this._hoverLabel);
    gsap.set(this._hoverLabel, { xPercent: -50, y: 12, opacity: 0 });
  }

  _createMessagesBackBtn() {
    this._messagesBackBtn = document.createElement("button");
    this._messagesBackBtn.className = "back-btn";
    this._messagesBackBtn.innerHTML = "&#8592; Back";
    document.body.appendChild(this._messagesBackBtn);
    this._messagesBackBtn.addEventListener("click", () => this.goBackToHouse());
  }

  _showHoverLabel(text) {
    this._hoverLabel.textContent = text;
    gsap.killTweensOf(this._hoverLabel);
    gsap.to(this._hoverLabel, {
      opacity: 1,
      y: 0,
      duration: 0.3,
      ease: "power2.out",
    });
  }

  _hideHoverLabel() {
    gsap.killTweensOf(this._hoverLabel);
    gsap.to(this._hoverLabel, {
      opacity: 0,
      y: 12,
      duration: 0.2,
      ease: "power2.in",
    });
  }

  enableHouseDrag() {
    this._inHouseMode = true;
    this._houseDragOffset = 0;
    this._wasDrag = false;

    this._attachmentMeshes = [];
    this._attachmentFlipState = {};
    this._hoveredAttachmentMesh = null;
    this._flipProxies = new Map();
    this._flipIndices = new Map();
    const roomScene = this.experience.world.room?.model;
    if (roomScene) {
      roomScene.traverse((child) => {
        if (
          child.isMesh &&
          (child.name === "Ninth_Attachment_John" ||
            child.name === "Ninth_Attachment_Patricia")
        ) {
          this._attachmentMeshes.push(child);
          const flipIdx = child.morphTargetDictionary?.["Flip"];
          const proxy = { value: 0 };
          this._flipProxies.set(child, proxy);
          this._flipIndices.set(child, flipIdx);
          if (flipIdx !== undefined) child.morphTargetInfluences[flipIdx] = 0;
          this._attachmentFlipState[child.name] = false;
        }
        if (child.isMesh && child.name === "Ninth_Attachment_Texts") {
          this._textsMesh = child;
        }
      });
    }

    if (!dragHintDismissed) this._dragHint.classList.add("visible");

    this._onDragStart = (e) => {
      if (!dragHintDismissed) {
        dragHintDismissed = true;
        this._dragHint.classList.remove("visible");
      }
      this._wasDrag = false;
      this._isDragging = true;
      this._dragStartX = e.clientX;
      this._dragStartY = e.clientY;
      this._dragStartOffset = this.cameraObj.basePosition.x;
      this.canvas.setPointerCapture(e.pointerId);
    };

    this._onDragMove = (e) => {
      if (!this._isDragging) return;
      const delta = (e.clientX - this._dragStartX) * HOUSE_DRAG_SENSITIVITY;
      this._houseDragTargetX = Math.max(
        HOUSE_POS.x - HOUSE_DRAG_LIMIT,
        Math.min(HOUSE_POS.x + HOUSE_DRAG_LIMIT, this._dragStartOffset - delta),
      );
    };

    this._onDragEnd = (e) => {
      const dx = e.clientX - this._dragStartX;
      const dy = e.clientY - this._dragStartY;
      this._wasDrag = Math.sqrt(dx * dx + dy * dy) > 8;
      this._isDragging = false;
    };

    this._onDragCancel = () => {
      this._wasDrag = true;
      this._isDragging = false;
    };

    this._onHouseClick = (e) => {
      if (this._wasDrag || this._inMessagesMode) return;
      const mouse = new THREE.Vector2(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1,
      );
      this.raycaster.setFromCamera(mouse, this.camera);
      if (this._textsMesh) {
        const textsHit = this.raycaster.intersectObject(this._textsMesh);
        if (textsHit.length) {
          this.goToMessages();
          return;
        }
      }
      if (!this._attachmentMeshes.length) return;
      const hits = this.raycaster.intersectObjects(this._attachmentMeshes);
      if (hits.length) this._toggleAttachmentFlip(hits[0].object);
    };

    this.canvas.addEventListener("pointerdown", this._onDragStart);
    this.canvas.addEventListener("pointermove", this._onDragMove);
    this.canvas.addEventListener("pointerup", this._onDragEnd);
    this.canvas.addEventListener("pointercancel", this._onDragCancel);
    this.canvas.addEventListener("click", this._onHouseClick);
  }

  _toggleAttachmentFlip(mesh) {
    const isFlipped = this._attachmentFlipState[mesh.name];
    this._attachmentFlipState[mesh.name] = !isFlipped;
    const targetValue = isFlipped
      ? (this._hoveredAttachmentMesh === mesh ? 0.1 : 0)
      : 1.0;
    this._animateFlip(mesh, targetValue);
  }

  _animateFlip(mesh, targetValue) {
    const proxy = this._flipProxies.get(mesh);
    const flipIdx = this._flipIndices.get(mesh);
    if (!proxy || flipIdx === undefined) return;
    gsap.killTweensOf(proxy);
    gsap.to(proxy, {
      value: targetValue,
      duration: 0.4,
      ease: "power2.inOut",
      onUpdate: () => {
        mesh.morphTargetInfluences[flipIdx] = proxy.value;
      },
    });
  }

  disableHouseDrag() {
    this.canvas.removeEventListener("pointerdown", this._onDragStart);
    this.canvas.removeEventListener("pointermove", this._onDragMove);
    this.canvas.removeEventListener("pointerup", this._onDragEnd);
    this.canvas.removeEventListener("pointercancel", this._onDragCancel);
    this.canvas.removeEventListener("click", this._onHouseClick);
    this._isDragging = false;
    this._inHouseMode = false;
    this._houseDragTargetX = HOUSE_POS.x;
    this._dragHint.classList.remove("visible");
    this._attachmentMeshes = [];
    this._attachmentFlipState = {};
    this._hoveredAttachmentMesh = null;
    this._flipProxies = new Map();
    this._flipIndices = new Map();
    this._textsMesh = null;
  }

  goToMessages() {
    this._savedHouseDragX = this._houseDragTargetX;
    this._inHouseMode = false;
    this._inMessagesMode = true;
    this.cameraObj.locked = true;

    const dest = this.cameraObj.zoomedDestination(MESSAGES_POS, MESSAGES_ROT.x, MESSAGES_ROT.y, MESSAGES_ROT.z);
    gsap.to(this.cameraObj.instance.position, {
      x: dest.x,
      y: dest.y,
      z: dest.z,
      duration: 2,
      ease: "power2.inOut",
    });
    gsap.to(this.cameraObj.instance.rotation, {
      x: MESSAGES_ROT.x,
      y: MESSAGES_ROT.y,
      z: MESSAGES_ROT.z,
      duration: 2,
      ease: "power2.inOut",
      onComplete: () => {
        this.cameraObj.basePosition.set(MESSAGES_POS.x, MESSAGES_POS.y, MESSAGES_POS.z);
        this.cameraObj.baseRotation.set(MESSAGES_ROT.x, MESSAGES_ROT.y, MESSAGES_ROT.z);
        this.cameraObj.mousePositionStrength = 0;
        this.cameraObj.mouseRotationStrength = 0;
        this.cameraObj.locked = false;
        this.backBtn.classList.remove("back-btn--visible");
        this._messagesBackBtn.classList.add("back-btn--visible");
      },
    });
  }

  goBackToHouse() {
    this._inMessagesMode = false;
    this.cameraObj.locked = true;
    this._messagesBackBtn.classList.remove("back-btn--visible");

    const restoreX = this._savedHouseDragX ?? HOUSE_POS.x;
    this._houseDragTargetX = restoreX;
    const restorePos = { x: restoreX, y: HOUSE_POS.y, z: HOUSE_POS.z };
    const dest = this.cameraObj.zoomedDestination(restorePos, HOUSE_ROT.x, HOUSE_ROT.y, HOUSE_ROT.z);

    gsap.to(this.cameraObj.instance.position, {
      x: dest.x,
      y: dest.y,
      z: dest.z,
      duration: 2,
      ease: "power2.inOut",
    });
    gsap.to(this.cameraObj.instance.rotation, {
      x: HOUSE_ROT.x,
      y: HOUSE_ROT.y,
      z: HOUSE_ROT.z,
      duration: 2,
      ease: "power2.inOut",
      onComplete: () => {
        this.cameraObj.basePosition.set(restoreX, HOUSE_POS.y, HOUSE_POS.z);
        this.cameraObj.baseRotation.set(HOUSE_ROT.x, HOUSE_ROT.y, HOUSE_ROT.z);
        this.cameraObj.mousePositionStrength = 0;
        this.cameraObj.mouseRotationStrength = 0;
        this.cameraObj.locked = false;
        this._inHouseMode = true;
        this.backBtn.classList.add("back-btn--visible");
      },
    });
  }

  goHome() {
    if (this._inMessagesMode) {
      this._inMessagesMode = false;
      this._messagesBackBtn.classList.remove("back-btn--visible");
    }
    this.disableHouseDrag();
    this.cameraObj.locked = true;
    this.backBtn.classList.remove("back-btn--visible");

    const home = this.cameraObj.homePosition;

    const dest = this.cameraObj.zoomedDestination(home);
    gsap.to(this.cameraObj.instance.position, {
      x: dest.x,
      y: dest.y,
      z: dest.z,
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
        this.cameraObj.baseRotation.set(0, 0, 0);
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
    if (this._inHouseMode) {
      this.cameraObj.basePosition.x = THREE.MathUtils.lerp(
        this.cameraObj.basePosition.x,
        this._houseDragTargetX,
        0.08,
      );
    }

    if (this.inFocus) {
      if (this._inHouseMode) {
        this.raycaster.setFromCamera(this.mouse.instance, this.camera);
        const attachHits = this.raycaster.intersectObjects(this._attachmentMeshes);
        const hovered = attachHits.length ? attachHits[0].object : null;

        if (hovered !== this._hoveredAttachmentMesh) {
          if (this._hoveredAttachmentMesh && !this._attachmentFlipState[this._hoveredAttachmentMesh.name]) {
            this._animateFlip(this._hoveredAttachmentMesh, 0);
          }
          if (hovered && !this._attachmentFlipState[hovered.name]) {
            this._animateFlip(hovered, 0.1);
          }
          this._hoveredAttachmentMesh = hovered;
        }

        let hoveredTexts = false;
        if (this._textsMesh) {
          const textsHit = this.raycaster.intersectObject(this._textsMesh);
          hoveredTexts = textsHit.length > 0;
        }

        document.body.style.cursor = (hovered || hoveredTexts)
          ? "pointer"
          : this._isDragging ? "grabbing" : "grab";
      } else {
        document.body.style.cursor = "default";
      }
      return;
    }

    this.raycaster.setFromCamera(this.mouse.instance, this.camera);
    const intersects = this.raycaster.intersectObjects(this.meshes);

    document.body.style.cursor = intersects.length ? "pointer" : "default";

    const hoverName = intersects.length ? intersects[0].object.name : null;
    if (hoverName !== this._currentHoveredName) {
      this._currentHoveredName = hoverName;
      const labels = {
        Photos_Raycaster_Hitbox: "Photos",
        Calendar_Raycaster_Hitbox: "Needs Calendar",
        House_Raycaster_Hitbox: "Learning Attachment Styles",
      };
      const text = hoverName ? labels[hoverName] : null;
      if (text) this._showHoverLabel(text);
      else this._hideHoverLabel();
    }
  }
}
