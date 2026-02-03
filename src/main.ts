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
let ground: THREE.Group;
let ambientLight: THREE.AmbientLight;
let directionalLight: THREE.DirectionalLight;
const portals: THREE.Group[] = [];
const portalLabels: THREE.Group[] = [];
const decorations: THREE.Object3D[] = [];
let terminal: THREE.Group | null = null;

// UI Elements
const instructions = document.getElementById('instructions')!;
const planetName = document.getElementById('planet-name')!;
const sectionName = document.getElementById('section-name')!;
const planetDescription = document.getElementById('planet-description')!;
const hologramPanel = document.getElementById('hologram-panel')!;

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

// Create enhanced starfield with varying sizes and colors
function createStarfield(): THREE.Group {
  const group = new THREE.Group();

  // Main stars - small and numerous
  const smallStarsGeo = new THREE.BufferGeometry();
  const smallCount = 8000;
  const smallPositions = new Float32Array(smallCount * 3);
  const smallColors = new Float32Array(smallCount * 3);

  for (let i = 0; i < smallCount; i++) {
    const radius = 2000 + Math.random() * 3000;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    smallPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    smallPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    smallPositions[i * 3 + 2] = radius * Math.cos(phi);

    // Vary star colors slightly (white, blue-white, yellow-white)
    const colorChoice = Math.random();
    if (colorChoice < 0.7) {
      smallColors[i * 3] = 1;
      smallColors[i * 3 + 1] = 1;
      smallColors[i * 3 + 2] = 1;
    } else if (colorChoice < 0.85) {
      smallColors[i * 3] = 0.8;
      smallColors[i * 3 + 1] = 0.9;
      smallColors[i * 3 + 2] = 1;
    } else {
      smallColors[i * 3] = 1;
      smallColors[i * 3 + 1] = 0.95;
      smallColors[i * 3 + 2] = 0.8;
    }
  }

  smallStarsGeo.setAttribute('position', new THREE.BufferAttribute(smallPositions, 3));
  smallStarsGeo.setAttribute('color', new THREE.BufferAttribute(smallColors, 3));

  const smallStarsMat = new THREE.PointsMaterial({
    size: 1.5,
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
  });

  group.add(new THREE.Points(smallStarsGeo, smallStarsMat));

  // Bright stars - larger and fewer
  const brightStarsGeo = new THREE.BufferGeometry();
  const brightCount = 500;
  const brightPositions = new Float32Array(brightCount * 3);

  for (let i = 0; i < brightCount; i++) {
    const radius = 2500 + Math.random() * 2000;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    brightPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    brightPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    brightPositions[i * 3 + 2] = radius * Math.cos(phi);
  }

  brightStarsGeo.setAttribute('position', new THREE.BufferAttribute(brightPositions, 3));

  const brightStarsMat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 4,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.9,
  });

  group.add(new THREE.Points(brightStarsGeo, brightStarsMat));

  return group;
}

// Create nebula clouds
function createNebulas(): THREE.Group {
  const group = new THREE.Group();

  const nebulaColors = [
    0x4444aa, // Blue
    0x6622aa, // Purple
    0x22aa66, // Teal
    0xaa4466, // Pink
  ];

  for (let n = 0; n < 6; n++) {
    const nebulaGeo = new THREE.BufferGeometry();
    const count = 300;
    const positions = new Float32Array(count * 3);

    // Random position on sky sphere
    const centerTheta = Math.random() * Math.PI * 2;
    const centerPhi = Math.random() * Math.PI * 0.6 + 0.2; // Mostly above horizon
    const radius = 2200;

    const cx = radius * Math.sin(centerPhi) * Math.cos(centerTheta);
    const cy = radius * Math.cos(centerPhi);
    const cz = radius * Math.sin(centerPhi) * Math.sin(centerTheta);

    for (let i = 0; i < count; i++) {
      const spread = 400 + Math.random() * 300;
      positions[i * 3] = cx + (Math.random() - 0.5) * spread;
      positions[i * 3 + 1] = cy + (Math.random() - 0.5) * spread;
      positions[i * 3 + 2] = cz + (Math.random() - 0.5) * spread;
    }

    nebulaGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const nebulaMat = new THREE.PointsMaterial({
      color: nebulaColors[n % nebulaColors.length],
      size: 15 + Math.random() * 20,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
    });

    group.add(new THREE.Points(nebulaGeo, nebulaMat));
  }

  return group;
}

const starfield = createStarfield();
scene.add(starfield);

const nebulas = createNebulas();
scene.add(nebulas);

