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
} from "three/tsl";
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
    this.goboTex.generateMipmaps = false;
    this.goboTex.minFilter = THREE.LinearFilter;
    this.goboTex.needsUpdate = true;
    this.init();
  }

  init() {
    const uGoboStrength = uniform(0.5);
    const uSwayAmount = uniform(0.008);
    const uSwaySpeed = uniform(0.2);
    const uGoboBlur = uniform(0.0);

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
    };

    Object.values(ordinalTextureMap).forEach((t) => {
      if (t) {
        t.flipY = false;
        t.generateMipmaps = false;
        t.minFilter = THREE.LinearFilter;
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

      const ordinalTex = ordinalTextureMap[obj.name.split("_")[0]];
      if (ordinalTex) {
        const texSample = texture(ordinalTex, uv());
        mat.colorNode = texSample.rgb
          .mul(softGobo)
          .mul(softGobo2)
          .mul(softGobo3);
        mat.opacityNode = texSample.a;
        mat.transparent = true;
        mat.alphaTest = 0.2;
      } else if (old.map) {
        mat.colorNode = texture(old.map, uv())
          .mul(softGobo)
          .mul(softGobo2)
          .mul(softGobo3);
      } else {
        mat.color.copy(old.color);
      }

      old.dispose();
      obj.material = mat;
    });

    this.experience.scene.add(this.model);

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
  }

  resize() {}
  update() {}
  destroy() {}
}
