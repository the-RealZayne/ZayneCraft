import * as THREE from 'three';

interface JoystickState {
  active: boolean;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  identifier: number | null;
}

interface LookState {
  active: boolean;
  lastX: number;
  lastY: number;
  identifier: number | null;
}

export class TouchControls {
  private joystick: JoystickState = {
    active: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    identifier: null,
  };

  private look: LookState = {
    active: false,
    lastX: 0,
    lastY: 0,
    identifier: null,
  };

  private readonly joystickContainer: HTMLElement;
  private readonly joystickKnob: HTMLElement;
  private readonly jumpButton: HTMLElement;
  private readonly interactButton: HTMLElement;
  private readonly touchOverlay: HTMLElement;

  private readonly camera: THREE.PerspectiveCamera;
  private readonly euler: THREE.Euler = new THREE.Euler(0, 0, 0, 'YXZ');

  private readonly lookSensitivity = 0.003;
  private readonly maxPitch = Math.PI / 2 - 0.1;

  public movementX = 0;
  public movementY = 0;
  public jumpPressed = false;
  public interactPressed = false;

  private onInteract: (() => void) | null = null;

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;

    // Get UI elements
    this.touchOverlay = document.getElementById('touch-controls')!;
    this.joystickContainer = document.getElementById('joystick-container')!;
    this.joystickKnob = document.getElementById('joystick-knob')!;
    this.jumpButton = document.getElementById('jump-button')!;
    this.interactButton = document.getElementById('interact-button')!;

    this.setupTouchListeners();
  }

  public static isTouchDevice(): boolean {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  public enable(): void {
    this.touchOverlay.classList.add('visible');
  }

  public disable(): void {
    this.touchOverlay.classList.remove('visible');
  }

  public setInteractCallback(callback: () => void): void {
    this.onInteract = callback;
  }

  private setupTouchListeners(): void {
    // Joystick touch events
    this.joystickContainer.addEventListener('touchstart', this.onJoystickStart.bind(this), { passive: false });
    document.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
    document.addEventListener('touchend', this.onTouchEnd.bind(this), { passive: false });
    document.addEventListener('touchcancel', this.onTouchEnd.bind(this), { passive: false });

    // Look area (right side of screen)
    this.touchOverlay.addEventListener('touchstart', this.onLookStart.bind(this), { passive: false });

    // Jump button
    this.jumpButton.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.jumpPressed = true;
    }, { passive: false });
    this.jumpButton.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.jumpPressed = false;
    }, { passive: false });

    // Interact button
    this.interactButton.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.interactPressed = true;
      if (this.onInteract) {
        this.onInteract();
      }
    }, { passive: false });
    this.interactButton.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.interactPressed = false;
    }, { passive: false });
  }

  private onJoystickStart(event: TouchEvent): void {
    event.preventDefault();
    const touch = event.changedTouches[0];

    this.joystick.active = true;
    this.joystick.identifier = touch.identifier;
    this.joystick.startX = touch.clientX;
    this.joystick.startY = touch.clientY;
    this.joystick.currentX = touch.clientX;
    this.joystick.currentY = touch.clientY;
  }

  private onLookStart(event: TouchEvent): void {
    // Only handle touches on the right side (not on joystick or buttons)
    const touch = event.changedTouches[0];
    const target = event.target as HTMLElement;

    // Ignore if touching joystick or buttons
    if (target.closest('#joystick-container') ||
        target.closest('#jump-button') ||
        target.closest('#interact-button')) {
      return;
    }

    // Only right half of screen for look
    if (touch.clientX < window.innerWidth * 0.4) {
      return;
    }

    event.preventDefault();
    this.look.active = true;
    this.look.identifier = touch.identifier;
    this.look.lastX = touch.clientX;
    this.look.lastY = touch.clientY;
  }

  private onTouchMove(event: TouchEvent): void {
    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];

      // Handle joystick movement
      if (this.joystick.active && touch.identifier === this.joystick.identifier) {
        event.preventDefault();
        this.joystick.currentX = touch.clientX;
        this.joystick.currentY = touch.clientY;
        this.updateJoystickVisual();
      }

      // Handle look movement
      if (this.look.active && touch.identifier === this.look.identifier) {
        event.preventDefault();
        const deltaX = touch.clientX - this.look.lastX;
        const deltaY = touch.clientY - this.look.lastY;

        this.updateCameraRotation(deltaX, deltaY);

        this.look.lastX = touch.clientX;
        this.look.lastY = touch.clientY;
      }
    }
  }

  private onTouchEnd(event: TouchEvent): void {
    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];

      if (this.joystick.active && touch.identifier === this.joystick.identifier) {
        this.joystick.active = false;
        this.joystick.identifier = null;
        this.movementX = 0;
        this.movementY = 0;
        this.resetJoystickVisual();
      }

      if (this.look.active && touch.identifier === this.look.identifier) {
        this.look.active = false;
        this.look.identifier = null;
      }
    }
  }

  private updateJoystickVisual(): void {
    const maxDistance = 40;
    let deltaX = this.joystick.currentX - this.joystick.startX;
    let deltaY = this.joystick.currentY - this.joystick.startY;

    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance > maxDistance) {
      deltaX = (deltaX / distance) * maxDistance;
      deltaY = (deltaY / distance) * maxDistance;
    }

    this.joystickKnob.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

    // Normalize movement values (-1 to 1)
    this.movementX = deltaX / maxDistance;
    this.movementY = deltaY / maxDistance;
  }

  private resetJoystickVisual(): void {
    this.joystickKnob.style.transform = 'translate(0px, 0px)';
  }

  private updateCameraRotation(deltaX: number, deltaY: number): void {
    this.euler.setFromQuaternion(this.camera.quaternion);

    this.euler.y -= deltaX * this.lookSensitivity;
    this.euler.x -= deltaY * this.lookSensitivity;

    // Clamp vertical rotation
    this.euler.x = Math.max(-this.maxPitch, Math.min(this.maxPitch, this.euler.x));

    this.camera.quaternion.setFromEuler(this.euler);
  }

  public getMovementInput(): { forward: boolean; backward: boolean; left: boolean; right: boolean } {
    const threshold = 0.2;
    return {
      forward: this.movementY < -threshold,
      backward: this.movementY > threshold,
      left: this.movementX < -threshold,
      right: this.movementX > threshold,
    };
  }

  public consumeJump(): boolean {
    if (this.jumpPressed) {
      this.jumpPressed = false;
      return true;
    }
    return false;
  }
}
