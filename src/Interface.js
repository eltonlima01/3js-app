export class Interface {
    constructor(callbacks) {
        this.addStick = callbacks.addStick;
        this.updateGap = callbacks.updateGap;
        this.toggleCamera = callbacks.toggleCamera;

        this.activeStick = null;

        this.btnStick = document.getElementById("stick-btn");
        this.btnCamera = document.getElementById("camera-btn");

        this.contextMenu = document.getElementById("context-menu");

        this.angleSlider = document.getElementById("angle-slider");
        this.angleDisplay = document.getElementById("angle-display");

        this.lengthSlider = document.getElementById("length-slider");
        this.lengthDisplay = document.getElementById("length-display");

        this.gapInput = document.getElementById("gap-input");

        this.btnStick.addEventListener("pointerdown", (event) => event.stopPropagation());
        this.btnCamera.addEventListener("pointerdown", (event) => event.stopPropagation());

        this.btnStick.addEventListener("click", this.addStick);
        this.btnCamera.addEventListener("click", this.toggleCamera);

        this.events();
        this.mainInterface();
        this.contextInterface();
    }

    mainInterface() {
        this.btnStick.addEventListener("pointerdown", (event) => event.stopPropagation());
        this.btnCamera.addEventListener("pointerdown", (event) => event.stopPropagation());

        this.btnStick.addEventListener("click", this.addStick);
        this.btnCamera.addEventListener("click", this.toggleCamera);

        this.gapInput.addEventListener("input", (event) => {
            const UPDATED_GAP = parseFloat(event.target.value);

            if (!isNaN(UPDATED_GAP)) {
                this.updateGap(UPDATED_GAP);
            }
        })
    }

    contextInterface() {
        this.contextMenu.addEventListener("pointerdown", (event) =>
            event.stopPropagation(),
        );

        this.angleSlider.addEventListener("input", (event) => {
            if (this.activeStick !== null) {
                this.activeStick.setAngle(event.target.value);
                this.angleDisplay.innerText = `${event.target.value}°`;
            }
        });

        this.lengthSlider.addEventListener("input", (event) => {
            if (this.activeStick !== null) {
                const newScale = parseFloat(event.target.value);

                this.activeStick.get().scale.x = newScale;
                this.lengthDisplay.innerText = (6.0015 * 2 * newScale).toFixed(1) + " cm";
            }
        });
    }

    events() {
        window.addEventListener("openContextMenu", (event) => {
            this.activeStick = event.detail.stick;
    
            this.contextMenu.style.left = `${event.detail.x}px`;
            this.contextMenu.style.top = `${event.detail.y}px`;
            this.contextMenu.classList.add("active");
    
            this.angleSlider.value = Math.round(this.activeStick.getAngle());
            this.angleDisplay.innerText = `${this.angleSlider.value}°`;
    
            this.lengthSlider.value = this.activeStick.get().scale.x;
            this.lengthDisplay.innerText = (6.0015 * 2 * this.activeStick.get().scale.x).toFixed(1) + " cm";
        });
    
        window.addEventListener("pointerdown", (event) => {
            if (event.button === 0) {
                this.contextMenu.classList.remove("active");
                this.activeStick = null;
            }
        });
    }
}