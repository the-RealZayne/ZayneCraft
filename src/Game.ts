import * as THREE from 'three';
import { SceneManager } from './core/SceneManager';
import { PlayerController } from './core/PlayerController';
import { SkyEnvironment } from './environment/SkyEnvironment';
import { Skybox } from './environment/Skybox';
import { ShootingStars } from './environment/ShootingStars';
import { PlanetManager } from './systems/PlanetManager';
import { MusicSystem } from './systems/MusicSystem';
import { UIManager } from './ui/UIManager';

export class Game {
  private sceneManager: SceneManager;
  private playerController: PlayerController;
  private skyEnvironment: SkyEnvironment;
  private skybox: Skybox;
  private shootingStars: ShootingStars;
  private planetManager: PlanetManager;
  private musicSystem: MusicSystem;
  private uiManager: UIManager;
  private clock: THREE.Clock;

  constructor() {
    // Initialize core systems
    this.sceneManager = new SceneManager();
    this.uiManager = new UIManager();
    this.musicSystem = new MusicSystem();
    this.clock = new THREE.Clock();

    // Initialize player controller
    this.playerController = new PlayerController(
      this.sceneManager.camera,
      this.sceneManager.controls
    );

    // Initialize environment
    this.skybox = new Skybox();
    this.sceneManager.scene.add(this.skybox.getMesh());

    this.skyEnvironment = new SkyEnvironment();
    this.skyEnvironment.addToScene(this.sceneManager.scene);

    this.shootingStars = new ShootingStars();
    this.sceneManager.scene.add(this.shootingStars.group);

    // Initialize planet manager
    this.planetManager = new PlanetManager(
      this.sceneManager.scene,
      this.sceneManager.camera,
      this.skybox,
      this.uiManager,
      this.playerController
    );

    // Setup event listeners
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Click to start
    this.uiManager.instructions.addEventListener('click', () => {
      this.sceneManager.controls.lock();
      this.musicSystem.start();
    });

    this.sceneManager.controls.addEventListener('lock', () => {
      this.uiManager.hideInstructions();
    });

    this.sceneManager.controls.addEventListener('unlock', () => {
      this.uiManager.showInstructions();
    });
  }

  public start(): void {
    // Load the initial planet
    this.planetManager.loadPlanet('home');

    // Start the animation loop
    this.animate();
  }

  private animate = (): void => {
    requestAnimationFrame(this.animate);

    const delta = this.clock.getDelta();
    const time = this.clock.getElapsedTime();

    // Update sky environment
    this.skyEnvironment.update(delta, time);

    // Update shooting stars
    this.shootingStars.update(delta);

    // Animate portals
    this.planetManager.animatePortals(delta, time);

    // Animate decorations
    this.planetManager.animateDecorations(delta, time);

    // Animate terminal
    this.planetManager.animateTerminal(delta, time);

    // Check terminal proximity
    this.planetManager.checkTerminalProximity();

    // Update player movement
    if (this.sceneManager.controls.isLocked) {
      this.playerController.update(delta, this.planetManager.getCurrentFlatRadius());

      // Check portal collision
      this.planetManager.checkPortalCollision();
    }

    // Render
    this.sceneManager.render();
  };
}
