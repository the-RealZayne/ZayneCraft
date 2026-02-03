import * as THREE from 'three';
import { planets } from '../config/planets';
import { Campus } from './Campus';
import { Terrain } from '../environment/Terrain';

export class Decorations {
  // Check if position is too close to portal zone (portals are at distance 25)
  private static isNearPortal(x: number, z: number): boolean {
    const distance = Math.sqrt(x * x + z * z);
    return distance > 12 && distance < 40;
  }

  private static createRock(scale: number): THREE.Mesh {
    const geo = new THREE.DodecahedronGeometry(scale, 0);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x6b6b6b,
      roughness: 0.9,
      flatShading: true,
    });
    const rock = new THREE.Mesh(geo, mat);
    rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    rock.castShadow = true;
    return rock;
  }

  private static createBush(): THREE.Group {
    const bush = new THREE.Group();
    const bushMat = new THREE.MeshStandardMaterial({ color: 0x2a4a2a });

    // Multiple spheres for organic bush shape
    for (let i = 0; i < 4; i++) {
      const size = 0.4 + Math.random() * 0.4;
      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(size, 8, 6),
        bushMat
      );
      sphere.position.set(
        (Math.random() - 0.5) * 0.6,
        size * 0.8,
        (Math.random() - 0.5) * 0.6
      );
      sphere.castShadow = true;
      bush.add(sphere);
    }
    return bush;
  }

  private static createMushroom(): THREE.Group {
    const mushroom = new THREE.Group();

    // Stem
    const stemGeo = new THREE.CylinderGeometry(0.08, 0.1, 0.3, 8);
    const stemMat = new THREE.MeshStandardMaterial({ color: 0xf5f5dc });
    const stem = new THREE.Mesh(stemGeo, stemMat);
    stem.position.y = 0.15;
    mushroom.add(stem);

    // Cap
    const capGeo = new THREE.SphereGeometry(0.2, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2);
    const capMat = new THREE.MeshStandardMaterial({ color: 0xcc4444 });
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.position.y = 0.3;
    cap.castShadow = true;
    mushroom.add(cap);

    return mushroom;
  }

  private static createFlower(): THREE.Group {
    const flower = new THREE.Group();

    // Stem
    const stemGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.4, 6);
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x228b22 });
    const stem = new THREE.Mesh(stemGeo, stemMat);
    stem.position.y = 0.2;
    flower.add(stem);

    // Flower head - random color
    const colors = [0xff69b4, 0xffff00, 0xff6347, 0x9370db, 0xffffff];
    const petalMat = new THREE.MeshStandardMaterial({
      color: colors[Math.floor(Math.random() * colors.length)]
    });

    // Petals
    for (let i = 0; i < 5; i++) {
      const petal = new THREE.Mesh(
        new THREE.SphereGeometry(0.06, 6, 6),
        petalMat
      );
      const angle = (i / 5) * Math.PI * 2;
      petal.position.set(
        Math.cos(angle) * 0.08,
        0.4,
        Math.sin(angle) * 0.08
      );
      flower.add(petal);
    }

    // Center
    const center = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 6, 6),
      new THREE.MeshStandardMaterial({ color: 0xffd700 })
    );
    center.position.y = 0.4;
    flower.add(center);

    return flower;
  }

  private static createPond(): THREE.Group {
    const pond = new THREE.Group();
    const pondRadius = 6;

    // Pond bed (darker underneath)
    const bedGeo = new THREE.CircleGeometry(pondRadius + 0.5, 32);
    const bedMat = new THREE.MeshStandardMaterial({
      color: 0x2a3a2a,
      roughness: 1,
    });
    const bed = new THREE.Mesh(bedGeo, bedMat);
    bed.rotation.x = -Math.PI / 2;
    bed.position.y = -0.15;
    pond.add(bed);

    // Water surface
    const waterGeo = new THREE.CircleGeometry(pondRadius, 32);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x3a6a8a,
      transparent: true,
      opacity: 0.7,
      roughness: 0.1,
      metalness: 0.3,
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.y = -0.05;
    pond.add(water);

    // Bank/edge rocks
    const rockCount = 20;
    for (let i = 0; i < rockCount; i++) {
      const angle = (i / rockCount) * Math.PI * 2 + Math.random() * 0.3;
      const dist = pondRadius + 0.2 + Math.random() * 0.8;
      const rockSize = 0.3 + Math.random() * 0.4;

      const rockGeo = new THREE.DodecahedronGeometry(rockSize, 0);
      const rockMat = new THREE.MeshStandardMaterial({
        color: 0x555555 + Math.floor(Math.random() * 0x222222),
        roughness: 0.9,
        flatShading: true,
      });
      const rock = new THREE.Mesh(rockGeo, rockMat);
      rock.position.set(
        Math.cos(angle) * dist,
        rockSize * 0.3,
        Math.sin(angle) * dist
      );
      rock.rotation.set(Math.random(), Math.random(), Math.random());
      rock.castShadow = true;
      pond.add(rock);
    }

    // Reeds/cattails around edges
    const reedClusters = 6;
    for (let c = 0; c < reedClusters; c++) {
      const clusterAngle = (c / reedClusters) * Math.PI * 2 + Math.random() * 0.5;
      const clusterDist = pondRadius - 0.5 + Math.random() * 1.5;

      const reedCount = 4 + Math.floor(Math.random() * 4);
      for (let i = 0; i < reedCount; i++) {
        const reedHeight = 1 + Math.random() * 1.5;
        const reedGeo = new THREE.CylinderGeometry(0.02, 0.03, reedHeight, 6);
        const reedMat = new THREE.MeshStandardMaterial({ color: 0x4a5a3a });
        const reed = new THREE.Mesh(reedGeo, reedMat);

        const offsetAngle = clusterAngle + (Math.random() - 0.5) * 0.4;
        const offsetDist = clusterDist + (Math.random() - 0.5) * 0.5;
        reed.position.set(
          Math.cos(offsetAngle) * offsetDist,
          reedHeight / 2,
          Math.sin(offsetAngle) * offsetDist
        );
        reed.rotation.x = (Math.random() - 0.5) * 0.1;
        reed.rotation.z = (Math.random() - 0.5) * 0.1;
        pond.add(reed);

        // Cattail top on some reeds
        if (Math.random() > 0.4) {
          const cattailGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.25, 8);
          const cattailMat = new THREE.MeshStandardMaterial({ color: 0x4a3a2a });
          const cattail = new THREE.Mesh(cattailGeo, cattailMat);
          cattail.position.set(
            Math.cos(offsetAngle) * offsetDist,
            reedHeight - 0.1,
            Math.sin(offsetAngle) * offsetDist
          );
          pond.add(cattail);
        }
      }
    }

    // A few small stones in the water
    for (let i = 0; i < 4; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 0.5 + Math.random() * 2;
      const stoneGeo = new THREE.SphereGeometry(0.15 + Math.random() * 0.15, 6, 5);
      const stoneMat = new THREE.MeshStandardMaterial({
        color: 0x667766,
        roughness: 0.7,
      });
      const stone = new THREE.Mesh(stoneGeo, stoneMat);
      stone.position.set(
        Math.cos(angle) * dist,
        -0.02,
        Math.sin(angle) * dist
      );
      stone.scale.y = 0.5;
      pond.add(stone);
    }

    return pond;
  }

  private static createMoss(): THREE.Mesh {
    const size = 0.5 + Math.random() * 1;
    const mossGeo = new THREE.CircleGeometry(size, 8);
    const mossMat = new THREE.MeshStandardMaterial({
      color: 0x3a5f3a,
      roughness: 1,
    });
    const moss = new THREE.Mesh(mossGeo, mossMat);
    moss.rotation.x = -Math.PI / 2;
    moss.rotation.z = Math.random() * Math.PI * 2;
    return moss;
  }

  private static createSteppingStone(): THREE.Mesh {
    const size = 0.4 + Math.random() * 0.3;
    const stoneGeo = new THREE.CylinderGeometry(size, size * 1.1, 0.1, 8);
    const stoneMat = new THREE.MeshStandardMaterial({
      color: 0x666666,
      roughness: 0.9,
      flatShading: true,
    });
    const stone = new THREE.Mesh(stoneGeo, stoneMat);
    stone.rotation.y = Math.random() * Math.PI;
    return stone;
  }

  private static createFireflyCluster(centerX: number, centerZ: number, count: number): THREE.Group {
    const group = new THREE.Group();

    const positions = new Float32Array(count * 3);
    const phases = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 12;
      positions[i * 3] = centerX + Math.cos(angle) * dist;
      positions[i * 3 + 1] = 0.5 + Math.random() * 3;
      positions[i * 3 + 2] = centerZ + Math.sin(angle) * dist;
      phases[i] = Math.random() * Math.PI * 2;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('phase', new THREE.BufferAttribute(phases, 1));

    const material = new THREE.PointsMaterial({
      color: 0xaaff44,
      size: 0.12,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    const fireflies = new THREE.Points(geometry, material);
    fireflies.userData.isFireflies = true;
    fireflies.userData.originalPositions = positions.slice();
    group.add(fireflies);

    return group;
  }

  private static createFireflies(pondX: number, pondZ: number, pondRadius: number): THREE.Group {
    const group = new THREE.Group();
    const fireflyCount = 50;

    const positions = new Float32Array(fireflyCount * 3);
    const phases = new Float32Array(fireflyCount);

    // Helper to check if in pond
    const isInPond = (x: number, z: number): boolean => {
      const dx = x - pondX;
      const dz = z - pondZ;
      return dx * dx + dz * dz < (pondRadius + 1) * (pondRadius + 1);
    };

    let placed = 0;
    let attempts = 0;
    while (placed < fireflyCount && attempts < 200) {
      attempts++;
      const angle = Math.random() * Math.PI * 2;
      const distance = 2 + Math.random() * 18;
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;

      // Avoid pond but allow fireflies near it (they look nice by water)
      if (isInPond(x, z) && distance < pondRadius - 1) continue;

      positions[placed * 3] = x;
      positions[placed * 3 + 1] = 0.5 + Math.random() * 2.5;
      positions[placed * 3 + 2] = z;
      phases[placed] = Math.random() * Math.PI * 2;
      placed++;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('phase', new THREE.BufferAttribute(phases, 1));

    const material = new THREE.PointsMaterial({
      color: 0xaaff44,
      size: 0.15,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    const fireflies = new THREE.Points(geometry, material);
    fireflies.userData.isFireflies = true;
    fireflies.userData.originalPositions = positions.slice();
    group.add(fireflies);

    // Add subtle glow light
    const glowLight = new THREE.PointLight(0xaaff44, 0.3, 20);
    glowLight.position.y = 1.5;
    group.add(glowLight);

    return group;
  }

  private static createLantern(): THREE.Group {
    const lantern = new THREE.Group();

    // Post
    const postGeo = new THREE.CylinderGeometry(0.08, 0.1, 2, 6);
    const postMat = new THREE.MeshStandardMaterial({ color: 0x4a3728 });
    const post = new THREE.Mesh(postGeo, postMat);
    post.position.y = 1;
    post.castShadow = true;
    lantern.add(post);

    // Lantern housing (top)
    const housingGeo = new THREE.BoxGeometry(0.4, 0.5, 0.4);
    const housingMat = new THREE.MeshStandardMaterial({ color: 0x3d3d3d });
    const housing = new THREE.Mesh(housingGeo, housingMat);
    housing.position.y = 2.25;
    housing.castShadow = true;
    lantern.add(housing);

    // Glass/light part
    const glassGeo = new THREE.BoxGeometry(0.3, 0.35, 0.3);
    const glassMat = new THREE.MeshBasicMaterial({
      color: 0xffaa44,
      transparent: true,
      opacity: 0.8
    });
    const glass = new THREE.Mesh(glassGeo, glassMat);
    glass.position.y = 2.25;
    lantern.add(glass);

    // Roof
    const roofGeo = new THREE.ConeGeometry(0.3, 0.2, 4);
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = 2.6;
    roof.rotation.y = Math.PI / 4;
    lantern.add(roof);

    // Light
    const light = new THREE.PointLight(0xffaa44, 0.8, 12);
    light.position.y = 2.25;
    lantern.add(light);

    return lantern;
  }

  private static createBirdHouse(): THREE.Group {
    const birdHouse = new THREE.Group();

    // Main body
    const bodyGeo = new THREE.BoxGeometry(0.5, 0.6, 0.4);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x8b7355 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.castShadow = true;
    birdHouse.add(body);

    // Roof
    const roofGeo = new THREE.ConeGeometry(0.45, 0.3, 4);
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x5c4033 });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = 0.45;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    birdHouse.add(roof);

    // Entrance hole
    const holeGeo = new THREE.CircleGeometry(0.1, 8);
    const holeMat = new THREE.MeshBasicMaterial({ color: 0x1a1a1a });
    const hole = new THREE.Mesh(holeGeo, holeMat);
    hole.position.set(0, 0.05, 0.21);
    birdHouse.add(hole);

    // Perch
    const perchGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.15, 6);
    const perchMat = new THREE.MeshStandardMaterial({ color: 0x4a3728 });
    const perch = new THREE.Mesh(perchGeo, perchMat);
    perch.rotation.x = Math.PI / 2;
    perch.position.set(0, -0.1, 0.27);
    birdHouse.add(perch);

    return birdHouse;
  }

  private static createBench(): THREE.Group {
    const bench = new THREE.Group();
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x5c4033 });

    // Seat planks
    for (let i = 0; i < 3; i++) {
      const plankGeo = new THREE.BoxGeometry(2, 0.08, 0.25);
      const plank = new THREE.Mesh(plankGeo, woodMat);
      plank.position.set(0, 0.5, -0.25 + i * 0.28);
      plank.castShadow = true;
      bench.add(plank);
    }

    // Legs
    const legPositions = [
      [-0.8, 0.25, -0.2],
      [-0.8, 0.25, 0.2],
      [0.8, 0.25, -0.2],
      [0.8, 0.25, 0.2]
    ];
    for (const pos of legPositions) {
      const legGeo = new THREE.BoxGeometry(0.1, 0.5, 0.1);
      const leg = new THREE.Mesh(legGeo, woodMat);
      leg.position.set(pos[0], pos[1], pos[2]);
      leg.castShadow = true;
      bench.add(leg);
    }

    // Back rest
    for (let i = 0; i < 2; i++) {
      const backGeo = new THREE.BoxGeometry(2, 0.08, 0.15);
      const back = new THREE.Mesh(backGeo, woodMat);
      back.position.set(0, 0.7 + i * 0.2, -0.35);
      back.rotation.x = 0.1;
      back.castShadow = true;
      bench.add(back);
    }

    // Back supports
    const supportPositions = [-0.8, 0, 0.8];
    for (const x of supportPositions) {
      const supportGeo = new THREE.BoxGeometry(0.08, 0.6, 0.08);
      const support = new THREE.Mesh(supportGeo, woodMat);
      support.position.set(x, 0.75, -0.35);
      support.castShadow = true;
      bench.add(support);
    }

    return bench;
  }

  private static createFern(): THREE.Group {
    const fern = new THREE.Group();
    const fernMat = new THREE.MeshStandardMaterial({
      color: 0x2e5a1c,
      side: THREE.DoubleSide
    });

    // Multiple fronds radiating out
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + Math.random() * 0.3;
      const frondLength = 0.6 + Math.random() * 0.3;

      const frondGeo = new THREE.PlaneGeometry(0.15, frondLength);
      const frond = new THREE.Mesh(frondGeo, fernMat);
      frond.position.set(
        Math.cos(angle) * 0.1,
        frondLength / 2,
        Math.sin(angle) * 0.1
      );
      frond.rotation.x = -0.4 - Math.random() * 0.3;
      frond.rotation.y = angle;
      fern.add(frond);
    }
    return fern;
  }

  private static createTallGrass(): THREE.Group {
    const grass = new THREE.Group();
    const grassMat = new THREE.MeshStandardMaterial({
      color: 0x3d6b2a,
      side: THREE.DoubleSide
    });

    // Several grass blades
    const bladeCount = 5 + Math.floor(Math.random() * 4);
    for (let i = 0; i < bladeCount; i++) {
      const height = 0.4 + Math.random() * 0.4;
      const bladeGeo = new THREE.PlaneGeometry(0.05, height);
      const blade = new THREE.Mesh(bladeGeo, grassMat);
      blade.position.set(
        (Math.random() - 0.5) * 0.3,
        height / 2,
        (Math.random() - 0.5) * 0.3
      );
      blade.rotation.y = Math.random() * Math.PI;
      blade.rotation.x = (Math.random() - 0.5) * 0.2;
      grass.add(blade);
    }
    return grass;
  }

  private static createLog(): THREE.Group {
    const log = new THREE.Group();

    const length = 2 + Math.random() * 2;
    const radius = 0.3 + Math.random() * 0.2;

    // Main log - lying flat on ground
    const logGeo = new THREE.CylinderGeometry(radius, radius * 1.1, length, 8);
    const logMat = new THREE.MeshStandardMaterial({ color: 0x4a3728 });
    const logMesh = new THREE.Mesh(logGeo, logMat);
    logMesh.rotation.z = Math.PI / 2;
    logMesh.castShadow = true;
    log.add(logMesh);

    // End caps (lighter wood)
    const endMat = new THREE.MeshStandardMaterial({ color: 0x8b7355 });
    const endGeo = new THREE.CircleGeometry(radius, 8);

    const end1 = new THREE.Mesh(endGeo, endMat);
    end1.rotation.y = Math.PI / 2;
    end1.position.set(length / 2, 0, 0);
    log.add(end1);

    const end2 = new THREE.Mesh(endGeo, endMat);
    end2.rotation.y = -Math.PI / 2;
    end2.position.set(-length / 2, 0, 0);
    log.add(end2);

    // Store radius for positioning
    log.userData.radius = radius;

    return log;
  }

  private static createCabin(): THREE.Group {
    const cabin = new THREE.Group();

    // Main cabin body
    const bodyWidth = 6;
    const bodyDepth = 5;
    const bodyHeight = 3;
    const bodyGeo = new THREE.BoxGeometry(bodyWidth, bodyHeight, bodyDepth);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x5c4033 }); // Dark wood
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = bodyHeight / 2;
    body.castShadow = true;
    body.receiveShadow = true;
    cabin.add(body);

    // Roof
    const roofGeo = new THREE.ConeGeometry(5, 2.5, 4);
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 }); // Saddle brown
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = bodyHeight + 1.25;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    cabin.add(roof);

    // Door
    const doorGeo = new THREE.BoxGeometry(1.2, 2, 0.1);
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x3d2817 });
    const door = new THREE.Mesh(doorGeo, doorMat);
    door.position.set(0, 1, bodyDepth / 2 + 0.05);
    cabin.add(door);

    // Windows
    const windowGeo = new THREE.BoxGeometry(0.8, 0.8, 0.1);
    const windowMat = new THREE.MeshStandardMaterial({
      color: 0x87ceeb,
      emissive: 0xffaa44,
      emissiveIntensity: 0.3
    });

    const window1 = new THREE.Mesh(windowGeo, windowMat);
    window1.position.set(-1.5, 1.5, bodyDepth / 2 + 0.05);
    cabin.add(window1);

    const window2 = new THREE.Mesh(windowGeo, windowMat);
    window2.position.set(1.5, 1.5, bodyDepth / 2 + 0.05);
    cabin.add(window2);

    return cabin;
  }

  private static createTree(scale: number): THREE.Group {
    const tree = new THREE.Group();

    const trunkHeight = 5 * scale;
    const trunkGeo = new THREE.CylinderGeometry(0.3 * scale, 0.5 * scale, trunkHeight, 8);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a3728 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = trunkHeight / 2;
    trunk.castShadow = true;
    tree.add(trunk);

    // Layered foliage
    const leavesMat = new THREE.MeshStandardMaterial({ color: 0x2d5a2d });

    const leaves1 = new THREE.Mesh(
      new THREE.ConeGeometry(3 * scale, 4 * scale, 8),
      leavesMat
    );
    leaves1.position.y = trunkHeight + 1 * scale;
    leaves1.castShadow = true;
    tree.add(leaves1);

    const leaves2 = new THREE.Mesh(
      new THREE.ConeGeometry(2.2 * scale, 3 * scale, 8),
      leavesMat
    );
    leaves2.position.y = trunkHeight + 3 * scale;
    leaves2.castShadow = true;
    tree.add(leaves2);

    const leaves3 = new THREE.Mesh(
      new THREE.ConeGeometry(1.4 * scale, 2 * scale, 8),
      leavesMat
    );
    leaves3.position.y = trunkHeight + 4.5 * scale;
    leaves3.castShadow = true;
    tree.add(leaves3);

    return tree;
  }

  public static create(planetId: string): THREE.Object3D[] {
    const objects: THREE.Object3D[] = [];
    const config = planets[planetId];

    // Education planet gets the full campus
    if (planetId === 'education') {
      return Campus.create();
    }

    // Home planet gets lots of trees
    if (planetId === 'home') {
      // Cabin position (near spawn but away from portals which are at distance 25)
      const cabinX = -20;
      const cabinZ = 35;
      const cabinClearance = 12; // Keep trees away from cabin

      let treesPlaced = 0;
      let attempts = 0;
      const minTreeSpacing = 12; // Minimum distance between trees
      const treesPositions: { x: number; z: number }[] = [];

      // Helper to check if position is too close to existing trees
      const isTooCloseToOtherTrees = (x: number, z: number): boolean => {
        for (const pos of treesPositions) {
          const dx = x - pos.x;
          const dz = z - pos.z;
          if (dx * dx + dz * dz < minTreeSpacing * minTreeSpacing) {
            return true;
          }
        }
        return false;
      };

      // Helper to check if too close to cabin
      const isTooCloseToCabin = (x: number, z: number): boolean => {
        const dx = x - cabinX;
        const dz = z - cabinZ;
        return dx * dx + dz * dz < cabinClearance * cabinClearance;
      };

      while (treesPlaced < 200 && attempts < 1500) {
        attempts++;

        const angle = Math.random() * Math.PI * 2;
        // Spread trees from inner ring to outer boundary
        const distance = 20 + Math.random() * 185;
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;

        // Skip if too close to portal area
        if (this.isNearPortal(x, z)) {
          continue;
        }

        // Skip if too close to cabin
        if (isTooCloseToCabin(x, z)) {
          continue;
        }

        // Skip if too close to another tree
        if (isTooCloseToOtherTrees(x, z)) {
          continue;
        }

        const scale = 1.0 + Math.random() * 1.2;
        const tree = this.createTree(scale);

        const terrainY = Terrain.getTerrainHeight(x, z);
        tree.position.set(x, terrainY, z);
        tree.rotation.y = Math.random() * Math.PI * 2;

        treesPositions.push({ x, z });
        objects.push(tree);
        treesPlaced++;
      }

      // Add a single cabin near spawn point (uses cabinX, cabinZ defined above)
      const cabin = this.createCabin();
      cabin.position.set(cabinX, Terrain.getTerrainHeight(cabinX, cabinZ), cabinZ);
      // Face the cabin towards spawn (0, 0)
      cabin.rotation.y = Math.atan2(-cabinX, -cabinZ);
      objects.push(cabin);

      // Add a bench near the campfire (campfire is at 0, 0, -8)
      const bench = this.createBench();
      const benchX = 3;
      const benchZ = -6;
      bench.position.set(benchX, Terrain.getTerrainHeight(benchX, benchZ), benchZ);
      // Calculate angle to face the campfire
      const campfireX = 0;
      const campfireZ = -8;
      bench.rotation.y = Math.atan2(campfireX - benchX, campfireZ - benchZ);
      objects.push(bench);

      // Add stepping stones - path curves around the pond from spawn to campfire
      // Path goes: spawn (0,0) -> around pond -> campfire (0,-8)
      const stonePath = [
        { x: -2, z: 0 },
        { x: -4, z: -1 },
        { x: -5, z: -3 },
        { x: -4, z: -5 },
        { x: -2, z: -7 },
        { x: 0, z: -6 },
      ];
      for (const pos of stonePath) {
        const stone = this.createSteppingStone();
        const sx = pos.x + (Math.random() - 0.5) * 0.5;
        const sz = pos.z + (Math.random() - 0.5) * 0.5;
        stone.position.set(sx, Terrain.getTerrainHeight(sx, sz) + 0.05, sz);
        objects.push(stone);
      }

      // Pond position (opposite side from campfire)
      const pondX = 0;
      const pondZ = 5;
      const pondRadius = 6;

      // Helper to check if too close to campfire (at 0, 0, -8)
      const isNearCampfire = (x: number, z: number): boolean => {
        const dx = x - 0;
        const dz = z - (-8);
        return dx * dx + dz * dz < 4 * 4;
      };

      // Helper to check if in pond area
      const isInPond = (x: number, z: number): boolean => {
        const dx = x - pondX;
        const dz = z - pondZ;
        return dx * dx + dz * dz < (pondRadius + 2) * (pondRadius + 2);
      };

      // Add the pond
      const pond = this.createPond();
      pond.position.set(pondX, Terrain.getTerrainHeight(pondX, pondZ) - 0.2, pondZ);
      objects.push(pond);

      // Add moss patches around (avoiding campfire and pond)
      for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = 2 + Math.random() * 10;
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;

        if (isNearCampfire(x, z) || isInPond(x, z)) continue;

        const moss = this.createMoss();
        moss.position.set(x, Terrain.getTerrainHeight(x, z) + 0.01, z);
        objects.push(moss);
      }

      // Most flowers spread throughout the outer areas
      for (let i = 0; i < 150; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = 42 + Math.random() * 140; // distance 42-182 (wide spread)
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;

        const clusterSize = 4 + Math.floor(Math.random() * 5);
        for (let j = 0; j < clusterSize; j++) {
          const flower = this.createFlower();
          const ox = (Math.random() - 0.5) * 3;
          const oz = (Math.random() - 0.5) * 3;
          flower.position.set(x + ox, Terrain.getTerrainHeight(x + ox, z + oz), z + oz);
          flower.scale.setScalar(0.6 + Math.random() * 0.5);
          objects.push(flower);
        }
      }

      // Add fireflies - multiple clusters spread around the world
      // Center area fireflies
      const centerFireflies = this.createFireflies(pondX, pondZ, pondRadius);
      objects.push(centerFireflies);

      // Add more firefly clusters throughout the forest
      const fireflyClusterPositions = [
        { x: 50, z: 30 },
        { x: -60, z: 40 },
        { x: 70, z: -50 },
        { x: -40, z: -70 },
        { x: 100, z: 0 },
        { x: -80, z: -20 },
        { x: 30, z: 90 },
        { x: -50, z: 80 },
        { x: 80, z: 60 },
        { x: -100, z: 50 },
      ];

      for (const pos of fireflyClusterPositions) {
        const clusterFireflies = this.createFireflyCluster(pos.x, pos.z, 15 + Math.random() * 10);
        objects.push(clusterFireflies);
      }

      // Add more elements to fill the middle area
      // Rocks around the pond and campfire
      for (let i = 0; i < 15; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = 3 + Math.random() * 10;
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;

        if (isNearCampfire(x, z) || isInPond(x, z)) continue;

        const rock = this.createRock(0.3 + Math.random() * 0.5);
        rock.position.set(x, Terrain.getTerrainHeight(x, z) + 0.15, z);
        objects.push(rock);
      }

      // Tall grass clusters in middle
      for (let i = 0; i < 30; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = 4 + Math.random() * 8;
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;

        if (isNearCampfire(x, z) || isInPond(x, z)) continue;

        const grass = this.createTallGrass();
        grass.position.set(x, Terrain.getTerrainHeight(x, z), z);
        objects.push(grass);
      }

      // Ferns around the pond edge
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2 + Math.random() * 0.3;
        const dist = pondRadius + 2 + Math.random() * 2;
        const x = pondX + Math.cos(angle) * dist;
        const z = pondZ + Math.sin(angle) * dist;

        if (isNearCampfire(x, z)) continue;

        const fern = this.createFern();
        fern.position.set(x, Terrain.getTerrainHeight(x, z), z);
        fern.rotation.y = angle + Math.PI;
        fern.scale.setScalar(0.8 + Math.random() * 0.4);
        objects.push(fern);
      }

      // Small flower patches near the path
      for (let i = 0; i < 8; i++) {
        const pathPoint = stonePath[Math.floor(Math.random() * stonePath.length)];
        const offsetAngle = Math.random() * Math.PI * 2;
        const offsetDist = 1.5 + Math.random() * 1.5;
        const x = pathPoint.x + Math.cos(offsetAngle) * offsetDist;
        const z = pathPoint.z + Math.sin(offsetAngle) * offsetDist;

        if (isNearCampfire(x, z) || isInPond(x, z)) continue;

        for (let j = 0; j < 3; j++) {
          const flower = this.createFlower();
          const fx = x + (Math.random() - 0.5) * 1;
          const fz = z + (Math.random() - 0.5) * 1;
          flower.position.set(fx, Terrain.getTerrainHeight(fx, fz), fz);
          flower.scale.setScalar(0.5 + Math.random() * 0.4);
          objects.push(flower);
        }
      }

      // Bushes between campfire and pond
      const middleBushPositions = [
        { x: -3, z: -2 },
        { x: 4, z: -1 },
        { x: -5, z: 2 },
        { x: 5, z: 3 },
        { x: -2, z: -4 },
      ];
      for (const pos of middleBushPositions) {
        if (isNearCampfire(pos.x, pos.z) || isInPond(pos.x, pos.z)) continue;
        const bush = this.createBush();
        bush.position.set(pos.x, Terrain.getTerrainHeight(pos.x, pos.z), pos.z);
        objects.push(bush);
      }

      // A few logs near the campfire for seating
      const seatLogPositions = [
        { x: -2.5, z: -9, rot: 0.3 },
        { x: 2.5, z: -9.5, rot: -0.2 },
      ];
      for (const pos of seatLogPositions) {
        const log = this.createLog();
        const radius = log.userData.radius || 0.4;
        log.position.set(pos.x, Terrain.getTerrainHeight(pos.x, pos.z) + radius, pos.z);
        log.rotation.y = pos.rot;
        objects.push(log);
      }

      // Add lanterns around the area
      const lanternPositions = [
        { x: -12, z: 8 },
        { x: 12, z: 10 },
        { x: -8, z: -15 },
        { x: 5, z: 15 },
        { x: cabinX + 5, z: cabinZ - 3 }, // Near cabin
      ];
      for (const pos of lanternPositions) {
        if (this.isNearPortal(pos.x, pos.z)) continue;
        const lantern = this.createLantern();
        lantern.position.set(pos.x, Terrain.getTerrainHeight(pos.x, pos.z), pos.z);
        objects.push(lantern);
      }

      // Add bird houses on some trees (attach to tree positions)
      let birdHousesPlaced = 0;
      for (const treePos of treesPositions) {
        if (birdHousesPlaced >= 8) break;
        if (Math.random() > 0.05) continue; // Only some trees get bird houses

        const birdHouse = this.createBirdHouse();
        const heightOnTree = 4 + Math.random() * 3;
        const offsetAngle = Math.random() * Math.PI * 2;
        birdHouse.position.set(
          treePos.x + Math.cos(offsetAngle) * 0.8,
          Terrain.getTerrainHeight(treePos.x, treePos.z) + heightOnTree,
          treePos.z + Math.sin(offsetAngle) * 0.8
        );
        birdHouse.rotation.y = offsetAngle + Math.PI; // Face outward
        objects.push(birdHouse);
        birdHousesPlaced++;
      }

      // Portals are positioned at distance 25 at various angles
      // We want foliage BETWEEN portals (not blocking them) in the portal zone (distance 15-40)

      // Helper to check if angle is too close to a portal direction
      const isNearPortalAngle = (angle: number): boolean => {
        // Portals are roughly evenly distributed, avoid within ~30 degrees of each
        const normalizedAngle = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        // Approximate portal positions - they spread evenly
        for (let p = 0; p < 4; p++) {
          const portalAngle = (p / 4) * Math.PI * 2 - Math.PI / 2;
          const diff = Math.abs(normalizedAngle - ((portalAngle + Math.PI * 2) % (Math.PI * 2)));
          const minDiff = Math.min(diff, Math.PI * 2 - diff);
          if (minDiff < 0.5) return true; // ~30 degrees clearance
        }
        return false;
      };

      // Add foliage IN the portal zone (distance 15-38) but between portals
      for (let i = 0; i < 100; i++) {
        const angle = Math.random() * Math.PI * 2;

        // Skip if too close to a portal path
        if (isNearPortalAngle(angle)) continue;

        const distance = 15 + Math.random() * 23; // distance 15-38
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;

        if (isInPond(x, z)) continue;

        const terrainY = Terrain.getTerrainHeight(x, z);

        // Mix of foliage
        const choice = Math.random();
        if (choice < 0.25) {
          const bush = this.createBush();
          bush.position.set(x, terrainY, z);
          objects.push(bush);
        } else if (choice < 0.5) {
          const fern = this.createFern();
          fern.position.set(x, terrainY, z);
          fern.rotation.y = Math.random() * Math.PI * 2;
          objects.push(fern);
        } else if (choice < 0.75) {
          const grass = this.createTallGrass();
          grass.position.set(x, terrainY, z);
          objects.push(grass);
        } else {
          // Flower cluster
          for (let j = 0; j < 4; j++) {
            const flower = this.createFlower();
            const ox = (Math.random() - 0.5) * 2;
            const oz = (Math.random() - 0.5) * 2;
            flower.position.set(x + ox, Terrain.getTerrainHeight(x + ox, z + oz), z + oz);
            flower.scale.setScalar(0.6 + Math.random() * 0.5);
            objects.push(flower);
          }
        }
      }

      // Add foliage just outside portal zone too
      for (let i = 0; i < 60; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = 40 + Math.random() * 15; // distance 40-55
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;

        const terrainY = Terrain.getTerrainHeight(x, z);

        const choice = Math.random();
        if (choice < 0.4) {
          const bush = this.createBush();
          bush.position.set(x, terrainY, z);
          objects.push(bush);
        } else if (choice < 0.7) {
          const fern = this.createFern();
          fern.position.set(x, terrainY, z);
          fern.rotation.y = Math.random() * Math.PI * 2;
          objects.push(fern);
        } else {
          for (let j = 0; j < 3; j++) {
            const flower = this.createFlower();
            const ox = (Math.random() - 0.5) * 1.5;
            const oz = (Math.random() - 0.5) * 1.5;
            flower.position.set(x + ox, Terrain.getTerrainHeight(x + ox, z + oz), z + oz);
            flower.scale.setScalar(0.7 + Math.random() * 0.4);
            objects.push(flower);
          }
        }
      }

      // Add some foliage inside portal approach (distance 8-14)
      for (let i = 0; i < 40; i++) {
        const angle = Math.random() * Math.PI * 2;

        if (isNearPortalAngle(angle)) continue;

        const distance = 8 + Math.random() * 6;
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;

        if (isNearCampfire(x, z) || isInPond(x, z)) continue;

        const terrainY = Terrain.getTerrainHeight(x, z);

        if (Math.random() < 0.5) {
          const grass = this.createTallGrass();
          grass.position.set(x, terrainY, z);
          objects.push(grass);
        } else {
          const fern = this.createFern();
          fern.position.set(x, terrainY, z);
          fern.scale.setScalar(0.6 + Math.random() * 0.3);
          objects.push(fern);
        }
      }

      // Add rocks scattered around
      for (let i = 0; i < 50; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = 25 + Math.random() * 170;
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;

        if (this.isNearPortal(x, z)) continue;

        const scale = 0.5 + Math.random() * 1.5;
        const rock = this.createRock(scale);
        const terrainY = Terrain.getTerrainHeight(x, z);
        rock.position.set(x, terrainY + scale * 0.3, z);
        objects.push(rock);
      }

      // Add bushes
      for (let i = 0; i < 100; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = 20 + Math.random() * 180;
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;

        if (this.isNearPortal(x, z)) continue;

        const bush = this.createBush();
        const terrainY = Terrain.getTerrainHeight(x, z);
        bush.position.set(x, terrainY, z);
        objects.push(bush);
      }

      // Add ferns
      for (let i = 0; i < 80; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = 25 + Math.random() * 175;
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;

        if (this.isNearPortal(x, z)) continue;

        const fern = this.createFern();
        const terrainY = Terrain.getTerrainHeight(x, z);
        fern.position.set(x, terrainY, z);
        fern.rotation.y = Math.random() * Math.PI * 2;
        fern.scale.setScalar(0.8 + Math.random() * 0.5);
        objects.push(fern);
      }

      // Add tall grass patches
      for (let i = 0; i < 120; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = 18 + Math.random() * 180;
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;

        if (this.isNearPortal(x, z)) continue;

        const grass = this.createTallGrass();
        const terrainY = Terrain.getTerrainHeight(x, z);
        grass.position.set(x, terrainY, z);
        grass.rotation.y = Math.random() * Math.PI * 2;
        objects.push(grass);
      }

      // Add mushroom clusters
      for (let i = 0; i < 40; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = 30 + Math.random() * 150;
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;

        if (this.isNearPortal(x, z)) continue;

        // Small cluster of 2-5 mushrooms
        const clusterSize = 2 + Math.floor(Math.random() * 4);
        for (let j = 0; j < clusterSize; j++) {
          const mushroom = this.createMushroom();
          const offsetX = (Math.random() - 0.5) * 1.5;
          const offsetZ = (Math.random() - 0.5) * 1.5;
          const terrainY = Terrain.getTerrainHeight(x + offsetX, z + offsetZ);
          mushroom.position.set(x + offsetX, terrainY, z + offsetZ);
          mushroom.scale.setScalar(0.8 + Math.random() * 0.6);
          objects.push(mushroom);
        }
      }

      // Add flowers in patches
      for (let i = 0; i < 60; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = 25 + Math.random() * 160;
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;

        if (this.isNearPortal(x, z)) continue;

        // Larger patches of 5-10 flowers
        const patchSize = 5 + Math.floor(Math.random() * 6);
        for (let j = 0; j < patchSize; j++) {
          const flower = this.createFlower();
          const offsetX = (Math.random() - 0.5) * 3;
          const offsetZ = (Math.random() - 0.5) * 3;
          const terrainY = Terrain.getTerrainHeight(x + offsetX, z + offsetZ);
          flower.position.set(x + offsetX, terrainY, z + offsetZ);
          flower.scale.setScalar(0.7 + Math.random() * 0.6);
          objects.push(flower);
        }
      }

      // Add fallen logs
      for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = 40 + Math.random() * 140;
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;

        if (this.isNearPortal(x, z)) continue;

        const log = this.createLog();
        const terrainY = Terrain.getTerrainHeight(x, z);
        const radius = log.userData.radius || 0.4;
        log.position.set(x, terrainY + radius, z);
        log.rotation.y = Math.random() * Math.PI * 2;
        objects.push(log);
      }

      return objects;
    }

    // Other planets get their decorations
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 30 + Math.random() * 150;
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;

      // Skip portal zone
      if (this.isNearPortal(x, z)) {
        continue;
      }

      let decoration: THREE.Mesh;

      switch (planetId) {
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

      const terrainY = Terrain.getTerrainHeight(x, z);
      decoration.position.x = x;
      decoration.position.y += terrainY;
      decoration.position.z = z;
      decoration.castShadow = true;
      objects.push(decoration);
    }

    return objects;
  }
}