// Create ambient skybox with gradient
function createSkybox(): THREE.Mesh {
  const skyGeometry = new THREE.SphereGeometry(2500, 32, 32);

  const skyMaterial = new THREE.ShaderMaterial({
    uniforms: {
      topColor: { value: new THREE.Color(0x0a0a20) },
      bottomColor: { value: new THREE.Color(0x000000) },
      horizonColor: { value: new THREE.Color(0x1a1a3a) },
      offset: { value: 20 },
      exponent: { value: 0.6 },
    },
    vertexShader: `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 topColor;
      uniform vec3 bottomColor;
      uniform vec3 horizonColor;
      uniform float offset;
      uniform float exponent;
      varying vec3 vWorldPosition;
      void main() {
        float h = normalize(vWorldPosition + offset).y;
        float t = max(pow(max(h, 0.0), exponent), 0.0);
        vec3 sky = mix(horizonColor, topColor, t);
        float b = max(pow(max(-h, 0.0), exponent * 0.5), 0.0);
        sky = mix(sky, bottomColor, b);
        gl_FragColor = vec4(sky, 1.0);
      }
    `,
    side: THREE.BackSide,
  });

  return new THREE.Mesh(skyGeometry, skyMaterial);
}

let skybox = createSkybox();
scene.add(skybox);

// Update skybox colors based on planet
function updateSkybox(config: PlanetConfig): void {
  const material = skybox.material as THREE.ShaderMaterial;

  // Create variations of the sky color
  const baseColor = new THREE.Color(config.skyColor);
  const topColor = baseColor.clone().multiplyScalar(0.5);
  const horizonColor = baseColor.clone().lerp(new THREE.Color(config.lightColor), 0.15);

  material.uniforms.topColor.value = topColor;
  material.uniforms.horizonColor.value = horizonColor;
  material.uniforms.bottomColor.value = new THREE.Color(0x000000);
}

// Simplex-like noise function for terrain
function noise(x: number, y: number): number {
  const n = Math.sin(x * 0.1) * Math.cos(y * 0.1) +
            Math.sin(x * 0.05 + 1.3) * Math.cos(y * 0.07 + 0.7) * 0.5 +
            Math.sin(x * 0.02 + 2.1) * Math.cos(y * 0.03 + 1.2) * 0.25;
  return n;
}

// Create ground with more detailed terrain
function createGround(color: number): THREE.Group {
  const group = new THREE.Group();

  // Main terrain
  const geometry = new THREE.PlaneGeometry(600, 600, 120, 120);

  const positions = geometry.attributes.position;
  const colors = new Float32Array(positions.count * 3);

  const baseColor = new THREE.Color(color);
  const darkColor = baseColor.clone().multiplyScalar(0.6);
  const lightColor = baseColor.clone().multiplyScalar(1.3);

  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const distance = Math.sqrt(x * x + y * y);

    // Multi-layered terrain height
    let height = 0;

    // Keep center relatively flat for gameplay
    if (distance > 40) {
      const falloff = Math.min((distance - 40) / 60, 1);

      // Large rolling hills
      height += noise(x, y) * 8 * falloff;

      // Medium bumps
      height += noise(x * 2, y * 2) * 3 * falloff;

      // Small detail
      height += noise(x * 5, y * 5) * 0.8 * falloff;

      // Random micro-detail
      height += (Math.random() - 0.5) * 0.3 * falloff;
    }

    positions.setZ(i, height);

    // Vertex colors based on height
    const heightRatio = (height + 5) / 15;
    const vertexColor = darkColor.clone().lerp(lightColor, Math.max(0, Math.min(1, heightRatio)));
    colors[i * 3] = vertexColor.r;
    colors[i * 3 + 1] = vertexColor.g;
    colors[i * 3 + 2] = vertexColor.b;
  }

  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.computeVertexNormals();

  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.85,
    metalness: 0.1,
    flatShading: true,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x = -Math.PI / 2;
  mesh.receiveShadow = true;
  group.add(mesh);

  // Add scattered rocks/details on terrain
  for (let i = 0; i < 60; i++) {
    const rockGeo = new THREE.DodecahedronGeometry(0.3 + Math.random() * 0.8, 0);
    const rockMat = new THREE.MeshStandardMaterial({
      color: baseColor.clone().multiplyScalar(0.7 + Math.random() * 0.3),
      roughness: 0.9,
      flatShading: true,
    });
    const rock = new THREE.Mesh(rockGeo, rockMat);

    const angle = Math.random() * Math.PI * 2;
    const dist = 50 + Math.random() * 200;
    rock.position.set(
      Math.cos(angle) * dist,
      0.2 + Math.random() * 0.3,
      Math.sin(angle) * dist
    );
    rock.rotation.set(Math.random(), Math.random(), Math.random());
    rock.castShadow = true;
    group.add(rock);
  }

  return group;
}

