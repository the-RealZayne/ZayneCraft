import * as THREE from 'three';

export class SkyEnvironment {
  public readonly starfield: THREE.Group;
  public readonly milkyWay: THREE.Group;
  public readonly nebulas: THREE.Group;
  public readonly cosmicDust: THREE.Group;
  public readonly distantPlanets: THREE.Group;

  constructor() {
    this.starfield = this.createStarfield();
    this.milkyWay = this.createMilkyWay();
    this.nebulas = this.createNebulas();
    this.cosmicDust = this.createCosmicDust();
    this.distantPlanets = this.createDistantPlanets();
  }

  public addToScene(scene: THREE.Scene): void {
    scene.add(this.starfield);
    scene.add(this.milkyWay);
    scene.add(this.nebulas);
    scene.add(this.cosmicDust);
    scene.add(this.distantPlanets);
  }

  private createStarfield(): THREE.Group {
    const group = new THREE.Group();

    // Main stars - small and numerous (upper hemisphere only)
    const smallStarsGeo = new THREE.BufferGeometry();
    const smallCount = 6000;
    const smallPositions = new Float32Array(smallCount * 3);
    const smallColors = new Float32Array(smallCount * 3);
    const smallSizes = new Float32Array(smallCount);

    for (let i = 0; i < smallCount; i++) {
      const radius = 2000 + Math.random() * 3000;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      smallPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      smallPositions[i * 3 + 1] = Math.abs(y) - 100;
      smallPositions[i * 3 + 2] = radius * Math.cos(phi);

      // Vary star colors
      const colorChoice = Math.random();
      if (colorChoice < 0.5) {
        smallColors[i * 3] = 1;
        smallColors[i * 3 + 1] = 1;
        smallColors[i * 3 + 2] = 1;
      } else if (colorChoice < 0.7) {
        smallColors[i * 3] = 0.7;
        smallColors[i * 3 + 1] = 0.85;
        smallColors[i * 3 + 2] = 1;
      } else if (colorChoice < 0.85) {
        smallColors[i * 3] = 1;
        smallColors[i * 3 + 1] = 0.95;
        smallColors[i * 3 + 2] = 0.7;
      } else if (colorChoice < 0.93) {
        smallColors[i * 3] = 1;
        smallColors[i * 3 + 1] = 0.6;
        smallColors[i * 3 + 2] = 0.4;
      } else {
        smallColors[i * 3] = 0.5;
        smallColors[i * 3 + 1] = 0.7;
        smallColors[i * 3 + 2] = 1;
      }

      smallSizes[i] = 0.8 + Math.random() * 1.5;
    }

    smallStarsGeo.setAttribute('position', new THREE.BufferAttribute(smallPositions, 3));
    smallStarsGeo.setAttribute('color', new THREE.BufferAttribute(smallColors, 3));
    smallStarsGeo.setAttribute('size', new THREE.BufferAttribute(smallSizes, 1));

    const smallStarsMat = new THREE.PointsMaterial({
      size: 2,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 1,
      fog: false,
    });

    group.add(new THREE.Points(smallStarsGeo, smallStarsMat));

    // Bright twinkling stars
    const brightStarsGeo = new THREE.BufferGeometry();
    const brightCount = 400;
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
      if (colorChoice < 0.4) {
        brightColors[i * 3] = 1;
        brightColors[i * 3 + 1] = 1;
        brightColors[i * 3 + 2] = 1;
      } else if (colorChoice < 0.7) {
        brightColors[i * 3] = 0.9;
        brightColors[i * 3 + 1] = 0.95;
        brightColors[i * 3 + 2] = 1;
      } else {
        brightColors[i * 3] = 1;
        brightColors[i * 3 + 1] = 0.9;
        brightColors[i * 3 + 2] = 0.7;
      }
    }

    brightStarsGeo.setAttribute('position', new THREE.BufferAttribute(brightPositions, 3));
    brightStarsGeo.setAttribute('color', new THREE.BufferAttribute(brightColors, 3));

