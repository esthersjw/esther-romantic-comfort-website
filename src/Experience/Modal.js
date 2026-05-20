import gsap from "gsap";

export class Modal {
  static _openCount = 0;
  static get anyOpen() { return Modal._openCount > 0; }

  constructor() {
    this._overlay = document.createElement("div");
    this._overlay.className = "modal-overlay";

    this._el = document.createElement("div");
    this._el.className = "modal";
    this._el.innerHTML = `
      <button class="modal__close-button">&#x2715;</button>
      <h2 class="modal__title"></h2>
      <p class="modal__paragraph"></p>
    `;

    document.body.appendChild(this._overlay);
    document.body.appendChild(this._el);

    // Let GSAP own the transform so it can compose xPercent + scale cleanly
    gsap.set(this._el, { xPercent: -50, yPercent: -50 });

    this._overlay.addEventListener("click", () => this.close());
    this._el.querySelector(".modal__close-button").addEventListener("click", () => this.close());
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") this.close(); });
  }

  open(title, text) {
    this._el.querySelector(".modal__title").textContent = title;
    this._el.querySelector(".modal__paragraph").textContent = text;
    this._show();
  }

  openHTML(title, html) {
    this._el.querySelector(".modal__title").textContent = title;
    this._el.querySelector(".modal__paragraph").innerHTML = html;
    this._show();
  }

  _show() {

    gsap.killTweensOf([this._overlay, this._el]);
    this._overlay.style.pointerEvents = "auto";
    this._el.style.pointerEvents = "auto";
    Modal._openCount++;

    gsap.fromTo(this._overlay,
      { opacity: 0 },
      { opacity: 1, duration: 0.35, ease: "power2.out" }
    );
    gsap.fromTo(this._el,
      { opacity: 0, scale: 0.92 },
      { opacity: 1, scale: 1, duration: 0.35, ease: "back.out(1.4)" }
    );
  }

  close() {
    gsap.killTweensOf([this._overlay, this._el]);
    gsap.to(this._overlay, {
      opacity: 0,
      duration: 0.25,
      ease: "power2.in",
      onComplete: () => {
        this._overlay.style.pointerEvents = "none";
        Modal._openCount = Math.max(0, Modal._openCount - 1);
      },
    });
    gsap.to(this._el, {
      opacity: 0,
      scale: 0.94,
      duration: 0.25,
      ease: "power2.in",
      onComplete: () => { this._el.style.pointerEvents = "none"; },
    });
  }

  get isOpen() {
    return parseFloat(gsap.getProperty(this._el, "opacity")) > 0.1;
  }
}
