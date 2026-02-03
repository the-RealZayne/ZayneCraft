import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

// Scene setup
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  10000
);

// Renderer
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Pointer Lock Controls
const controls = new PointerLockControls(camera, document.body);

// Planet configuration
interface PlanetConfig {
  name: string;
  section: string;
  groundColor: number;
  skyColor: number;
  ambientColor: number;
  lightColor: number;
  lightIntensity: number;
  fogDensity: number;
  description: string;
}

const planets: Record<string, PlanetConfig> = {
  home: {
    name: 'Terra',
    section: 'Welcome',
    groundColor: 0x3d5c3d,
    skyColor: 0x1a1a2e,
    ambientColor: 0x404060,
    lightColor: 0xffffff,
    lightIntensity: 1,
    fogDensity: 0.008,
    description: 'Your starting point. Explore the portals to learn more about me.',
  },
  story: {
    name: 'Memoria',
    section: 'My Story',
    groundColor: 0x4a3728,
    skyColor: 0x2d1b4e,
    ambientColor: 0x6b4c7a,
    lightColor: 0xffccaa,
    lightIntensity: 0.8,
    fogDensity: 0.01,
    description: 'The story of my journey...',
  },
  skills: {
    name: 'Nexus',
    section: 'Skills',
    groundColor: 0x1a3a4a,
    skyColor: 0x0a1628,
    ambientColor: 0x2080a0,
    lightColor: 0x80dfff,
    lightIntensity: 1.2,
    fogDensity: 0.006,
    description: 'Technologies and abilities I have mastered.',
  },
  education: {
    name: 'Academia',
    section: 'Education',
    groundColor: 0x4a4a3a,
    skyColor: 0x1e1e28,
    ambientColor: 0x8080a0,
    lightColor: 0xffffee,
    lightIntensity: 1,
    fogDensity: 0.007,
    description: 'My academic background and certifications.',
  },
  articles: {
    name: 'Scriptorium',
    section: 'Articles',
    groundColor: 0x2a2a3a,
    skyColor: 0x0f0f1a,
    ambientColor: 0x6060a0,
    lightColor: 0xaaaaff,
    lightIntensity: 0.9,
    fogDensity: 0.012,
    description: 'Writings and thoughts I have shared.',
  },
  projects: {
    name: 'Forge',
    section: 'Projects',
    groundColor: 0x3a2020,
    skyColor: 0x1a0a0a,
    ambientColor: 0xa06040,
    lightColor: 0xffaa66,
    lightIntensity: 1.1,
    fogDensity: 0.009,
    description: 'Things I have built.',
  },
};

// Portal connections - which portals exist on each planet
const portalConnections: Record<string, string[]> = {
  home: ['story', 'skills', 'education', 'articles', 'projects'],
  story: ['home', 'education'],
  skills: ['home', 'projects'],
  education: ['home', 'story'],
  articles: ['home'],
  projects: ['home', 'skills'],
};

let currentPlanet = 'home';

// Movement state
const movement = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  sprint: false,
};
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const moveSpeed = 50;
const sprintMultiplier = 2;

// Jump physics
const gravity = 50;
const jumpForce = 20;
let isOnGround = true;
const playerHeight = 2;

// Scene objects
let ground: THREE.Mesh;
let ambientLight: THREE.AmbientLight;
let directionalLight: THREE.DirectionalLight;
const portals: THREE.Mesh[] = [];
const portalLabels: THREE.Sprite[] = [];
const decorations: THREE.Object3D[] = [];

// UI Elements
const instructions = document.getElementById('instructions')!;
const planetName = document.getElementById('planet-name')!;
const sectionName = document.getElementById('section-name')!;
const planetDescription = document.getElementById('planet-description')!;

// Click to start
instructions.addEventListener('click', () => {
  controls.lock();
});

controls.addEventListener('lock', () => {
  instructions.style.display = 'none';
});

controls.addEventListener('unlock', () => {
  instructions.style.display = 'flex';
});