    const brightStarsMat = new THREE.PointsMaterial({
      size: 5,
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

    const milkyWayGeo = new THREE.BufferGeometry();
    const count = 15000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const radius = 2100 + Math.random() * 400;
      const theta = Math.random() * Math.PI * 2;
      const bandWidth = 0.3 + Math.random() * 0.2;
      const phi = Math.PI / 2 + (Math.random() - 0.5) * bandWidth;

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.cos(phi);
      positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

      const colorChoice = Math.random();
      if (colorChoice < 0.3) {
        colors[i * 3] = 1;
        colors[i * 3 + 1] = 0.95;
        colors[i * 3 + 2] = 0.85;
      } else if (colorChoice < 0.6) {
        colors[i * 3] = 0.85;
        colors[i * 3 + 1] = 0.9;
        colors[i * 3 + 2] = 1;
      } else {
        colors[i * 3] = 1;
        colors[i * 3 + 1] = 1;
        colors[i * 3 + 2] = 1;
      }

      sizes[i] = 0.5 + Math.random() * 1.5;
    }

    milkyWayGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    milkyWayGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    milkyWayGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const milkyWayMat = new THREE.PointsMaterial({
      size: 2,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      fog: false,
    });

    const milkyWay = new THREE.Points(milkyWayGeo, milkyWayMat);
    milkyWay.rotation.x = Math.PI * 0.15;
    milkyWay.rotation.z = Math.PI * 0.1;
    group.add(milkyWay);

    // Add galactic core glow
    const coreGeo = new THREE.BufferGeometry();
    const coreCount = 3000;
    const corePositions = new Float32Array(coreCount * 3);
    const coreColors = new Float32Array(coreCount * 3);

    for (let i = 0; i < coreCount; i++) {
      const radius = 2050 + Math.random() * 100;
      const theta = (Math.random() - 0.5) * 0.8;
      const phi = Math.PI / 2 + (Math.random() - 0.5) * 0.4;

      corePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      corePositions[i * 3 + 1] = radius * Math.cos(phi);
      corePositions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

      coreColors[i * 3] = 1;
      coreColors[i * 3 + 1] = 0.85 + Math.random() * 0.15;
      coreColors[i * 3 + 2] = 0.6 + Math.random() * 0.2;
    }

    coreGeo.setAttribute('position', new THREE.BufferAttribute(corePositions, 3));
    coreGeo.setAttribute('color', new THREE.BufferAttribute(coreColors, 3));

    const coreMat = new THREE.PointsMaterial({
      size: 3,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      fog: false,
    });

    const core = new THREE.Points(coreGeo, coreMat);
    core.rotation.x = Math.PI * 0.15;
    core.rotation.z = Math.PI * 0.1;
    group.add(core);

    return group;
  }

  private createDistantPlanets(): THREE.Group {
    const group = new THREE.Group();

    // Large distant planet with rings
    const planet1Geo = new THREE.SphereGeometry(120, 32, 32);
    const planet1Mat = new THREE.MeshBasicMaterial({
      color: 0xc4a574,
      transparent: true,
      opacity: 0.7,
      fog: false,
    });
    const planet1 = new THREE.Mesh(planet1Geo, planet1Mat);
    planet1.position.set(1500, 500, -1800);
    group.add(planet1);

    // Planet rings
    const ringGeo = new THREE.RingGeometry(150, 220, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xd4b896,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
      fog: false,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2.5;
    ring.position.copy(planet1.position);
    group.add(ring);

    // Smaller moon
    const moon1Geo = new THREE.SphereGeometry(40, 16, 16);
    const moon1Mat = new THREE.MeshBasicMaterial({
      color: 0xaaaabb,
      transparent: true,
      opacity: 0.8,
      fog: false,
    });
    const moon1 = new THREE.Mesh(moon1Geo, moon1Mat);
    moon1.position.set(-1200, 700, 1600);
    group.add(moon1);

    // Another distant planet
    const planet2Geo = new THREE.SphereGeometry(80, 24, 24);
    const planet2Mat = new THREE.MeshBasicMaterial({
      color: 0x7a9cc6,
      transparent: true,
      opacity: 0.6,
      fog: false,
    });
    const planet2 = new THREE.Mesh(planet2Geo, planet2Mat);
    planet2.position.set(-2000, 300, -1000);
    group.add(planet2);

    // Small rocky moon
    const moon2Geo = new THREE.SphereGeometry(25, 12, 12);
    const moon2Mat = new THREE.MeshBasicMaterial({
      color: 0x888899,
      transparent: true,
      opacity: 0.75,
      fog: false,
    });
    const moon2 = new THREE.Mesh(moon2Geo, moon2Mat);
    moon2.position.set(800, 500, 2000);
    group.add(moon2);

    return group;
  }

  private createNebulas(): THREE.Group {
    const group = new THREE.Group();

    const nebulaColors = [0x4444aa, 0x6622aa, 0x22aa66, 0xaa4466];

    for (let n = 0; n < 6; n++) {
      const nebulaGeo = new THREE.BufferGeometry();
      const count = 300;
      const positions = new Float32Array(count * 3);

      const centerTheta = Math.random() * Math.PI * 2;
      const centerPhi = Math.random() * Math.PI * 0.6 + 0.2;
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
        size: 20 + Math.random() * 25,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending,
        fog: false,
      });

      group.add(new THREE.Points(nebulaGeo, nebulaMat));
    }

