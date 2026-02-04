import * as THREE from 'three';
import { SceneManager } from './core/SceneManager';
import { PlayerController } from './core/PlayerController';
import { SkyEnvironment } from './environment/SkyEnvironment';
import { Skybox } from './environment/Skybox';
import { ShootingStars } from './environment/ShootingStars';
import { PlanetManager } from './systems/PlanetManager';
import { MusicSystem } from './systems/MusicSystem';
import { UIManager } from './ui/UIManager';
import { Dog } from './objects/Dog';

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
  private dog: Dog;

  // Dog interaction state
  private isNearDog: boolean = false;
  private dogInteractionDistance: number = 3;
  private isShowingDogQuote: boolean = false;

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

    // Initialize Ivy the dog
    this.dog = new Dog('Ivy');
    this.dog.setPosition(3, 0, 3);
    this.sceneManager.scene.add(this.dog.mesh);

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

    // Setup dog interaction
    this.setupDogInteraction();
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

  private setupDogInteraction(): void {
    this.playerController.setInteractCallback(() => {
      if (this.isNearDog && !this.isShowingDogQuote) {
        this.petDog();
      } else if (this.isShowingDogQuote) {
        this.hideDogQuote();
      }
    });
  }

  private petDog(): void {
    this.dog.pet();
    this.uiManager.hideDogPrompt();
    this.uiManager.showDogQuote();
    this.isShowingDogQuote = true;
  }

  private hideDogQuote(): void {
    this.uiManager.hideDogQuote();
    this.isShowingDogQuote = false;
  }

  private checkDogProximity(): void {
    if (!this.sceneManager.controls.isLocked) return;

    const distance = this.dog.getDistanceToPlayer(this.sceneManager.camera.position);
    const wasNearDog = this.isNearDog;
    this.isNearDog = distance <= this.dogInteractionDistance;

    // Show/hide prompt based on proximity
    if (this.isNearDog && !wasNearDog && !this.isShowingDogQuote) {
      this.uiManager.showDogPrompt();
    } else if (!this.isNearDog && wasNearDog && !this.isShowingDogQuote) {
      this.uiManager.hideDogPrompt();
    }

    // Hide quote if player walks away
    if (!this.isNearDog && this.isShowingDogQuote) {
      this.hideDogQuote();
    }
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

    // Update Ivy (always follows player)
    this.dog.update(
      delta,
      this.sceneManager.camera.position,
      this.planetManager.getCurrentFlatRadius()
    );

    // Check dog proximity for interaction prompt
    this.checkDogProximity();

    // Render
    this.sceneManager.render();
  };
}