// Create portal - Particle Vortex
function createPortal(targetPlanet: string, angle: number, distance: number): THREE.Group {
  const config = planets[targetPlanet];
  const portal = new THREE.Group();

  const particleCount = 800;
  const vortexHeight = 15;
  const vortexRadius = 6;

  // Create particle geometry
  const positions = new Float32Array(particleCount * 3);
  const angles = new Float32Array(particleCount);
  const radii = new Float32Array(particleCount);
  const speeds = new Float32Array(particleCount);
  const heights = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i++) {
    angles[i] = Math.random() * Math.PI * 2;
    radii[i] = 0.3 + Math.random() * vortexRadius;
    speeds[i] = 0.5 + Math.random() * 1.5;
    heights[i] = Math.random() * vortexHeight;

    const x = Math.cos(angles[i]) * radii[i];
    const y = heights[i];
    const z = Math.sin(angles[i]) * radii[i];

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
  }

  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const particleMaterial = new THREE.PointsMaterial({
    color: config.lightColor,
    size: 0.35,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
  });

  const particles = new THREE.Points(particleGeometry, particleMaterial);
  portal.add(particles);

  // Store animation data
  portal.userData.angles = angles;
  portal.userData.radii = radii;
  portal.userData.speeds = speeds;
  portal.userData.heights = heights;
  portal.userData.vortexHeight = vortexHeight;
  portal.userData.vortexRadius = vortexRadius;

  // Central core glow
  const coreGeometry = new THREE.SphereGeometry(1.2, 16, 16);
  const coreMaterial = new THREE.MeshBasicMaterial({
    color: config.lightColor,
    transparent: true,
    opacity: 0.95,
  });
  const core = new THREE.Mesh(coreGeometry, coreMaterial);
  core.position.y = vortexHeight / 2;
  portal.add(core);

  // Outer core glow
  const glowGeometry = new THREE.SphereGeometry(2.5, 16, 16);
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: config.lightColor,
    transparent: true,
    opacity: 0.35,
  });
  const glow = new THREE.Mesh(glowGeometry, glowMaterial);
  glow.position.y = vortexHeight / 2;
  portal.add(glow);

  // Extra outer glow for more presence
  const outerGlowGeometry = new THREE.SphereGeometry(4, 16, 16);
  const outerGlowMaterial = new THREE.MeshBasicMaterial({
    color: config.lightColor,
    transparent: true,
    opacity: 0.15,
  });
  const outerGlow = new THREE.Mesh(outerGlowGeometry, outerGlowMaterial);
  outerGlow.position.y = vortexHeight / 2;
  portal.add(outerGlow);

  // Point light - more powerful
  const portalLight = new THREE.PointLight(config.lightColor, 5, 50);
  portalLight.position.y = vortexHeight / 2;
  portal.add(portalLight);

  // Ground ring glow
  const ringGeometry = new THREE.RingGeometry(vortexRadius * 0.8, vortexRadius * 1.2, 32);
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: config.lightColor,
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide,
  });
  const ring = new THREE.Mesh(ringGeometry, ringMaterial);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.05;
  portal.add(ring);

  // Position portal
  const x = Math.cos(angle) * distance;
  const z = Math.sin(angle) * distance;
  portal.position.set(x, 0, z);

  // Store target planet in userData
  portal.userData.targetPlanet = targetPlanet;

  return portal;
}

// Create portal label
function createPortalLabel(text: string, subtext: string, color: number): THREE.Group {
  const group = new THREE.Group();

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d')!;
  canvas.width = 512;
  canvas.height = 200;

  // Convert color to CSS
  const r = (color >> 16) & 255;
  const g = (color >> 8) & 255;
  const b = color & 255;

  // Gradient background
  const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.1)`);
  gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.3)`);
  gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.1)`);

  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  // Glowing border lines
  context.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.8)`;
  context.lineWidth = 3;
  context.beginPath();
  context.moveTo(50, 20);
  context.lineTo(canvas.width - 50, 20);
  context.stroke();
  context.beginPath();
  context.moveTo(50, canvas.height - 20);
  context.lineTo(canvas.width - 50, canvas.height - 20);
  context.stroke();

  // Planet name
  context.font = 'bold 52px Arial';
  context.fillStyle = '#ffffff';
  context.textAlign = 'center';
  context.shadowColor = `rgb(${r}, ${g}, ${b})`;
  context.shadowBlur = 20;
  context.fillText(text, canvas.width / 2, 85);

  // Section name
  context.font = '300 28px Arial';
  context.fillStyle = `rgb(${Math.min(r + 50, 255)}, ${Math.min(g + 50, 255)}, ${Math.min(b + 50, 255)})`;
  context.shadowBlur = 10;
  context.fillText(subtext.toUpperCase(), canvas.width / 2, 140);

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
  });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(10, 4, 1);
  group.add(sprite);

  return group;
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