    return group;
  }

  private createCosmicDust(): THREE.Group {
    const group = new THREE.Group();

    // Fine dust particles
    const dustGeo = new THREE.BufferGeometry();
    const dustCount = 2500;
    const dustPositions = new Float32Array(dustCount * 3);
    const dustColors = new Float32Array(dustCount * 3);

    for (let i = 0; i < dustCount; i++) {
      const radius = 1800 + Math.random() * 1500;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      dustPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      dustPositions[i * 3 + 1] = Math.abs(y) - 50;
      dustPositions[i * 3 + 2] = radius * Math.cos(phi);

      const colorChoice = Math.random();
      if (colorChoice < 0.7) {
        const grey = 0.3 + Math.random() * 0.3;
        dustColors[i * 3] = grey;
        dustColors[i * 3 + 1] = grey;
        dustColors[i * 3 + 2] = grey;
      } else if (colorChoice < 0.85) {
        dustColors[i * 3] = 0.3;
        dustColors[i * 3 + 1] = 0.35;
        dustColors[i * 3 + 2] = 0.5;
      } else {
        dustColors[i * 3] = 0.5;
        dustColors[i * 3 + 1] = 0.4;
        dustColors[i * 3 + 2] = 0.3;
      }
    }

    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    dustGeo.setAttribute('color', new THREE.BufferAttribute(dustColors, 3));

    const dustMat = new THREE.PointsMaterial({
      size: 1.5,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.5,
      fog: false,
    });

    group.add(new THREE.Points(dustGeo, dustMat));

    // Larger dust clouds
    for (let c = 0; c < 4; c++) {
      const cloudGeo = new THREE.BufferGeometry();
      const cloudCount = 200;
      const cloudPositions = new Float32Array(cloudCount * 3);

      const centerRadius = 2000;
      const centerTheta = Math.random() * Math.PI * 2;
      const centerPhi = Math.random() * Math.PI * 0.4 + 0.1;

      const cx = centerRadius * Math.sin(centerPhi) * Math.cos(centerTheta);
      const cy = Math.abs(centerRadius * Math.cos(centerPhi)) + 100;
      const cz = centerRadius * Math.sin(centerPhi) * Math.sin(centerTheta);

      for (let i = 0; i < cloudCount; i++) {
        const spread = 150 + Math.random() * 200;
        cloudPositions[i * 3] = cx + (Math.random() - 0.5) * spread;
        cloudPositions[i * 3 + 1] = Math.max(cy + (Math.random() - 0.5) * spread, -50);
        cloudPositions[i * 3 + 2] = cz + (Math.random() - 0.5) * spread;
      }

      cloudGeo.setAttribute('position', new THREE.BufferAttribute(cloudPositions, 3));

      const cloudMat = new THREE.PointsMaterial({
        color: 0x8888aa,
        size: 5 + Math.random() * 3,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.2,
        blending: THREE.AdditiveBlending,
        fog: false,
      });

      group.add(new THREE.Points(cloudGeo, cloudMat));
    }

    return group;
  }

  public update(delta: number, time: number): void {
    // Animate twinkling stars
    this.starfield.children.forEach((child) => {
      if (child instanceof THREE.Points && child.userData.isTwinkling) {
        const material = child.material as THREE.PointsMaterial;
        material.opacity = 0.7 + Math.sin(time * 2) * 0.2;
      }
    });

    // Slowly rotate distant planets, milky way, and cosmic dust
    this.distantPlanets.rotation.y += delta * 0.005;
    this.milkyWay.rotation.y += delta * 0.002;
    this.cosmicDust.rotation.y += delta * 0.001;
    this.cosmicDust.rotation.x += delta * 0.0005;
  }
}