// Keyboard controls
document.addEventListener('keydown', (event) => {
  switch (event.code) {
    case 'KeyW':
    case 'ArrowUp':
      movement.forward = true;
      break;
    case 'KeyS':
    case 'ArrowDown':
      movement.backward = true;
      break;
    case 'KeyA':
    case 'ArrowLeft':
      movement.left = true;
      break;
    case 'KeyD':
    case 'ArrowRight':
      movement.right = true;
      break;
    case 'Space':
      if (isOnGround) {
        velocity.y = jumpForce;
        isOnGround = false;
      }
      break;
    case 'ShiftLeft':
    case 'ShiftRight':
      movement.sprint = true;
      break;
  }
});

document.addEventListener('keyup', (event) => {
  switch (event.code) {
    case 'KeyW':
    case 'ArrowUp':
      movement.forward = false;
      break;
    case 'KeyS':
    case 'ArrowDown':
      movement.backward = false;
      break;
    case 'KeyA':
    case 'ArrowLeft':
      movement.left = false;
      break;
    case 'KeyD':
    case 'ArrowRight':
      movement.right = false;
      break;
    case 'ShiftLeft':
    case 'ShiftRight':
      movement.sprint = false;
      break;
  }
});

// Create starfield
function createStarfield(): THREE.Points {
  const geometry = new THREE.BufferGeometry();
  const count = 5000;
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count * 3; i += 3) {
    const radius = 3000 + Math.random() * 2000;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    positions[i] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i + 2] = radius * Math.cos(phi);
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 2,
    sizeAttenuation: true,
  });

  return new THREE.Points(geometry, material);
}

const starfield = createStarfield();
scene.add(starfield);

// Create ground
function createGround(color: number): THREE.Mesh {
  const geometry = new THREE.PlaneGeometry(500, 500, 50, 50);

  // Add some terrain variation
  const positions = geometry.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const distance = Math.sqrt(x * x + y * y);

    // Keep center flat for walking, add hills at edges
    if (distance > 50) {
      const height = Math.sin(x * 0.05) * Math.cos(y * 0.05) * 3 + Math.random() * 0.5;
      positions.setZ(i, height);
    }
  }

  geometry.computeVertexNormals();

  const material = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.9,
    metalness: 0.1,
    flatShading: true,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x = -Math.PI / 2;
  mesh.receiveShadow = true;

  return mesh;
}

// Create portal
function createPortal(targetPlanet: string, angle: number, distance: number): THREE.Mesh {
  const config = planets[targetPlanet];

  // Portal ring
  const ringGeometry = new THREE.TorusGeometry(3, 0.3, 16, 32);
  const ringMaterial = new THREE.MeshStandardMaterial({
    color: config.skyColor,
    emissive: config.lightColor,
    emissiveIntensity: 0.5,
    metalness: 0.8,
    roughness: 0.2,
  });
  const portal = new THREE.Mesh(ringGeometry, ringMaterial);

  // Portal surface (the "wormhole" effect)
  const surfaceGeometry = new THREE.CircleGeometry(2.7, 32);
  const surfaceMaterial = new THREE.MeshBasicMaterial({
    color: config.skyColor,
    transparent: true,
    opacity: 0.7,
    side: THREE.DoubleSide,
  });
  const surface = new THREE.Mesh(surfaceGeometry, surfaceMaterial);
  portal.add(surface);

  // Inner glow
  const glowGeometry = new THREE.CircleGeometry(2.5, 32);
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: config.lightColor,
    transparent: true,
    opacity: 0.4,
  });
  const glow = new THREE.Mesh(glowGeometry, glowMaterial);
  glow.position.z = 0.1;
  portal.add(glow);

  // Position portal
  const x = Math.cos(angle) * distance;
  const z = Math.sin(angle) * distance;
  portal.position.set(x, 3.5, z);
  portal.lookAt(0, 3.5, 0);

  // Store target planet in userData
  portal.userData.targetPlanet = targetPlanet;

  return portal;
}

