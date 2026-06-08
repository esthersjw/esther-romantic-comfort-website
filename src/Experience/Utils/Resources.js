import * as THREE from "three/webgpu";

import { EventEmitter } from "events";
import { Loaders } from "./Loaders";
import assets from "./assets";

const BATCH_SIZE = 4;
const BATCH_DELAY = 150; // ms between batches

export class Resources extends EventEmitter {
  constructor() {
    super();

    this.loaders = new Loaders().loaders;
    this.assets = assets;

    this.items = {};
    this.queue = this.assets.length;
    this.loaded = 0;

    this.startLoading();
  }

  startLoading() {
    const batches = [];
    for (let i = 0; i < this.assets.length; i += BATCH_SIZE) {
      batches.push(this.assets.slice(i, i + BATCH_SIZE));
    }

    batches.forEach((batch, i) => {
      setTimeout(() => this._loadBatch(batch), i * BATCH_DELAY);
    });
  }

  _loadBatch(batch) {
    for (const asset of batch) {
      if (asset.type === "glbModel") {
        this.loaders.gltfLoader.load(asset.path, (file) => {
          this.singleAssetLoaded(asset.name, file);
        });
      } else if (asset.type === "skybox") {
        this.loaders.cubeTextureLoader.load(asset.path, (file) => {
          this.singleAssetLoaded(asset.name, file);
        });
      } else if (asset.type === "texture") {
        this.loaders.textureLoader.load(asset.path, (file) => {
          file.colorSpace = THREE.SRGBColorSpace;
          this.singleAssetLoaded(asset.name, file);
        });
      } else if (asset.type === "ktx2") {
        this.loaders.ktx2Loader.load(asset.path, (file) => {
          file.colorSpace = THREE.SRGBColorSpace;
          this.singleAssetLoaded(asset.name, file);
        });
      }
    }
  }

  singleAssetLoaded(asset, file) {
    this.items[asset] = file;
    this.loaded++;
    this.emit("progress", this.loaded / this.queue);

    if (this.loaded === this.queue) {
      this.emit("ready");
    }
  }
}
