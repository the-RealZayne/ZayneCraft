import * as THREE from 'three';
import { planets, portalConnections } from '../config/planets';
import { Terrain } from '../environment/Terrain';
import { Skybox } from '../environment/Skybox';
import { Portal } from '../objects/Portal';
import { Terminal } from '../objects/Terminal';
import { Decorations } from '../objects/Decorations';
import { UIManager } from '../ui/UIManager';
import { PlayerController } from '../core/PlayerController';

export class PlanetManager {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private skybox: Skybox;
  private uiManager: UIManager;
  private playerController: PlayerController;

  private currentPlanet = 'home';
  private currentFlatRadius = 40;

  private ground: THREE.Group | null = null;
  private ambientLight: THREE.AmbientLight | null = null;
  private directionalLight: THREE.DirectionalLight | null = null;
  private terminal: THREE.Group | null = null;

  private portals: THREE.Group[] = [];
  private portalLabels: THREE.Group[] = [];
  private decorations: THREE.Object3D[] = [];

  // Animation frame skipping for performance
  private animationFrame: number = 0;

  constructor(
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera,
    skybox: Skybox,
    uiManager: UIManager,
    playerController: PlayerController
  ) {
    this.scene = scene;
    this.camera = camera;
    this.skybox = skybox;
    this.uiManager = uiManager;
    this.playerController = playerController;
  }

  public getCurrentPlanet(): string {
    return this.currentPlanet;
  }

  public getCurrentFlatRadius(): number {
    return this.currentFlatRadius;
  }

  public getTerminal(): THREE.Group | null {
    return this.terminal;
  }

  public getPortals(): THREE.Group[] {
    return this.portals;
  }

  public getDecorations(): THREE.Object3D[] {
    return this.decorations;
  }

  private clearPlanet(): void {
    if (this.ground) this.scene.remove(this.ground);
    if (this.terminal) {
      this.scene.remove(this.terminal);
      this.terminal = null;
    }
    this.portals.forEach((p) => this.scene.remove(p));
    this.portalLabels.forEach((l) => this.scene.remove(l));
    this.decorations.forEach((d) => this.scene.remove(d));
    this.portals.length = 0;
    this.portalLabels.length = 0;
    this.decorations.length = 0;
    this.uiManager.hideHologramPanel();
  }

  public loadPlanet(planetId: string): void {
    this.clearPlanet();

    const config = planets[planetId];
    this.currentPlanet = planetId;

    // Update UI
    this.uiManager.updatePlanetInfo(config);

    // Update sky/fog
    this.scene.background = null;
    this.scene.fog = new THREE.FogExp2(config.skyColor, config.fogDensity);
    this.skybox.updateColors(config);

    // Update lighting
    if (this.ambientLight) this.scene.remove(this.ambientLight);
    if (this.directionalLight) this.scene.remove(this.directionalLight);

    this.ambientLight = new THREE.AmbientLight(config.ambientColor, 0.6);
    this.scene.add(this.ambientLight);

    this.directionalLight = new THREE.DirectionalLight(config.lightColor, config.lightIntensity);
    this.directionalLight.position.set(50, 100, 50);
    this.directionalLight.castShadow = true;
    this.directionalLight.shadow.mapSize.width = 1024;
    this.directionalLight.shadow.mapSize.height = 1024;
    this.directionalLight.shadow.camera.near = 0.5;
    this.directionalLight.shadow.camera.far = 500;
    this.directionalLight.shadow.camera.left = -100;
    this.directionalLight.shadow.camera.right = 100;
    this.directionalLight.shadow.camera.top = 100;
    this.directionalLight.shadow.camera.bottom = -100;
    this.scene.add(this.directionalLight);

    // Create ground - education planet gets larger flat area for campus
    this.currentFlatRadius = planetId === 'education' ? 120 : 40;
    this.ground = Terrain.createGround(config.groundColor, this.currentFlatRadius);
    this.scene.add(this.ground);

    // Create portals
    const connections = portalConnections[planetId];
    const angleStep = (Math.PI * 2) / Math.max(connections.length, 1);

    connections.forEach((targetPlanet, index) => {
      const angle = angleStep * index - Math.PI / 2;
      const portal = Portal.create(targetPlanet, angle, 25);
      this.scene.add(portal);
      this.portals.push(portal);

      // Add label above tent
      const targetConfig = planets[targetPlanet];
      const label = Portal.createLabel(targetConfig.name, targetConfig.section, targetConfig.lightColor);
      label.position.copy(portal.position);
      label.position.y = 7;
      this.scene.add(label);
      this.portalLabels.push(label);
    });

    // Create decorations
    const planetDecorations = Decorations.create(planetId);
    planetDecorations.forEach((d) => {
      this.scene.add(d);
      this.decorations.push(d);
    });

    // Add hologram terminal on home planet
    if (planetId === 'home') {
      this.terminal = Terminal.create();
      this.scene.add(this.terminal);
    }

    // Reset player position
    this.playerController.resetPosition(this.currentFlatRadius);
  }

