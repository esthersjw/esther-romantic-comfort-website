import * as THREE from "three/webgpu";
import {
  texture,
  uv,
  positionWorld,
  vec2,
  vec3,
  vec4,
  select,
  uniform,
  time,
  mx_noise_float,
  mix,
} from "three/tsl";
import gsap from "gsap";
import { Experience } from "../Experience";
import {
  spotProjectionMatrixUniform,
  spotProjectionMatrixUniform2,
  spotProjectionMatrixUniform3,
} from "./Environment";

export class Room {
  constructor() {
    this.experience = Experience.getInstance();
    this.model = this.experience.resources.items.room.scene;
    this.goboTex = this.experience.resources.items.goboTexture;
    this.goboTex.colorSpace = THREE.NoColorSpace;
    this.goboTex.generateMipmaps = true;
    this.goboTex.minFilter = THREE.LinearMipmapLinearFilter;
    this.goboTex.anisotropy = 16;
    this.goboTex.needsUpdate = true;
    this.init();
  }

  init() {
    this.uGoboStrength = uniform(0.5);
    const uGoboStrength = this.uGoboStrength;
    const uSwayAmount = uniform(0.008);
    const uSwaySpeed = uniform(0.2);
    const uGoboBlur = uniform(0.0);
    this.uDayNight = uniform(0.0);
    this.isNight = false;

    const items = this.experience.resources.items;
    const ordinalTextureMap = {
      First: items.firstTexture,
      Second: items.secondTexture,
      Third: items.thirdTexture,
      Fourth: items.fourthTexture,
      Fifth: items.fifthTexture,
      Sixth: items.sixthTexture,
      Seventh: items.seventhTexture,
      Eighth: items.eighthTexture,
      Ninth: items.ninthTexture,
    };
    const ordinalNightTextureMap = {
      First: items.firstNightTexture,
      Second: items.secondNightTexture,
      Third: items.thirdNightTexture,
      Fourth: items.fourthNightTexture,
      Fifth: items.fifthNightTexture,
      Sixth: items.sixthNightTexture,
      Seventh: items.seventhNightTexture,
      Eighth: items.eighthNightTexture,
      Ninth: items.ninthNightTexture,
    };

    [
      ...Object.values(ordinalTextureMap),
      ...Object.values(ordinalNightTextureMap),
    ].forEach((t) => {
      if (t) {
        t.flipY = false;
        t.generateMipmaps = true;
        t.minFilter = THREE.LinearMipmapLinearFilter;
        t.anisotropy = 16;
      }
    });

    const blurGobo = (centerUV) => {
      const r = uGoboBlur;
      const rn = uGoboBlur.mul(-1.0);
      // 3x3 Gaussian kernel: corners=1/16, edges=2/16, center=4/16
      return texture(this.goboTex, centerUV.add(vec2(rn, rn)))
        .rgb.mul(0.0625)
        .add(texture(this.goboTex, centerUV.add(vec2(0.0, rn))).rgb.mul(0.125))
        .add(texture(this.goboTex, centerUV.add(vec2(r, rn))).rgb.mul(0.0625))
        .add(texture(this.goboTex, centerUV.add(vec2(rn, 0.0))).rgb.mul(0.125))
        .add(texture(this.goboTex, centerUV).rgb.mul(0.25))
        .add(texture(this.goboTex, centerUV.add(vec2(r, 0.0))).rgb.mul(0.125))
        .add(texture(this.goboTex, centerUV.add(vec2(rn, r))).rgb.mul(0.0625))
        .add(texture(this.goboTex, centerUV.add(vec2(0.0, r))).rgb.mul(0.125))
        .add(texture(this.goboTex, centerUV.add(vec2(r, r))).rgb.mul(0.0625));
    };

    this.model.traverse((obj) => {
      if (!obj.isMesh) return;

      const old = obj.material;
      const mat = new THREE.MeshBasicNodeMaterial();

      const t = time.mul(uSwaySpeed);

      const clipPos = spotProjectionMatrixUniform.mul(vec4(positionWorld, 1.0));
      const projUV = clipPos.xy.div(clipPos.w).mul(0.5).add(0.5);
      const inFrustum = clipPos.w
        .greaterThan(0.0)
        .and(projUV.x.greaterThanEqual(0.0))
        .and(projUV.x.lessThanEqual(1.0))
        .and(projUV.y.greaterThanEqual(0.0))
        .and(projUV.y.lessThanEqual(1.0));
      const offsetX = mx_noise_float(
        vec3(projUV.x.mul(2.0), projUV.y.mul(2.0), t),
      );
      const offsetY = mx_noise_float(
        vec3(
          projUV.x.mul(2.0).add(5.2),
          projUV.y.mul(2.0).add(1.3),
          t.add(2.7),
        ),
      );
      const areaVariation = mx_noise_float(vec3(projUV.x, projUV.y, 0.0))
        .abs()
        .mul(1.5)
        .add(0.3);
      const distortedUV = projUV.add(
        vec2(offsetX, offsetY).mul(uSwayAmount).mul(areaVariation),
      );
      const goboSample = select(inFrustum, blurGobo(distortedUV), vec3(1.0));
      const softGobo = goboSample.oneMinus().mul(uGoboStrength).oneMinus();

      const clipPos2 = spotProjectionMatrixUniform2.mul(
        vec4(positionWorld, 1.0),
      );
      const projUV2 = clipPos2.xy.div(clipPos2.w).mul(0.5).add(0.5);
      const inFrustum2 = clipPos2.w
        .greaterThan(0.0)
        .and(projUV2.x.greaterThanEqual(0.0))
        .and(projUV2.x.lessThanEqual(1.0))
        .and(projUV2.y.greaterThanEqual(0.0))
        .and(projUV2.y.lessThanEqual(1.0));
      const offsetX2 = mx_noise_float(
        vec3(projUV2.x.mul(2.0).add(9.1), projUV2.y.mul(2.0).add(4.7), t),
      );
      const offsetY2 = mx_noise_float(
        vec3(
          projUV2.x.mul(2.0).add(14.3),
          projUV2.y.mul(2.0).add(5.9),
          t.add(2.7),
        ),
      );
      const areaVariation2 = mx_noise_float(
        vec3(projUV2.x.add(7.3), projUV2.y.add(3.1), 0.0),
      )
        .abs()
        .mul(1.5)
        .add(0.3);
      const distortedUV2 = projUV2.add(
        vec2(offsetX2, offsetY2).mul(uSwayAmount).mul(areaVariation2),
      );
      const goboSample2 = select(inFrustum2, blurGobo(distortedUV2), vec3(1.0));
      const softGobo2 = goboSample2.oneMinus().mul(uGoboStrength).oneMinus();

      const clipPos3 = spotProjectionMatrixUniform3.mul(
        vec4(positionWorld, 1.0),
      );
      const projUV3 = clipPos3.xy.div(clipPos3.w).mul(0.5).add(0.5);
      const inFrustum3 = clipPos3.w
        .greaterThan(0.0)
        .and(projUV3.x.greaterThanEqual(0.0))
        .and(projUV3.x.lessThanEqual(1.0))
        .and(projUV3.y.greaterThanEqual(0.0))
        .and(projUV3.y.lessThanEqual(1.0));
      const offsetX3 = mx_noise_float(
        vec3(projUV3.x.mul(2.0).add(17.5), projUV3.y.mul(2.0).add(8.3), t),
      );
      const offsetY3 = mx_noise_float(
        vec3(
          projUV3.x.mul(2.0).add(22.1),
          projUV3.y.mul(2.0).add(11.7),
          t.add(2.7),
        ),
      );
      const areaVariation3 = mx_noise_float(
        vec3(projUV3.x.add(13.9), projUV3.y.add(6.4), 0.0),
      )
        .abs()
        .mul(1.5)
        .add(0.3);
      const distortedUV3 = projUV3.add(
        vec2(offsetX3, offsetY3).mul(uSwayAmount).mul(areaVariation3),
      );
      const goboSample3 = select(inFrustum3, blurGobo(distortedUV3), vec3(1.0));
      const softGobo3 = goboSample3.oneMinus().mul(uGoboStrength).oneMinus();

      const ordinal = obj.name.split("_")[0];
      // The orange sticker board contains user-supplied transparent stickers.
      // Keep its baked cardboard shading, but do not project the room's dark
      // foliage gobo over it; that makes the transparent areas look like
      // unwanted black sticker backings.
      const stickerBoardLight =
        obj.name === "Fourth_Extras_Baked"
          ? vec3(1.0)
          : softGobo.min(softGobo2).min(softGobo3);
      const ordinalTex = ordinalTextureMap[ordinal];
      const ordinalNightTex = ordinalNightTextureMap[ordinal];
      const alphaTest = ordinal === "Fourth" ? 0.5 : 0.2;
      if (ordinalTex && ordinalNightTex) {
        const daySample = texture(ordinalTex, uv());
        const nightSample = texture(ordinalNightTex, uv());
        const blended = mix(daySample, nightSample, this.uDayNight);
        mat.colorNode = blended.rgb.mul(stickerBoardLight);
        mat.opacityNode = blended.a;
        mat.transparent = true;
        mat.alphaTest = alphaTest;
      } else if (ordinalTex) {
        const texSample = texture(ordinalTex, uv());
        mat.colorNode = texSample.rgb.mul(stickerBoardLight);
        mat.opacityNode = texSample.a;
        mat.transparent = true;
        mat.alphaTest = alphaTest;
      } else if (old.map) {
        mat.colorNode = texture(old.map, uv()).mul(stickerBoardLight);
      } else {
        mat.color.copy(old.color);
      }

      old.dispose();
      obj.material = mat;
    });

    this.experience.scene.add(this.model);

    // The original attachment cards were proportioned for tall human
    // cut-outs. Widen and separate them so the two horizontal pig drawings
    // keep their natural proportions without being clipped by the folds.
    const leftPigCard = this.model.getObjectByName("Ninth_Attachment_Patricia");
    const rightPigCard = this.model.getObjectByName("Ninth_Attachment_John");
    if (leftPigCard) {
      leftPigCard.scale.x *= 2.2;
      leftPigCard.position.x -= 0.55;
    }
    if (rightPigCard) {
      rightPigCard.scale.x *= 1.75;
      rightPigCard.position.x += 0.45;
    }

    // The original scene used these three raycaster meshes as sticker-like
    // character props. They are no longer part of the wedding board, so hide
    // them together with the baked sticker artwork above.
    for (const name of [
      "Fourth_Carl_Raycaster",
      "Fourth_Russell_Raycaster",
      "Fourth_Dug_Raycaster",
    ]) {
      const sticker = this.model.getObjectByName(name);
      if (sticker) sticker.visible = false;
    }

    // Add the three wedding cat stickers as independent transparent planes on
    // the clean board. Keeping them separate from the baked atlas means their
    // edges stay intact and their positions can be adjusted without repainting
    // the board texture.
    const catStickerGroup = new THREE.Group();
    catStickerGroup.name = "Wedding_Cat_Stickers";

    const boardCenter = new THREE.Vector3(-6.0472, -10.6939, -29.82);
    const boardRight = new THREE.Vector3(3.3353, -0.0075, -0.0707).normalize();
    const boardDown = new THREE.Vector3(-0.6347, -4.3283, 1.2925).normalize();
    const boardUp = boardDown.clone().negate();
    const boardNormal = boardRight.clone().cross(boardUp).normalize();
    const boardBasis = new THREE.Matrix4().makeBasis(
      boardRight,
      boardUp,
      boardNormal,
    );

    const addCatSticker = (texture, width, height, x, y) => {
      if (!texture) return;

      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 8;
      texture.needsUpdate = true;

      const sticker = new THREE.Mesh(
        new THREE.PlaneGeometry(width, height),
        new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
          alphaTest: 0.02,
          depthWrite: false,
          side: THREE.DoubleSide,
          toneMapped: false,
        }),
      );
      sticker.position.copy(boardCenter)
        .add(boardRight.clone().multiplyScalar(x))
        .add(boardUp.clone().multiplyScalar(y))
        .add(boardNormal.clone().multiplyScalar(0.018));
      sticker.setRotationFromMatrix(boardBasis);
      sticker.renderOrder = 10;
      catStickerGroup.add(sticker);
    };

    // Spread the three stickers across the board and give each one a little
    // more presence while keeping a safe margin from the board edges.
    addCatSticker(items.catStickerDoor, 1.18, 2.33, -1.80, 0.86);
    addCatSticker(items.catStickerSitting, 1.80, 1.91, 0.98, 0.86);
    addCatSticker(items.catStickerLying, 1.96, 1.16, 0.0, -1.82);
    this.experience.scene.add(catStickerGroup);

    // First_House_Baked contains the original John/Patricia lettering as a
    // small baked wall panel. Remove only that panel's triangles so the
    // miniature house and desk objects remain intact.
    const firstHouse = this.model.getObjectByName("First_House_Baked");
    if (firstHouse?.geometry?.index) {
      const geometry = firstHouse.geometry;
      const position = geometry.attributes.position;
      const sourceIndex = geometry.index.array;
      const keptIndex = [];
      const panelMin = new THREE.Vector3(-21.1, 3.4, -2.55);
      const panelMax = new THREE.Vector3(-16.89, 5.62, -2.46);

      for (let i = 0; i < sourceIndex.length; i += 3) {
        const triangle = [sourceIndex[i], sourceIndex[i + 1], sourceIndex[i + 2]];
        let intersectsPanel = true;

        for (const vertexIndex of triangle) {
          const x = position.getX(vertexIndex);
          const y = position.getY(vertexIndex);
          const z = position.getZ(vertexIndex);
          if (
            x < panelMin.x ||
            x > panelMax.x ||
            y < panelMin.y ||
            y > panelMax.y ||
            z < panelMin.z ||
            z > panelMax.z
          ) {
            intersectsPanel = false;
            break;
          }
        }

        if (!intersectsPanel) keptIndex.push(...triangle);
      }

      geometry.setIndex(keptIndex);
      geometry.index.needsUpdate = true;
      geometry.computeBoundingSphere();
    }

    // Sixth_Plants_Baked also contains the original decorative branch across
    // the name area. Its triangles occupy a fixed range in the source GLB, so
    // remove that geometry directly. This stays correct at every aspect ratio,
    // unlike the old screen-space mask, while preserving the other plants.
    const plants = this.model.getObjectByName("Sixth_Plants_Baked");
    if (plants?.geometry?.index) {
      const geometry = plants.geometry;
      const sourceIndex = geometry.index.array;
      const keptIndex = [];

      for (let i = 0; i < sourceIndex.length; i += 3) {
        const isNameBranch = i >= 879516 && i <= 884349;
        const isDetachedBranchTip = i === 917103 || i === 917106;
        if (!isNameBranch && !isDetachedBranchTip) {
          keptIndex.push(sourceIndex[i], sourceIndex[i + 1], sourceIndex[i + 2]);
        }
      }

      geometry.setIndex(keptIndex);
      geometry.index.needsUpdate = true;
      geometry.computeBoundingSphere();
    }

    const folder = this.experience.gui.addFolder("Room Gobo Projection");
    folder
      .add({ strength: 0.5 }, "strength", 0, 1, 0.01)
      .name("Shadow Strength")
      .onChange((v) => {
        uGoboStrength.value = v;
      });
    folder
      .add({ swayAmount: 0.008 }, "swayAmount", 0, 0.03, 0.001)
      .name("Sway Amount")
      .onChange((v) => {
        uSwayAmount.value = v;
      });
    folder
      .add({ swaySpeed: 0.2 }, "swaySpeed", 0, 1, 0.01)
      .name("Sway Speed")
      .onChange((v) => {
        uSwaySpeed.value = v;
      });
    folder
      .add({ softness: 0.0 }, "softness", 0, 0.002, 0.0001)
      .name("Shadow Softness")
      .onChange((v) => {
        uGoboBlur.value = v;
      });
    folder
      .add({ blend: 0.0 }, "blend", 0, 1, 0.01)
      .name("Day/Night Blend")
      .onChange((v) => {
        this.uDayNight.value = v;
      });
  }

  toggleDayNight() {
    this.isNight = !this.isNight;
    gsap.to(this.uDayNight, {
      value: this.isNight ? 1 : 0,
      duration: 1.5,
      ease: "power2.inOut",
    });
    gsap.to(this.experience.renderer.uContrast, {
      value: this.isNight ? 1.0 : 1.2,
      duration: 1.5,
      ease: "power2.inOut",
    });
    gsap.to(this.uGoboStrength, {
      value: this.isNight ? 0 : 0.5,
      duration: 1.5,
      ease: "power2.inOut",
    });
    this.experience.world.butterflies?.forEach((b) => {
      gsap.to(b.uOpacity, {
        value: this.isNight ? 0 : 1,
        duration: 1.5,
        ease: "power2.inOut",
      });
    });
    const fireflies = this.experience.world.fireflies;
    if (fireflies) {
      gsap.to(fireflies.uOpacity, {
        value: this.isNight ? 1 : 0,
        duration: 1.5,
        ease: "power2.inOut",
      });
    }
  }

  resize() {}
  update() {}
  destroy() {}
}
