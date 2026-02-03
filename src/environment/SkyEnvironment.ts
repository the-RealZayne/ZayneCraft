import * as THREE from 'three';

export class SkyEnvironment {
  public readonly starfield: THREE.Group;
  public readonly milkyWay: THREE.Group;

  constructor() {
    this.starfield = this.createStarfield();
    this.milkyWay = this.createMilkyWay();
  }

  public addToScene(scene: THREE.Scene): void {
    scene.add(this.starfield);
    scene.add(this.milkyWay);
  }

  private createStarfield(): THREE.Group {
    const group = new THREE.Group();

    // Main stars - small and numerous (upper hemisphere only)
    const smallStarsGeo = new THREE.BufferGeometry();
    const smallCount = 10000;
    const smallPositions = new Float32Array(smallCount * 3);
    const smallColors = new Float32Array(smallCount * 3);

    for (let i = 0; i < smallCount; i++) {
      const radius = 2000 + Math.random() * 3000;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      smallPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      smallPositions[i * 3 + 1] = Math.abs(y) - 100;
      smallPositions[i * 3 + 2] = radius * Math.cos(phi);

      // Vary star colors - mostly white with subtle tints
      const colorChoice = Math.random();
      if (colorChoice < 0.6) {
        // White
        smallColors[i * 3] = 1;
        smallColors[i * 3 + 1] = 1;
        smallColors[i * 3 + 2] = 1;
      } else if (colorChoice < 0.75) {
        // Slight blue tint
        smallColors[i * 3] = 0.85;
        smallColors[i * 3 + 1] = 0.9;
        smallColors[i * 3 + 2] = 1;
      } else if (colorChoice < 0.88) {
        // Slight warm tint
        smallColors[i * 3] = 1;
        smallColors[i * 3 + 1] = 0.95;
        smallColors[i * 3 + 2] = 0.85;
      } else {
        // Slight cool blue
        smallColors[i * 3] = 0.9;
        smallColors[i * 3 + 1] = 0.95;
        smallColors[i * 3 + 2] = 1;
      }
    }

    smallStarsGeo.setAttribute('position', new THREE.BufferAttribute(smallPositions, 3));
    smallStarsGeo.setAttribute('color', new THREE.BufferAttribute(smallColors, 3));

    const smallStarsMat = new THREE.PointsMaterial({
      size: 1.5,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 1,
      fog: false,
    });

    group.add(new THREE.Points(smallStarsGeo, smallStarsMat));

    // Medium brightness stars
    const mediumStarsGeo = new THREE.BufferGeometry();
    const mediumCount = 3000;
    const mediumPositions = new Float32Array(mediumCount * 3);
    const mediumColors = new Float32Array(mediumCount * 3);

    for (let i = 0; i < mediumCount; i++) {
      const radius = 2200 + Math.random() * 2500;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      mediumPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      mediumPositions[i * 3 + 1] = Math.abs(y) - 100;
      mediumPositions[i * 3 + 2] = radius * Math.cos(phi);

      const colorChoice = Math.random();
      if (colorChoice < 0.5) {
        mediumColors[i * 3] = 1;
        mediumColors[i * 3 + 1] = 1;
        mediumColors[i * 3 + 2] = 1;
      } else if (colorChoice < 0.75) {
        mediumColors[i * 3] = 0.9;
        mediumColors[i * 3 + 1] = 0.95;
        mediumColors[i * 3 + 2] = 1;
      } else {
        mediumColors[i * 3] = 1;
        mediumColors[i * 3 + 1] = 0.95;
        mediumColors[i * 3 + 2] = 0.9;
      }
    }

    mediumStarsGeo.setAttribute('position', new THREE.BufferAttribute(mediumPositions, 3));
    mediumStarsGeo.setAttribute('color', new THREE.BufferAttribute(mediumColors, 3));

    const mediumStarsMat = new THREE.PointsMaterial({
      size: 2.5,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      fog: false,
    });

    group.add(new THREE.Points(mediumStarsGeo, mediumStarsMat));

    // Bright twinkling stars
    const brightStarsGeo = new THREE.BufferGeometry();
    const brightCount = 600;
    const brightPositions = new Float32Array(brightCount * 3);
    const brightColors = new Float32Array(brightCount * 3);

    for (let i = 0; i < brightCount; i++) {
      const radius = 2500 + Math.random() * 2000;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      brightPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      brightPositions[i * 3 + 1] = Math.abs(y) - 100;
      brightPositions[i * 3 + 2] = radius * Math.cos(phi);

      const colorChoice = Math.random();
      if (colorChoice < 0.5) {
        brightColors[i * 3] = 1;
        brightColors[i * 3 + 1] = 1;
        brightColors[i * 3 + 2] = 1;
      } else if (colorChoice < 0.75) {
        brightColors[i * 3] = 0.9;
        brightColors[i * 3 + 1] = 0.95;
        brightColors[i * 3 + 2] = 1;
      } else {
        brightColors[i * 3] = 1;
        brightColors[i * 3 + 1] = 0.95;
        brightColors[i * 3 + 2] = 0.85;
      }
    }

    brightStarsGeo.setAttribute('position', new THREE.BufferAttribute(brightPositions, 3));
    brightStarsGeo.setAttribute('color', new THREE.BufferAttribute(brightColors, 3));

    const brightStarsMat = new THREE.PointsMaterial({
      size: 3.5,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 1,
      fog: false,
    });

    const brightStars = new THREE.Points(brightStarsGeo, brightStarsMat);
    brightStars.userData.isTwinkling = true;
    group.add(brightStars);

    return group;
  }

