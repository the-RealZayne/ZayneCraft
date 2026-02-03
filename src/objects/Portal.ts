import * as THREE from 'three';
import { planets } from '../config/planets';

export class Portal {
  public static create(targetPlanet: string, angle: number, distance: number): THREE.Group {
    const config = planets[targetPlanet];
    const tent = new THREE.Group();

    const width = 6;
    const depth = 5;
    const height = 4;

    const canvasColor = 0xd4c4a8;
    const canvasMat = new THREE.MeshStandardMaterial({
      color: canvasColor,
      side: THREE.DoubleSide,
      roughness: 0.85,
    });

    // Calculate roof panel dimensions
    const roofWidth = Math.sqrt((width / 2) * (width / 2) + height * height);

    // Left roof panel
    const leftRoofGeo = new THREE.PlaneGeometry(roofWidth, depth);
    const leftRoof = new THREE.Mesh(leftRoofGeo, canvasMat);
    const roofAngle = Math.atan2(height, width / 2);
    leftRoof.rotation.set(0, 0, roofAngle - Math.PI / 2);
    leftRoof.rotation.order = 'YXZ';
    leftRoof.rotateY(Math.PI / 2);
    leftRoof.position.set(-width / 4, height / 2, 0);
    leftRoof.castShadow = true;
    leftRoof.receiveShadow = true;
    tent.add(leftRoof);

    // Right roof panel
    const rightRoof = new THREE.Mesh(leftRoofGeo, canvasMat);
    rightRoof.rotation.set(0, 0, -(roofAngle - Math.PI / 2));
    rightRoof.rotation.order = 'YXZ';
    rightRoof.rotateY(Math.PI / 2);
    rightRoof.position.set(width / 4, height / 2, 0);
    rightRoof.castShadow = true;
    rightRoof.receiveShadow = true;
    tent.add(rightRoof);

    // Back triangle - using custom geometry
    const backGeo = new THREE.BufferGeometry();
    const backVertices = new Float32Array([
      -width / 2, 0, -depth / 2,
      width / 2, 0, -depth / 2,
      0, height, -depth / 2,
    ]);
    backGeo.setAttribute('position', new THREE.BufferAttribute(backVertices, 3));
    backGeo.computeVertexNormals();
    const back = new THREE.Mesh(backGeo, canvasMat);
    back.castShadow = true;
    tent.add(back);

    // Floor inside tent
    const floorGeo = new THREE.PlaneGeometry(width - 0.5, depth - 0.5);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x6b5a4a,
      roughness: 1,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0.02;
    tent.add(floor);

    // Magical elements
    const glowColor = config.lightColor;

    // Inner glow
    const glowGeo = new THREE.SphereGeometry(0.7, 16, 16);
    const glowMat = new THREE.MeshBasicMaterial({
      color: glowColor,
      transparent: true,
      opacity: 0.8,
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.position.set(0, 1, 0);
    tent.add(glow);

    // Outer glow
    const outerGlowGeo = new THREE.SphereGeometry(1.3, 16, 16);
    const outerGlowMat = new THREE.MeshBasicMaterial({
      color: glowColor,
      transparent: true,
      opacity: 0.3,
    });
    const outerGlow = new THREE.Mesh(outerGlowGeo, outerGlowMat);
    outerGlow.position.set(0, 1, 0);
    tent.add(outerGlow);

    // Light
    const tentLight = new THREE.PointLight(glowColor, 3, 20);
    tentLight.position.set(0, 1.5, 0);
    tent.add(tentLight);

    // Particles
    const particleCount = 40;
    const particlePositions = new Float32Array(particleCount * 3);
    const particlePhases = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 4;
      particlePositions[i * 3 + 1] = Math.random() * 2.5 + 0.3;
      particlePositions[i * 3 + 2] = Math.random() * 4;
      particlePhases[i] = Math.random() * Math.PI * 2;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: glowColor,
      size: 0.1,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    tent.add(particles);

    tent.userData.particlePhases = particlePhases;
    tent.userData.originalParticlePositions = particlePositions.slice();

    // Entrance rug
    const rugGeo = new THREE.PlaneGeometry(3, 2);
    const rugMat = new THREE.MeshStandardMaterial({
      color: glowColor,
      transparent: true,
      opacity: 0.35,
      roughness: 0.9,
    });
    const rug = new THREE.Mesh(rugGeo, rugMat);
    rug.rotation.x = -Math.PI / 2;
    rug.position.set(0, 0.03, depth / 2 + 1);
    tent.add(rug);

    // Position tent
    const x = Math.cos(angle) * distance;
    const z = Math.sin(angle) * distance;
    tent.position.set(x, 0, z);

    // Point tent toward the campfire at (0, 0, -8)
    const campfireZ = -8;
    tent.rotation.y = Math.atan2(-x, campfireZ - z);

    tent.userData.targetPlanet = targetPlanet;

    return tent;
  }

  public static createLabel(text: string, subtext: string, color: number): THREE.Group {
    const group = new THREE.Group();

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    canvas.width = 512;
    canvas.height = 200;

    const r = (color >> 16) & 255;
    const g = (color >> 8) & 255;
    const b = color & 255;

    const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.1)`);
    gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.3)`);
    gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.1)`);

    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

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

    context.font = 'bold 52px Arial';
    context.fillStyle = '#ffffff';
    context.textAlign = 'center';
    context.shadowColor = `rgb(${r}, ${g}, ${b})`;
    context.shadowBlur = 20;
    context.fillText(text, canvas.width / 2, 85);

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
    _delta: number,
    time: number,
    index: number
  ): void {
    // Children: leftRoof(0), rightRoof(1), back(2), floor(3), glow(4), outerGlow(5), light(6), particles(7), rug(8)
    const glow = portal.children[4] as THREE.Mesh;
    const outerGlow = portal.children[5] as THREE.Mesh;
    const light = portal.children[6] as THREE.PointLight;
    const particles = portal.children[7] as THREE.Points;
    const rug = portal.children[8] as THREE.Mesh;

    const pulse = Math.sin(time * 2 + index) * 0.5 + 0.5;

    if (glow?.material instanceof THREE.MeshBasicMaterial) {
      glow.material.opacity = 0.6 + pulse * 0.3;
      const scale = 1 + pulse * 0.3;
      glow.scale.set(scale, scale, scale);
    }

    if (outerGlow?.material instanceof THREE.MeshBasicMaterial) {
      outerGlow.material.opacity = 0.2 + pulse * 0.2;
      const scale = 1 + pulse * 0.2;
      outerGlow.scale.set(scale, scale, scale);
    }

    if (light) {
      light.intensity = 2.5 + pulse * 2;
    }

    if (particles && particles.geometry) {
      const positions = particles.geometry.attributes.position.array as Float32Array;
      const phases = portal.userData.particlePhases as Float32Array;
      const original = portal.userData.originalParticlePositions as Float32Array;

      if (phases && original) {
        for (let i = 0; i < positions.length / 3; i++) {
          const phase = phases[i];
          positions[i * 3] = original[i * 3] + Math.sin(time + phase) * 0.5;
          positions[i * 3 + 1] = original[i * 3 + 1] + Math.sin(time * 1.5 + phase) * 0.4;
          positions[i * 3 + 2] = original[i * 3 + 2] + Math.cos(time * 0.8 + phase) * 0.3;
        }
        particles.geometry.attributes.position.needsUpdate = true;
      }
    }

    if (rug?.material instanceof THREE.MeshStandardMaterial) {
      rug.material.opacity = 0.25 + pulse * 0.2;
    }
  }
}