// Create portal label
function createPortalLabel(text: string, subtext: string): THREE.Sprite {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d')!;
  canvas.width = 512;
  canvas.height = 256;

  context.fillStyle = 'rgba(0, 0, 0, 0.6)';
  context.beginPath();
  context.roundRect(20, 20, canvas.width - 40, canvas.height - 40, 20);
  context.fill();

  context.font = 'bold 42px Arial';
  context.fillStyle = '#ffffff';
  context.textAlign = 'center';
  context.fillText(text, canvas.width / 2, 100);

  context.font = '28px Arial';
  context.fillStyle = '#aaddff';
  context.fillText(subtext, canvas.width / 2, 150);

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(12, 6, 1);

  return sprite;
}

// Create decorations based on planet type
function createDecorations(planetId: string): THREE.Object3D[] {
  const objects: THREE.Object3D[] = [];
  const config = planets[planetId];

  // Add different decorations based on planet
  for (let i = 0; i < 30; i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = 30 + Math.random() * 150;
    const x = Math.cos(angle) * distance;
    const z = Math.sin(angle) * distance;

    let decoration: THREE.Mesh;

    switch (planetId) {
      case 'home':
        // Trees (simple cones)
        const trunkGeo = new THREE.CylinderGeometry(0.3, 0.4, 2, 8);
        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a3728 });
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);

        const leavesGeo = new THREE.ConeGeometry(2, 4, 8);
        const leavesMat = new THREE.MeshStandardMaterial({ color: 0x2d5a2d });
        const leaves = new THREE.Mesh(leavesGeo, leavesMat);
        leaves.position.y = 3;

        decoration = trunk;
        decoration.add(leaves);
        break;

      case 'skills':
        // Floating crystals
        const crystalGeo = new THREE.OctahedronGeometry(1 + Math.random());
        const crystalMat = new THREE.MeshStandardMaterial({
          color: config.lightColor,
          emissive: config.lightColor,
          emissiveIntensity: 0.3,
          metalness: 0.9,
          roughness: 0.1,
        });
        decoration = new THREE.Mesh(crystalGeo, crystalMat);
        decoration.position.y = 2 + Math.random() * 3;
        decoration.rotation.set(Math.random(), Math.random(), Math.random());
        break;

      case 'projects':
        // Anvils/forges (boxes)
        const anvilGeo = new THREE.BoxGeometry(1.5, 1, 2);
        const anvilMat = new THREE.MeshStandardMaterial({
          color: 0x333333,
          metalness: 0.9,
          roughness: 0.3,
        });
        decoration = new THREE.Mesh(anvilGeo, anvilMat);
        decoration.position.y = 0.5;
        break;

      default:
        // Generic rocks
        const rockGeo = new THREE.DodecahedronGeometry(0.5 + Math.random() * 1.5, 0);
        const rockMat = new THREE.MeshStandardMaterial({
          color: config.groundColor,
          roughness: 0.9,
          flatShading: true,
        });
        decoration = new THREE.Mesh(rockGeo, rockMat);
        decoration.position.y = 0.3;
        decoration.rotation.set(Math.random(), Math.random(), Math.random());
    }

    decoration.position.x = x;
    decoration.position.z = z;
    decoration.castShadow = true;
    objects.push(decoration);
  }

  return objects;
}

// Clear current planet
function clearPlanet(): void {
  if (ground) scene.remove(ground);
  portals.forEach((p) => scene.remove(p));
  portalLabels.forEach((l) => scene.remove(l));
  decorations.forEach((d) => scene.remove(d));
  portals.length = 0;
  portalLabels.length = 0;
  decorations.length = 0;
}

