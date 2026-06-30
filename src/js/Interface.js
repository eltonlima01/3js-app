import { Stick } from "./Stick";

export class Interface {
  constructor(callbacks) {
    this.newStick = callbacks.newStick;
    this.deleteStick = callbacks.deleteStick;
    this.separateStick = callbacks.separateStick;
    this.toggleCamera = callbacks.toggleCamera;
    this.analyzeBridge = callbacks.analyzeBridge;

    this.mainMenu = document.querySelector(".main-menu");
    this.mainMenuHeader = document.querySelector(".main-menu-header");

    this.contextMenu = document.getElementById("context-menu");

    this.btnStick = document.getElementById("stick-btn");
    this.btnCamera = document.getElementById("camera-btn");

    this.angleSlider = document.getElementById("angle-slider");
    this.angleDisplay = document.getElementById("angle-display");
    this.angleNumber = document.getElementById("angle-number");

    this.lengthSlider = document.getElementById("length-slider");
    this.lengthDisplay = document.getElementById("length-display");
    this.lengthNumber = document.getElementById("length-number");

    this.forceDisplay = document.getElementById("force-display");

    this.btnStick.addEventListener("pointerdown", (event) =>
      event.stopPropagation(),
    );
    this.btnCamera.addEventListener("pointerdown", (event) =>
      event.stopPropagation(),
    );

    this.btnStick.addEventListener("click", this.newStick);
    this.btnCamera.addEventListener("click", this.toggleCamera);

    this.btnSeparate = document.getElementById("btn-separate");
    this.btnDelete = document.getElementById("btn-delete");

    this.btnAnalyze = document.getElementById("analyze-btn");

    this.btnAnalyze.addEventListener("pointerdown", (event) => {
      event.stopPropagation()
    });

    this.btnAnalyze.addEventListener("click", this.analyzeBridge);

    this.events();
    this.mainInterface();
    this.contextInterface();
  }

  mainInterface() {
    this.btnStick.addEventListener("pointerdown", (event) =>
      event.stopPropagation(),
    );
    this.btnCamera.addEventListener("pointerdown", (event) =>
      event.stopPropagation(),
    );

    this.btnStick.addEventListener("click", this.newStick);
    this.btnCamera.addEventListener("click", this.toggleCamera);

    this.mainMenuHeader.addEventListener("pointerdown", (event) => {
      event.stopPropagation();
      this.mainMenu.classList.toggle("collapsed");
    });
  }

  contextInterface() {
    this.contextMenu.addEventListener("pointerdown", (event) =>
      event.stopPropagation(),
    );

    this.btnSeparate.addEventListener("click", () => {
      if (Stick.selectedStick !== null) {
        const stickToSeparate = Stick.selectedStick;

        this.separateStick(stickToSeparate, event);

        this.contextMenu.classList.remove("active");
        Stick.selectedStick = null;
      }
    });

    this.btnDelete.addEventListener("click", () => {
      const stickToDelete = Stick.selectedStick;

      if (stickToDelete.cluster) {
        stickToDelete.cluster.delete(stickToDelete);
      }

      this.deleteStick(stickToDelete);

      this.contextMenu.classList.remove("active");
      Stick.selectedStick = null;
    });

    /* Angle Slider */

    this.angleSlider.addEventListener("input", (event) => {
      if (Stick.selectedStick !== null) {
        const value = event.target.value;

        Stick.selectedStick.setAngle(value);
        this.angleNumber.value = value;
        this.angleDisplay.innerText = ` ${value}°`;
      }
    });

    this.angleNumber.addEventListener("input", (event) => {
      if (Stick.selectedStick !== null) {
        const value = parseFloat(event.target.value);

        if (isNaN(value) === false) {
          Stick.selectedStick.setAngle(value);
          this.angleDisplay.innerText = ` ${value}°`;
          this.angleNumber.value = value;
        }
      }
    });

    /* Length Slider */

    this.lengthSlider.addEventListener("input", (event) => {
      if (Stick.selectedStick !== null) {
        const value = parseFloat(event.target.value);

        Stick.selectedStick.get().scale.x = value;
        this.lengthDisplay.innerText = " " + (6.0015 * 2 * value).toFixed(1) + " cm";
        this.lengthNumber.value = value;
      }
    });

    this.lengthNumber.addEventListener("input", (event) => {
      if (Stick.selectedStick !== null) {
        const value = parseFloat(event.target.value);

        if (isNaN(value) === false) {
          Stick.selectedStick.get().scale.x = value;

          this.lengthNumber.value = value;
          this.lengthSlider.value = value;
          this.lengthDisplay.innerText = (6.0015 * 2 * value).toFixed(1) + " cm";
        }
      }
    });
  }

  events() {
    window.addEventListener("openContextMenu", (event) => {
      Stick.selectedStick = event.detail.stick;

      this.contextMenu.style.left = `${event.detail.x}px`;
      this.contextMenu.style.top = `${event.detail.y}px`;
      this.contextMenu.classList.add("active");

      const angle = Math.round(Stick.selectedStick.getAngle());

      this.angleSlider.value = angle;
      this.angleNumber.value = angle;
      this.angleDisplay.innerText = `${angle}°`;

      const length = Stick.selectedStick.get().scale.x;

      this.lengthSlider.value = length;
      this.lengthNumber.value = length;
      this.lengthDisplay.innerText = (6.0015 * 2 * length).toFixed(1) + " cm";

      if (Stick.selectedStick.force) {
        let forceType = "";

        if (Stick.selectedStick.force > 0.001) {
          forceType = "Tração";
          this.forceDisplay.style.color = "blue";
        }
        else if (Stick.selectedStick.force < -0.001) {
          forceType = "Compressão";
          this.forceDisplay.style.color = "red";
        }
        else { this.forceDisplay.style.color = "inherit" }

        this.forceDisplay.innerText = `${Math.abs(Stick.selectedStick.force).toFixed(3)} N ${forceType}`;
      }
      else {
        this.forceDisplay.innerText = "Não calculado";
        this.forceDisplay.style.color = "inherit";
      }
    });

    window.addEventListener("pointerdown", (event) => {
      if (!event.button) {
        this.contextMenu.classList.remove("active");
        Stick.selectedStick = null;
      }
    });
  }
}