// Create hologram terminal for home planet
function createTerminal(): THREE.Group {
  const terminalGroup = new THREE.Group();

  // Base pedestal
  const baseGeo = new THREE.CylinderGeometry(0.8, 1, 0.3, 16);
  const baseMat = new THREE.MeshStandardMaterial({
    color: 0x333344,
    metalness: 0.8,
    roughness: 0.3,
  });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = 0.15;
  terminalGroup.add(base);

  // Main pillar
  const pillarGeo = new THREE.CylinderGeometry(0.3, 0.5, 1.2, 16);
  const pillarMat = new THREE.MeshStandardMaterial({
    color: 0x444455,
    metalness: 0.9,
    roughness: 0.2,
  });
  const pillar = new THREE.Mesh(pillarGeo, pillarMat);
  pillar.position.y = 0.9;
  terminalGroup.add(pillar);

  // Top platform
  const topGeo = new THREE.CylinderGeometry(0.6, 0.4, 0.2, 16);
  const topMat = new THREE.MeshStandardMaterial({
    color: 0x555566,
    metalness: 0.9,
    roughness: 0.2,
  });
  const top = new THREE.Mesh(topGeo, topMat);
  top.position.y = 1.6;
  terminalGroup.add(top);

  // Hologram emitter ring
  const emitterGeo = new THREE.TorusGeometry(0.5, 0.05, 8, 32);
  const emitterMat = new THREE.MeshBasicMaterial({
    color: 0x00ffff,
    transparent: true,
    opacity: 0.8,
  });
  const emitter = new THREE.Mesh(emitterGeo, emitterMat);
  emitter.rotation.x = Math.PI / 2;
  emitter.position.y = 1.75;
  terminalGroup.add(emitter);

  // Hologram beam particles
  const beamParticleCount = 50;
  const beamPositions = new Float32Array(beamParticleCount * 3);
  for (let i = 0; i < beamParticleCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * 0.4;
    beamPositions[i * 3] = Math.cos(angle) * radius;
    beamPositions[i * 3 + 1] = 1.8 + Math.random() * 2;
    beamPositions[i * 3 + 2] = Math.sin(angle) * radius;
  }
  const beamGeo = new THREE.BufferGeometry();
  beamGeo.setAttribute('position', new THREE.BufferAttribute(beamPositions, 3));
  const beamMat = new THREE.PointsMaterial({
    color: 0x00ffff,
    size: 0.08,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
  });
  const beam = new THREE.Points(beamGeo, beamMat);
  terminalGroup.add(beam);

  // Point light for glow
  const light = new THREE.PointLight(0x00ffff, 1, 10);
  light.position.y = 2.5;
  terminalGroup.add(light);

  // Interaction prompt sprite
  const promptCanvas = document.createElement('canvas');
  const ctx = promptCanvas.getContext('2d')!;
  promptCanvas.width = 256;
  promptCanvas.height = 64;
  ctx.fillStyle = 'rgba(0, 255, 255, 0.8)';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('[ Approach to interact ]', 128, 40);
  const promptTexture = new THREE.CanvasTexture(promptCanvas);
  const promptMat = new THREE.SpriteMaterial({ map: promptTexture, transparent: true });
  const prompt = new THREE.Sprite(promptMat);
  prompt.scale.set(4, 1, 1);
  prompt.position.y = 4;
  terminalGroup.add(prompt);

  // Position in front of spawn, offset so portals are behind player
  terminalGroup.position.set(0, 0, -8);

  return terminalGroup;
}