  public checkPortalCollision(): void {
    const playerPosition = this.camera.position.clone();

    for (const portal of this.portals) {
      const distance = playerPosition.distanceTo(portal.position);

      if (distance < 7) {
        const targetPlanet = portal.userData.targetPlanet;
        this.loadPlanet(targetPlanet);
        break;
      }
    }
  }

  public checkTerminalProximity(): void {
    if (this.terminal) {
      const distanceToTerminal = this.camera.position.distanceTo(this.terminal.position);
      if (distanceToTerminal < 5) {
        this.uiManager.showHologramPanel();
      } else {
        this.uiManager.hideHologramPanel();
      }
    }
  }

  public animatePortals(delta: number, time: number): void {
    this.portals.forEach((portal, index) => {
      Portal.animate(portal, delta, time, index);
    });
  }

  public animateDecorations(delta: number, time: number): void {
    this.animationFrame++;

    // Animate floating decorations (crystals on skills planet)
    if (this.currentPlanet === 'skills') {
      this.decorations.forEach((dec, i) => {
        dec.position.y = 3 + Math.sin(time + i) * 0.5;
        dec.rotation.y += delta * 0.5;
      });
    }

    // Animate fireflies and lantern flames on home planet - skip every other frame for performance
    if (this.currentPlanet === 'home' && this.animationFrame % 2 === 0) {
      this.decorations.forEach((dec, decIndex) => {
        if (dec.children) {
          dec.children.forEach((child) => {
            // Fireflies animation
            if (child instanceof THREE.Points && child.userData.isFireflies) {
              const positions = child.geometry.attributes.position.array as Float32Array;
              const phases = child.geometry.attributes.phase.array as Float32Array;
              const original = child.userData.originalPositions as Float32Array;

              for (let i = 0; i < positions.length / 3; i++) {
                const phase = phases[i];
                // Gentle drifting motion
                positions[i * 3] = original[i * 3] + Math.sin(time * 0.5 + phase) * 0.5;
                positions[i * 3 + 1] = original[i * 3 + 1] + Math.sin(time * 0.7 + phase * 2) * 0.3;
                positions[i * 3 + 2] = original[i * 3 + 2] + Math.cos(time * 0.4 + phase) * 0.5;
              }
              child.geometry.attributes.position.needsUpdate = true;

              // Pulsing glow
              const material = child.material as THREE.PointsMaterial;
              material.opacity = 0.5 + Math.sin(time * 3) * 0.3;
            }

            // Lantern flame animation
            if (child.userData.isLanternFlame) {
              const flicker = Math.sin(time * 8 + decIndex) * 0.02 + Math.sin(time * 12 + decIndex * 2) * 0.01;
              child.position.y = child.userData.baseY + flicker;
              child.scale.setScalar(1 + Math.sin(time * 10 + decIndex) * 0.1);
            }
            if (child.userData.isLanternCore) {
              child.position.y = child.userData.baseY + Math.sin(time * 10 + decIndex) * 0.015;
              child.scale.setScalar(1 + Math.sin(time * 15 + decIndex) * 0.15);
            }
            if (child.userData.isLanternLight) {
              const light = child as THREE.PointLight;
              light.intensity = child.userData.baseIntensity + Math.sin(time * 6 + decIndex) * 0.3;
            }
          });
        }
      });
    }
  }

  public animateTerminal(delta: number, time: number): void {
    if (this.terminal) {
      Terminal.animate(this.terminal, delta, time);
    }
  }
}
