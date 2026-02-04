import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { Terrain } from '../environment/Terrain';

interface MovementState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  sprint: boolean;
}

export class PlayerController {
  private movement: MovementState = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    sprint: false,
  };

  public readonly velocity: THREE.Vector3 = new THREE.Vector3();
  private readonly direction: THREE.Vector3 = new THREE.Vector3();

  private readonly moveSpeed = 50;
  private readonly sprintMultiplier = 2;
  private readonly gravity = 50;
  private readonly jumpForce = 20;
  public readonly playerHeight = 2;

  private isOnGround = true;

  // Interaction callback
  private onInteract: (() => void) | null = null;

  constructor(
    private readonly camera: THREE.PerspectiveCamera,
    private readonly controls: PointerLockControls
  ) {
    this.setupKeyboardControls();
  }

  public setInteractCallback(callback: () => void): void {
    this.onInteract = callback;
  }

  private setupKeyboardControls(): void {
    document.addEventListener('keydown', (event) => {
      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          this.movement.forward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.movement.backward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          this.movement.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.movement.right = true;
          break;
        case 'Space':
          if (this.isOnGround) {
            this.velocity.y = this.jumpForce;
            this.isOnGround = false;
          }
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          this.movement.sprint = true;
          break;
        case 'KeyE':
          if (this.onInteract) {
            this.onInteract();
          }
          break;
      }
    });

    document.addEventListener('keyup', (event) => {
      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          this.movement.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.movement.backward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          this.movement.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.movement.right = false;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          this.movement.sprint = false;
          break;
      }
    });
  }

  public update(delta: number, currentFlatRadius: number): void {
    if (!this.controls.isLocked) return;

    // Friction
    this.velocity.x -= this.velocity.x * 8.0 * delta;
    this.velocity.z -= this.velocity.z * 8.0 * delta;

    // Apply gravity
    this.velocity.y -= this.gravity * delta;

    // Direction
    this.direction.z = Number(this.movement.forward) - Number(this.movement.backward);
    this.direction.x = Number(this.movement.right) - Number(this.movement.left);
    this.direction.normalize();

    const currentSpeed = this.movement.sprint
      ? this.moveSpeed * this.sprintMultiplier
      : this.moveSpeed;

    if (this.movement.forward || this.movement.backward) {
      this.velocity.z -= this.direction.z * currentSpeed * delta;
    }
    if (this.movement.left || this.movement.right) {
      this.velocity.x -= this.direction.x * currentSpeed * delta;
    }

    this.controls.moveRight(-this.velocity.x * delta);
    this.controls.moveForward(-this.velocity.z * delta);
    this.camera.position.y += this.velocity.y * delta;

    // Ground collision - sample terrain height at player position
    const terrainY = Terrain.getTerrainHeight(
      this.camera.position.x,
      this.camera.position.z,
      currentFlatRadius
    );
    const groundLevel = terrainY + this.playerHeight;

    // Always keep player above terrain (handles both falling and walking uphill)
    if (this.camera.position.y <= groundLevel) {
      this.camera.position.y = groundLevel;
      this.velocity.y = 0;
      this.isOnGround = true;
    } else {
      // Player is above ground - check if they're close enough to be considered "on ground"
      // This allows jumping to work properly
      const distanceToGround = this.camera.position.y - groundLevel;
      if (distanceToGround < 0.1) {
        this.isOnGround = true;
      } else {
        this.isOnGround = false;
      }
    }

    // Keep player in bounds
    const maxDistance = 120;
    const playerDist = Math.sqrt(
      this.camera.position.x * this.camera.position.x +
        this.camera.position.z * this.camera.position.z
    );
    if (playerDist > maxDistance) {
      const scale = maxDistance / playerDist;
      this.camera.position.x *= scale;
      this.camera.position.z *= scale;
    }
  }

  public resetPosition(flatRadius: number): void {
    const spawnTerrainY = Terrain.getTerrainHeight(0, 0, flatRadius);
    this.camera.position.set(0, spawnTerrainY + this.playerHeight, 0);
    this.velocity.set(0, 0, 0);
    this.isOnGround = true;
  }
}