// Clear current planet
function clearPlanet(): void {
  if (ground) scene.remove(ground);
  if (terminal) {
    scene.remove(terminal);
    terminal = null;
  }
  portals.forEach((p) => scene.remove(p));
  portalLabels.forEach((l) => scene.remove(l));
  decorations.forEach((d) => scene.remove(d));
  portals.length = 0;
  portalLabels.length = 0;
  decorations.length = 0;
  hologramPanel.classList.remove('visible');
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
  scene.background = null; // Skybox handles background
  scene.fog = new THREE.FogExp2(config.skyColor, config.fogDensity);
  updateSkybox(config);

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
    const label = createPortalLabel(targetConfig.name, targetConfig.section, targetConfig.lightColor);
    label.position.copy(portal.position);
    label.position.y = 18;
    scene.add(label);
    portalLabels.push(label);
  });

  // Create decorations
  const planetDecorations = createDecorations(planetId);
  planetDecorations.forEach((d) => {
    scene.add(d);
    decorations.push(d);
  });

  // Add hologram terminal on home planet
  if (planetId === 'home') {
    terminal = createTerminal();
    scene.add(terminal);
  }

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

    if (distance < 7) {
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

  // Animate portals - particle vortex
  portals.forEach((portal, index) => {
    const particles = portal.children[0] as THREE.Points;
    const positions = particles.geometry.attributes.position.array as Float32Array;
    const angles = portal.userData.angles as Float32Array;
    const radii = portal.userData.radii as Float32Array;
    const speeds = portal.userData.speeds as Float32Array;
    const heights = portal.userData.heights as Float32Array;
    const vortexHeight = portal.userData.vortexHeight as number;

    const particleCount = angles.length;

    for (let i = 0; i < particleCount; i++) {
      // Rotate around center
      angles[i] += speeds[i] * delta * 2;

      // Move upward and spiral inward
      heights[i] += delta * (0.5 + speeds[i] * 0.5);

      // As particles rise, they spiral inward
      const heightRatio = heights[i] / vortexHeight;
      const currentRadius = radii[i] * (1 - heightRatio * 0.8);

      // Reset when reaching top
      if (heights[i] > vortexHeight) {
        heights[i] = 0;
        angles[i] = Math.random() * Math.PI * 2;
      }

      const x = Math.cos(angles[i]) * currentRadius;
      const y = heights[i];
      const z = Math.sin(angles[i]) * currentRadius;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }

    particles.geometry.attributes.position.needsUpdate = true;

    // Pulse the core and glows
    const pulse = Math.sin(time * 3 + index) * 0.5 + 0.5;
    const core = portal.children[1] as THREE.Mesh;
    const glow = portal.children[2] as THREE.Mesh;
    const outerGlow = portal.children[3] as THREE.Mesh;
    const light = portal.children[4] as THREE.PointLight;

    if (core?.material instanceof THREE.MeshBasicMaterial) {
      core.material.opacity = 0.8 + pulse * 0.2;
    }
    if (glow?.material instanceof THREE.MeshBasicMaterial) {
      glow.material.opacity = 0.25 + pulse * 0.2;
    }
    if (outerGlow?.material instanceof THREE.MeshBasicMaterial) {
      outerGlow.material.opacity = 0.1 + pulse * 0.1;
    }

    const glowScale = 1 + pulse * 0.25;
    glow.scale.set(glowScale, glowScale, glowScale);
    const outerScale = 1 + pulse * 0.15;
    outerGlow.scale.set(outerScale, outerScale, outerScale);

    if (light) {
      light.intensity = 3 + pulse * 3;
    }

    // Rotate ground ring
    const ring = portal.children[5] as THREE.Mesh;
    if (ring) {
      ring.rotation.z = time * 0.5;
    }
  });

  // Animate floating decorations (crystals on skills planet)
  if (currentPlanet === 'skills') {
    decorations.forEach((dec, i) => {
      dec.position.y = 3 + Math.sin(time + i) * 0.5;
      dec.rotation.y += delta * 0.5;
    });
  }

  // Animate terminal on home planet
  if (terminal) {
    // Animate emitter ring rotation
    const emitter = terminal.children[3] as THREE.Mesh;
    if (emitter) {
      emitter.rotation.z = time * 2;
    }

    // Animate beam particles
    const beam = terminal.children[4] as THREE.Points;
    if (beam) {
      const positions = beam.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length / 3; i++) {
        positions[i * 3 + 1] += delta * 2;
        if (positions[i * 3 + 1] > 4) {
          positions[i * 3 + 1] = 1.8;
        }
      }
      beam.geometry.attributes.position.needsUpdate = true;
    }

    // Pulse the light
    const light = terminal.children[5] as THREE.PointLight;
    if (light) {
      light.intensity = 1 + Math.sin(time * 3) * 0.5;
    }

    // Check proximity for hologram panel
    const distanceToTerminal = camera.position.distanceTo(terminal.position);
    if (distanceToTerminal < 5) {
      hologramPanel.classList.add('visible');
    } else {
      hologramPanel.classList.remove('visible');
    }
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
