import * as THREE from 'three';
import { planets } from '../config/planets';

export class Portal {
  public static create(targetPlanet: string, angle: number, distance: number): THREE.Group {
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

    // Extra outer glow
    const outerGlowGeometry = new THREE.SphereGeometry(4, 16, 16);
    const outerGlowMaterial = new THREE.MeshBasicMaterial({
      color: config.lightColor,
      transparent: true,
      opacity: 0.15,
    });
    const outerGlow = new THREE.Mesh(outerGlowGeometry, outerGlowMaterial);
    outerGlow.position.y = vortexHeight / 2;
    portal.add(outerGlow);

    // Point light
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

  public static createLabel(text: string, subtext: string, color: number): THREE.Group {
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

  public static animate(
    portal: THREE.Group,
    delta: number,
    time: number,
    index: number
  ): void {
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
  }
}