// Load planet
function loadPlanet(planetId: string): void {
  clearPlanet();

  const config = planets[planetId];
  currentPlanet = planetId;

  // Update UI
  planetName.textContent = config.name;
  sectionName.textContent = config.section;
  planetDescription.textContent = config.description;

  // Update sky/fog
  scene.background = new THREE.Color(config.skyColor);
  scene.fog = new THREE.FogExp2(config.skyColor, config.fogDensity);

  // Update lighting
  if (ambientLight) scene.remove(ambientLight);
  if (directionalLight) scene.remove(directionalLight);

  ambientLight = new THREE.AmbientLight(config.ambientColor, 0.6);
  scene.add(ambientLight);

  directionalLight = new THREE.DirectionalLight(config.lightColor, config.lightIntensity);
  directionalLight.position.set(50, 100, 50);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 500;
  directionalLight.shadow.camera.left = -100;
  directionalLight.shadow.camera.right = 100;
  directionalLight.shadow.camera.top = 100;
  directionalLight.shadow.camera.bottom = -100;
  scene.add(directionalLight);

  // Create ground
  ground = createGround(config.groundColor);
  scene.add(ground);

  // Create portals
  const connections = portalConnections[planetId];
  const angleStep = (Math.PI * 2) / Math.max(connections.length, 1);

  connections.forEach((targetPlanet, index) => {
    const angle = angleStep * index - Math.PI / 2;
    const portal = createPortal(targetPlanet, angle, 25);
    scene.add(portal);
    portals.push(portal);

    // Add label above portal
    const targetConfig = planets[targetPlanet];
    const label = createPortalLabel(targetConfig.name, targetConfig.section);
    label.position.copy(portal.position);
    label.position.y += 6;
    scene.add(label);
    portalLabels.push(label);
  });

  // Create decorations
  const planetDecorations = createDecorations(planetId);
  planetDecorations.forEach((d) => {
    scene.add(d);
    decorations.push(d);
  });

  // Reset player position
  camera.position.set(0, playerHeight, 0);
  velocity.set(0, 0, 0);
  isOnGround = true;
}

// Initialize first planet
loadPlanet('home');

// Check portal collision
function checkPortalCollision(): void {
  const playerPosition = camera.position.clone();

  for (const portal of portals) {
    const distance = playerPosition.distanceTo(portal.position);

    if (distance < 4) {
      const targetPlanet = portal.userData.targetPlanet;
      loadPlanet(targetPlanet);
      break;
    }
  }
}

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Animation loop
const clock = new THREE.Clock();

function animate(): void {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  const time = clock.getElapsedTime();

  // Animate portals
  portals.forEach((portal, index) => {
    portal.rotation.z = time * 0.5 + index;
    // Pulse the inner glow
    const glow = portal.children[1] as THREE.Mesh;
    if (glow && glow.material instanceof THREE.MeshBasicMaterial) {
      glow.material.opacity = 0.3 + Math.sin(time * 3 + index) * 0.15;
    }
  });

  // Animate floating decorations (crystals on skills planet)
  if (currentPlanet === 'skills') {
    decorations.forEach((dec, i) => {
      dec.position.y = 3 + Math.sin(time + i) * 0.5;
      dec.rotation.y += delta * 0.5;
    });
  }

  // Handle movement
  if (controls.isLocked) {
    // Friction
    velocity.x -= velocity.x * 8.0 * delta;
    velocity.z -= velocity.z * 8.0 * delta;

    // Apply gravity
    velocity.y -= gravity * delta;

    // Direction
    direction.z = Number(movement.forward) - Number(movement.backward);
    direction.x = Number(movement.right) - Number(movement.left);
    direction.normalize();

    const currentSpeed = movement.sprint ? moveSpeed * sprintMultiplier : moveSpeed;

    if (movement.forward || movement.backward) {
      velocity.z -= direction.z * currentSpeed * delta;
    }
    if (movement.left || movement.right) {
      velocity.x -= direction.x * currentSpeed * delta;
    }

    controls.moveRight(-velocity.x * delta);
    controls.moveForward(-velocity.z * delta);
    camera.position.y += velocity.y * delta;

    // Ground collision
    if (camera.position.y < playerHeight) {
      camera.position.y = playerHeight;
      velocity.y = 0;
      isOnGround = true;
    }

    // Keep player in bounds
    const maxDistance = 200;
    const playerDist = Math.sqrt(
      camera.position.x * camera.position.x + camera.position.z * camera.position.z
    );
    if (playerDist > maxDistance) {
      const scale = maxDistance / playerDist;
      camera.position.x *= scale;
      camera.position.z *= scale;
    }

    // Check portal collision
    checkPortalCollision();
  }

  renderer.render(scene, camera);
}

animate();
