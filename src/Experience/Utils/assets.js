const isIOS =
  /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

const ext = isIOS ? "ktx2" : "webp";

export default [
  {
    name: "room",
    type: "glbModel",
    path: "/models/Room.glb",
  },
  {
    name: "hitboxes",
    type: "glbModel",
    path: "/models/Hitboxes.glb",
  },
  {
    name: "goboTexture",
    type: "texture",
    path: "/textures/gobo.jpg",
  },
  {
    name: "butterflyWingTexture",
    type: "texture",
    path: "/textures/butterfly_wing.webp",
  },
  {
    name: "firstTexture",
    type: isIOS ? "ktx2" : "texture",
    path: `/textures/day/first-house_day.${ext}`,
  },
  {
    name: "secondTexture",
    type: isIOS ? "ktx2" : "texture",
    path: `/textures/day/second-photos_day.${ext}`,
  },
  {
    name: "thirdTexture",
    type: isIOS ? "ktx2" : "texture",
    path: `/textures/day/third-desk_day.${ext}`,
  },
  {
    name: "fourthTexture",
    type: isIOS ? "ktx2" : "texture",
    path: `/textures/day/fourth-extras_day.${ext}`,
  },
  {
    name: "fifthTexture",
    type: isIOS ? "ktx2" : "texture",
    path: `/textures/day/fifth-background_day.${ext}`,
  },
  {
    name: "sixthTexture",
    type: isIOS ? "ktx2" : "texture",
    path: `/textures/day/sixth-plants_day.${ext}`,
  },
  {
    name: "seventhTexture",
    type: isIOS ? "ktx2" : "texture",
    path: `/textures/day/seventh-large-stuff_day.${ext}`,
  },
  {
    name: "eighthTexture",
    type: isIOS ? "ktx2" : "texture",
    path: `/textures/day/eighth-decor_day.${ext}`,
  },
  {
    name: "ninthTexture",
    type: isIOS ? "ktx2" : "texture",
    path: `/textures/day/ninth-attachment_day.${ext}`,
  },
  {
    name: "firstNightTexture",
    type: isIOS ? "ktx2" : "texture",
    path: `/textures/night/first-house_night.${ext}`,
  },
  {
    name: "secondNightTexture",
    type: isIOS ? "ktx2" : "texture",
    path: `/textures/night/second-photos_night.${ext}`,
  },
  {
    name: "thirdNightTexture",
    type: isIOS ? "ktx2" : "texture",
    path: `/textures/night/third-desk_night.${ext}`,
  },
  {
    name: "fourthNightTexture",
    type: isIOS ? "ktx2" : "texture",
    path: `/textures/night/fourth-extras_night.${ext}`,
  },
  {
    name: "fifthNightTexture",
    type: isIOS ? "ktx2" : "texture",
    path: `/textures/night/fifth-background_night.${ext}`,
  },
  {
    name: "sixthNightTexture",
    type: isIOS ? "ktx2" : "texture",
    path: `/textures/night/sixth-plants_night.${ext}`,
  },
  {
    name: "seventhNightTexture",
    type: isIOS ? "ktx2" : "texture",
    path: `/textures/night/seventh-large-stuff_night.${ext}`,
  },
  {
    name: "eighthNightTexture",
    type: isIOS ? "ktx2" : "texture",
    path: `/textures/night/eighth-decor_night.${ext}`,
  },
  {
    name: "ninthNightTexture",
    type: isIOS ? "ktx2" : "texture",
    path: `/textures/night/ninth-attachment_night.${ext}`,
  },
  // {
  //   name: "skybox",
  //   type: "skybox",
  //   path: [
  //     "/textures/skybox/px.png",
  //     "/textures/skybox/nx.png",
  //     "/textures/skybox/py.png",
  //     "/textures/skybox/ny.png",
  //     "/textures/skybox/pz.png",
  //     "/textures/skybox/nz.png",
  //   ],
  // },
];
