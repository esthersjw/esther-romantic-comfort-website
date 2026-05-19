import { Experience } from "./Experience/Experience";
import "./style.css";

const experience = new Experience();

const btn = document.getElementById("day-night-toggle");
const icon = btn.querySelector(".day-night-btn__icon");
const label = btn.querySelector(".day-night-btn__label");

btn.addEventListener("click", () => {
  experience.world.room?.toggleDayNight();
  const goingNight = experience.world.room?.isNight ?? false;
  icon.innerHTML = goingNight ? "&#9728;" : "&#9790;";
  label.textContent = goingNight ? "Day" : "Night";
  experience.world.raycaster?.setDayNightVolume(goingNight);
});