  private createMilkyWay(): THREE.Group {
    const group = new THREE.Group();

    // Main milky way band - dense star cluster
    const milkyWayGeo = new THREE.BufferGeometry();
    const count = 25000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const radius = 2100 + Math.random() * 400;
      const theta = Math.random() * Math.PI * 2;
      const bandWidth = 0.25 + Math.random() * 0.25;
      const phi = Math.PI / 2 + (Math.random() - 0.5) * bandWidth;

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.cos(phi);
      positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

      const colorChoice = Math.random();
      if (colorChoice < 0.4) {
        colors[i * 3] = 1;
        colors[i * 3 + 1] = 1;
        colors[i * 3 + 2] = 1;
      } else if (colorChoice < 0.65) {
        colors[i * 3] = 0.9;
        colors[i * 3 + 1] = 0.95;
        colors[i * 3 + 2] = 1;
      } else if (colorChoice < 0.85) {
        colors[i * 3] = 1;
        colors[i * 3 + 1] = 0.98;
        colors[i * 3 + 2] = 0.9;
      } else {
        colors[i * 3] = 0.95;
        colors[i * 3 + 1] = 0.95;
        colors[i * 3 + 2] = 1;
      }
    }

    milkyWayGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    milkyWayGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const milkyWayMat = new THREE.PointsMaterial({
      size: 1.8,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      fog: false,
    });

    const milkyWay = new THREE.Points(milkyWayGeo, milkyWayMat);
    milkyWay.rotation.x = Math.PI * 0.15;
    milkyWay.rotation.z = Math.PI * 0.1;
    group.add(milkyWay);

    // Galactic core - denser concentration
    const coreGeo = new THREE.BufferGeometry();
    const coreCount = 5000;
    const corePositions = new Float32Array(coreCount * 3);
    const coreColors = new Float32Array(coreCount * 3);

    for (let i = 0; i < coreCount; i++) {
      const radius = 2050 + Math.random() * 100;
      const theta = (Math.random() - 0.5) * 0.8;
      const phi = Math.PI / 2 + (Math.random() - 0.5) * 0.35;

      corePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      corePositions[i * 3 + 1] = radius * Math.cos(phi);
      corePositions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

      // Warmer colors towards the core
      const warmth = Math.random();
      coreColors[i * 3] = 1;
      coreColors[i * 3 + 1] = 0.9 + warmth * 0.1;
      coreColors[i * 3 + 2] = 0.8 + warmth * 0.15;
    }

    coreGeo.setAttribute('position', new THREE.BufferAttribute(corePositions, 3));
    coreGeo.setAttribute('color', new THREE.BufferAttribute(coreColors, 3));

    const coreMat = new THREE.PointsMaterial({
      size: 2,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      fog: false,
    });

    const core = new THREE.Points(coreGeo, coreMat);
    core.rotation.x = Math.PI * 0.15;
    core.rotation.z = Math.PI * 0.1;
    group.add(core);

    // Outer halo - faint diffuse stars
    const haloGeo = new THREE.BufferGeometry();
    const haloCount = 8000;
    const haloPositions = new Float32Array(haloCount * 3);
    const haloColors = new Float32Array(haloCount * 3);

    for (let i = 0; i < haloCount; i++) {
      const radius = 2000 + Math.random() * 500;
      const theta = Math.random() * Math.PI * 2;
      const bandWidth = 0.4 + Math.random() * 0.3;
      const phi = Math.PI / 2 + (Math.random() - 0.5) * bandWidth;

      haloPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      haloPositions[i * 3 + 1] = radius * Math.cos(phi);
      haloPositions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

      // Soft white/blue tint
      haloColors[i * 3] = 0.9;
      haloColors[i * 3 + 1] = 0.92;
      haloColors[i * 3 + 2] = 1;
    }

    haloGeo.setAttribute('position', new THREE.BufferAttribute(haloPositions, 3));
    haloGeo.setAttribute('color', new THREE.BufferAttribute(haloColors, 3));

    const haloMat = new THREE.PointsMaterial({
      size: 1.2,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
      fog: false,
    });

    const halo = new THREE.Points(haloGeo, haloMat);
    halo.rotation.x = Math.PI * 0.15;
    halo.rotation.z = Math.PI * 0.1;
    group.add(halo);

    return group;
  }

  public update(delta: number, time: number): void {
    // Animate twinkling stars
    this.starfield.children.forEach((child) => {
      if (child instanceof THREE.Points && child.userData.isTwinkling) {
        const material = child.material as THREE.PointsMaterial;
        material.opacity = 0.8 + Math.sin(time * 2) * 0.2;
      }
    });

    // Slowly rotate milky way for subtle movement
    this.milkyWay.rotation.y += delta * 0.001;
  }
}
