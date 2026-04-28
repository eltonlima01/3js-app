import { Stick } from "./Stick";

export class Interface {
  constructor(callbacks) {
    this.newStick = callbacks.newStick;
    this.deleteStick = callbacks.deleteStick;
    this.separateStick = callbacks.separateStick;
    this.updateGap = callbacks.updateGap;
    this.toggleCamera = callbacks.toggleCamera;
    this.changeGap = callbacks.changeGap;

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

    this.posXNumber = document.getElementById("pos-x");
    this.posYNumber = document.getElementById("pos-y");

    this.btnStick.addEventListener("pointerdown", (event) =>
      event.stopPropagation(),
    );
    this.btnCamera.addEventListener("pointerdown", (event) =>
      event.stopPropagation(),
    );

    this.btnStick.addEventListener("click", this.newStick);
    this.btnCamera.addEventListener("click", this.toggleCamera);

    this.gapInput = document.getElementById("gap-input");
    this.gapInput.value = 1.0;

    this.gapInput.addEventListener("pointerdown", (event) => {
      event.stopPropagation();
    });

    this.gapInput.addEventListener("input", (event) => {
      const newGap = parseFloat(event.target.value);

      if (!isNaN(newGap)) {
        this.changeGap(newGap);
      }
    });

    this.btnSeparate = document.getElementById("btn-separate");
    this.btnDelete = document.getElementById("btn-delete");

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
    this.gapInput.addEventListener("pointerdown", (event) =>
      event.stopPropagation(),
    );

    this.btnStick.addEventListener("click", this.newStick);
    this.btnCamera.addEventListener("click", this.toggleCamera);

    this.gapInput.addEventListener("input", (event) => {
      const UPDATED_GAP = parseFloat(event.target.value);

      if (!isNaN(UPDATED_GAP)) {
        this.updateGap(UPDATED_GAP);
      }
    });

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

    /* Position X/Y */

    function updatePosition(axis, value) {
      if(Stick.selectedStick !== null && (isNaN(value) === false)) {
        const currentPos = Stick.selectedStick.get().position[axis];
        const delta = value - currentPos;

        for(const stick of Stick.selectedStick.cluster) {
          stick.get().position[axis] += delta;
          stick.get().updateMatrixWorld(true);
        }
      }
    }

    this.posXNumber.addEventListener("input", (event) => {
      updatePosition('x', parseFloat(event.target.value));
    });

    this.posYNumber.addEventListener("input", (event) => {
      updatePosition('y', parseFloat(event.target.value));
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

      this.posXNumber.value = (Stick.selectedStick.get().position.x).toFixed(3);
      this.posYNumber.value = (Stick.selectedStick.get().position.y).toFixed(3);
    });

    window.addEventListener("pointerdown", (event) => {
      if (event.button === 0) {
        this.contextMenu.classList.remove("active");
        Stick.selectedStick = null;
      }
    });
  }
}
