import { Experience } from "./Experience/Experience";
import "./style.css";

const experience = new Experience();

const btn = document.getElementById("day-night-toggle");
const icon = btn.querySelector(".day-night-btn__icon");

btn.addEventListener("click", () => {
  experience.world.room?.toggleDayNight();
  const goingNight = experience.world.room?.isNight ?? false;
  icon.innerHTML = goingNight ? "&#9728;" : "&#9790;";
  experience.world.raycaster?.setDayNightVolume(goingNight);
});
