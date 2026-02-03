import * as THREE from 'three';
import { Terrain } from '../environment/Terrain';

export class Campus {
  private static readonly CAMPUS_FLAT_RADIUS = 120;

  private static placeOnTerrain(obj: THREE.Object3D, x: number, z: number, yOffset = 0): void {
    const terrainY = Terrain.getTerrainHeight(x, z, Campus.CAMPUS_FLAT_RADIUS);
    obj.position.set(x, terrainY + yOffset, z);
  }

  public static create(): THREE.Object3D[] {
    const objects: THREE.Object3D[] = [];

    // Materials
    const brickMat = new THREE.MeshStandardMaterial({
      color: 0x8b4513,
      roughness: 0.9,
      flatShading: true,
    });
    const brickMat2 = new THREE.MeshStandardMaterial({
      color: 0x9c5a3c,
      roughness: 0.9,
      flatShading: true,
    });
    const stoneMat = new THREE.MeshStandardMaterial({
      color: 0xd4c4b0,
      roughness: 0.7,
      flatShading: true,
    });
    const roofMat = new THREE.MeshStandardMaterial({
      color: 0x2f4f4f,
      roughness: 0.8,
      flatShading: true,
    });
    const roofMat2 = new THREE.MeshStandardMaterial({
      color: 0x4a3728,
      roughness: 0.85,
      flatShading: true,
    });
    const windowMat = new THREE.MeshStandardMaterial({
      color: 0x87ceeb,
      emissive: 0x334455,
      emissiveIntensity: 0.3,
      roughness: 0.3,
    });
    const pathMat = new THREE.MeshStandardMaterial({
      color: 0x696969,
      roughness: 0.95,
    });
    const grassMat = new THREE.MeshStandardMaterial({
      color: 0x3d6b3d,
      roughness: 1,
    });
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x3d2817 });
    const benchMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.8 });

    // Helper functions
    const createClassicalBuilding = (
      width: number,
      height: number,
      depth: number,
      numColumns: number,
      hasDome: boolean,
      name: string
    ) => {
      const building = new THREE.Group();

      const bodyGeo = new THREE.BoxGeometry(width, height, depth);
      const body = new THREE.Mesh(bodyGeo, brickMat);
      body.position.y = height / 2;
      body.castShadow = true;
      building.add(body);

      if (numColumns > 0) {
        const colSpacing = (width - 2) / (numColumns - 1);
        for (let i = 0; i < numColumns; i++) {
          const colGeo = new THREE.CylinderGeometry(0.35, 0.45, height - 1, 8);
          const col = new THREE.Mesh(colGeo, stoneMat);
          col.position.set(-width / 2 + 1 + i * colSpacing, (height - 1) / 2, depth / 2 + 0.5);
          col.castShadow = true;
          building.add(col);
        }

        const pedGeo = new THREE.BoxGeometry(width + 1, 1.5, 2);
        const ped = new THREE.Mesh(pedGeo, stoneMat);
        ped.position.set(0, height, depth / 2 + 0.5);
        building.add(ped);
      }

      const roofGeo = new THREE.BoxGeometry(width + 2, 1, depth + 2);
      const roof = new THREE.Mesh(roofGeo, roofMat);
      roof.position.y = height + 0.5;
      building.add(roof);

      if (hasDome) {
        const domeGeo = new THREE.SphereGeometry(width / 6, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
        const domeMesh = new THREE.Mesh(
          domeGeo,
          new THREE.MeshStandardMaterial({
            color: 0x4a6741,
            roughness: 0.6,
            metalness: 0.3,
          })
        );
        domeMesh.position.y = height + 1;
        building.add(domeMesh);
      }

      const numWindowsX = Math.floor(width / 4);
      const numWindowsY = Math.floor(height / 4);
      for (let row = 0; row < numWindowsY; row++) {
        for (let col = 0; col < numWindowsX; col++) {
          const winGeo = new THREE.BoxGeometry(1.5, 2, 0.2);
          const win = new THREE.Mesh(winGeo, windowMat);
          win.position.set(
            -width / 2 + 2 + (col * (width - 4)) / Math.max(numWindowsX - 1, 1),
            2 + row * 3.5,
            depth / 2 + 0.1
          );
          building.add(win);
        }
      }

      const doorGeo = new THREE.BoxGeometry(2.5, 3.5, 0.3);
      const door = new THREE.Mesh(doorGeo, doorMat);
      door.position.set(0, 1.75, depth / 2 + 0.2);
      building.add(door);

      building.userData.name = name;
      return building;
    };

    const createModernBuilding = (width: number, height: number, depth: number, name: string) => {
      const building = new THREE.Group();

      const bodyGeo = new THREE.BoxGeometry(width, height, depth);
      const body = new THREE.Mesh(bodyGeo, brickMat2);
      body.position.y = height / 2;
      body.castShadow = true;
      building.add(body);

      const roofGeo = new THREE.BoxGeometry(width + 1, 0.5, depth + 1);
      const roof = new THREE.Mesh(roofGeo, roofMat);
      roof.position.y = height + 0.25;
      building.add(roof);

      const numWindowsX = Math.floor(width / 3.5);
      const numWindowsY = Math.floor(height / 3.5);
      for (let row = 0; row < numWindowsY; row++) {
        for (let col = 0; col < numWindowsX; col++) {
          const winGeo = new THREE.BoxGeometry(2.2, 2.5, 0.2);
          const win = new THREE.Mesh(winGeo, windowMat);
          win.position.set(-width / 2 + 2 + col * 3.5, 2 + row * 3.5, depth / 2 + 0.1);
          building.add(win);
        }
      }

      const entranceGeo = new THREE.BoxGeometry(4, 3.5, 0.3);
      const entranceMat = new THREE.MeshStandardMaterial({
        color: 0x88ccee,
        transparent: true,
        opacity: 0.6,
      });
      const entrance = new THREE.Mesh(entranceGeo, entranceMat);
      entrance.position.set(0, 1.75, depth / 2 + 0.2);
      building.add(entrance);

      building.userData.name = name;
      return building;
    };

    const createDormitory = (width: number, floors: number, depth: number, name: string) => {
      const building = new THREE.Group();
      const height = floors * 3.5;

      const bodyGeo = new THREE.BoxGeometry(width, height, depth);
      const body = new THREE.Mesh(bodyGeo, brickMat);
      body.position.y = height / 2;
      body.castShadow = true;
      building.add(body);

      const roofGeo = new THREE.BoxGeometry(width + 1, 0.8, depth + 1);
      const roof = new THREE.Mesh(roofGeo, roofMat2);
      roof.position.y = height + 0.4;
      building.add(roof);

      for (let floor = 0; floor < floors; floor++) {
        for (let w = 0; w < Math.floor(width / 3); w++) {
          const winGeo = new THREE.BoxGeometry(1.2, 1.5, 0.2);
          const win = new THREE.Mesh(winGeo, windowMat);
          win.position.set(-width / 2 + 2 + w * 3, 1.5 + floor * 3.5, depth / 2 + 0.1);
          building.add(win);
        }
      }

      const doorGeo = new THREE.BoxGeometry(2, 3, 0.3);
      const door = new THREE.Mesh(doorGeo, doorMat);
      door.position.set(0, 1.5, depth / 2 + 0.2);
      building.add(door);

      building.userData.name = name;
      return building;
    };

    const createTree = (scale = 1) => {
      const tree = new THREE.Group();
      const trunkGeo = new THREE.CylinderGeometry(0.3 * scale, 0.5 * scale, 3 * scale, 8);
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a3728 });
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 1.5 * scale;
      trunk.castShadow = true;
      tree.add(trunk);

      const canopyGeo = new THREE.SphereGeometry(2.5 * scale, 8, 6);
      const canopyMat = new THREE.MeshStandardMaterial({
        color: 0x228b22,
        roughness: 0.9,
        flatShading: true,
      });
      const canopy = new THREE.Mesh(canopyGeo, canopyMat);
      canopy.position.y = 4.5 * scale;
      canopy.castShadow = true;
      tree.add(canopy);
      return tree;
    };

    const createLampPost = () => {
      const lamp = new THREE.Group();
      const lampPostMat = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        metalness: 0.8,
        roughness: 0.3,
      });
      const poleGeo = new THREE.CylinderGeometry(0.1, 0.15, 4, 8);
      const pole = new THREE.Mesh(poleGeo, lampPostMat);
      pole.position.y = 2;
      lamp.add(pole);

      const headGeo = new THREE.BoxGeometry(0.6, 0.8, 0.6);
      const headMat = new THREE.MeshStandardMaterial({
        color: 0xffffcc,
        emissive: 0xffff88,
        emissiveIntensity: 0.5,
      });
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.y = 4.2;
      lamp.add(head);

      const light = new THREE.PointLight(0xffffcc, 0.3, 12);
      light.position.y = 4.2;
      lamp.add(light);
      return lamp;
    };

    const createBench = () => {
      const bench = new THREE.Group();
      const seatGeo = new THREE.BoxGeometry(3, 0.2, 0.8);
      const seat = new THREE.Mesh(seatGeo, benchMat);
      seat.position.y = 0.5;
      bench.add(seat);

      const backGeo = new THREE.BoxGeometry(3, 0.6, 0.15);
      const back = new THREE.Mesh(backGeo, benchMat);
      back.position.set(0, 0.8, -0.35);
      bench.add(back);

      for (let i = 0; i < 2; i++) {
        const legGeo = new THREE.BoxGeometry(0.2, 0.5, 0.6);
        const leg = new THREE.Mesh(legGeo, benchMat);
        leg.position.set(-1.2 + i * 2.4, 0.25, 0);
        bench.add(leg);
      }
      return bench;
    };

    // Main campus buildings
    const adminBuilding = createClassicalBuilding(24, 10, 14, 8, true, 'Administration');
    Campus.placeOnTerrain(adminBuilding, 0, -90);
    objects.push(adminBuilding);

    const library = createClassicalBuilding(20, 8, 12, 6, true, 'Library');
    Campus.placeOnTerrain(library, -55, -75);
    library.rotation.y = Math.PI / 8;
    objects.push(library);

    const scienceBuilding = createModernBuilding(18, 9, 12, 'Science Center');
    Campus.placeOnTerrain(scienceBuilding, 55, -75);
    scienceBuilding.rotation.y = -Math.PI / 8;
    objects.push(scienceBuilding);

    const engineeringBuilding = createModernBuilding(16, 8, 10, 'Engineering');
    Campus.placeOnTerrain(engineeringBuilding, 70, -45);
    engineeringBuilding.rotation.y = -Math.PI / 4;
    objects.push(engineeringBuilding);

    const artsBuilding = createClassicalBuilding(16, 7, 10, 4, false, 'Arts & Humanities');
    Campus.placeOnTerrain(artsBuilding, -70, -45);
    artsBuilding.rotation.y = Math.PI / 4;
    objects.push(artsBuilding);

    const lectureHall1 = createModernBuilding(14, 6, 10, 'Lecture Hall A');
    Campus.placeOnTerrain(lectureHall1, 55, 50);
    lectureHall1.rotation.y = Math.PI;
    objects.push(lectureHall1);

    const lectureHall2 = createModernBuilding(14, 6, 10, 'Lecture Hall B');
    Campus.placeOnTerrain(lectureHall2, 75, 50);
    lectureHall2.rotation.y = Math.PI;
    objects.push(lectureHall2);

    const studentUnion = createClassicalBuilding(18, 7, 12, 5, false, 'Student Union');
    Campus.placeOnTerrain(studentUnion, -55, 55);
    studentUnion.rotation.y = Math.PI;
    objects.push(studentUnion);

    const cafeteria = createModernBuilding(20, 5, 14, 'Dining Hall');
    Campus.placeOnTerrain(cafeteria, -75, 20);
    cafeteria.rotation.y = Math.PI / 2;
    objects.push(cafeteria);

    // Gymnasium
    const gymnasium = new THREE.Group();
    const gymBodyGeo = new THREE.BoxGeometry(25, 10, 18);
    const gymBody = new THREE.Mesh(gymBodyGeo, brickMat2);
    gymBody.position.y = 5;
    gymBody.castShadow = true;
    gymnasium.add(gymBody);

    const gymRoofGeo = new THREE.CylinderGeometry(14, 14, 26, 16, 1, false, 0, Math.PI);
    const gymRoof = new THREE.Mesh(gymRoofGeo, roofMat);
    gymRoof.position.y = 10;
    gymRoof.rotation.z = Math.PI / 2;
    gymRoof.rotation.y = Math.PI / 2;
    gymnasium.add(gymRoof);

    Campus.placeOnTerrain(gymnasium, 90, 0);
    gymnasium.rotation.y = -Math.PI / 2;
    objects.push(gymnasium);

    // Dormitories
    const dorm1 = createDormitory(12, 4, 8, 'North Hall');
    Campus.placeOnTerrain(dorm1, -85, -60);
    dorm1.rotation.y = Math.PI / 6;
    objects.push(dorm1);

    const dorm2 = createDormitory(12, 4, 8, 'East Hall');
    Campus.placeOnTerrain(dorm2, 90, -55);
    dorm2.rotation.y = -Math.PI / 6;
    objects.push(dorm2);

    const dorm3 = createDormitory(14, 5, 8, 'West Hall');
    Campus.placeOnTerrain(dorm3, -90, 60);
    dorm3.rotation.y = Math.PI - Math.PI / 6;
    objects.push(dorm3);

    const dorm4 = createDormitory(14, 5, 8, 'South Hall');
    Campus.placeOnTerrain(dorm4, 90, 65);
    dorm4.rotation.y = Math.PI + Math.PI / 6;
    objects.push(dorm4);

    const researchCenter = createModernBuilding(14, 10, 10, 'Research Center');
    Campus.placeOnTerrain(researchCenter, 85, -85);
    researchCenter.rotation.y = -Math.PI / 4;
    objects.push(researchCenter);

    const medicalCenter = createModernBuilding(16, 8, 12, 'Medical Center');
    Campus.placeOnTerrain(medicalCenter, -85, -85);
    medicalCenter.rotation.y = Math.PI / 4;
    objects.push(medicalCenter);

    // Chapel
    const chapel = new THREE.Group();
    const chapelBody = new THREE.Mesh(new THREE.BoxGeometry(10, 8, 16), brickMat);
    chapelBody.position.y = 4;
    chapelBody.castShadow = true;
    chapel.add(chapelBody);

    const steepleBase = new THREE.Mesh(new THREE.BoxGeometry(4, 6, 4), brickMat);
    steepleBase.position.set(0, 11, -5);
    chapel.add(steepleBase);

    const steeple = new THREE.Mesh(new THREE.ConeGeometry(3, 8, 4), roofMat);
    steeple.position.set(0, 18, -5);
    steeple.rotation.y = Math.PI / 4;
    chapel.add(steeple);

    const roseWindow = new THREE.Mesh(
      new THREE.CircleGeometry(2, 16),
      new THREE.MeshStandardMaterial({
        color: 0xdd8844,
        emissive: 0xaa6633,
        emissiveIntensity: 0.3,
      })
    );
    roseWindow.position.set(0, 6, 8.1);
    chapel.add(roseWindow);

    Campus.placeOnTerrain(chapel, 65, -15);
    chapel.rotation.y = -Math.PI / 2;
    objects.push(chapel);

    // Clock Tower
    const clockTower = new THREE.Group();
    const towerBase = new THREE.Mesh(new THREE.BoxGeometry(8, 20, 8), brickMat);
    towerBase.position.y = 10;
    towerBase.castShadow = true;
    clockTower.add(towerBase);

    const towerSpire = new THREE.Mesh(new THREE.ConeGeometry(5, 10, 4), roofMat);
    towerSpire.position.y = 25;
    towerSpire.rotation.y = Math.PI / 4;
    clockTower.add(towerSpire);

    const clockFaceGeo = new THREE.CircleGeometry(2, 16);
    const clockFaceMat = new THREE.MeshStandardMaterial({
      color: 0xfffff0,
      emissive: 0xffffcc,
      emissiveIntensity: 0.4,
    });
    (
      [
        [0, 4.1, 0],
        [0, -4.1, Math.PI],
        [4.1, 0, Math.PI / 2],
        [-4.1, 0, -Math.PI / 2],
      ] as [number, number, number][]
    ).forEach(([x, z, ry]) => {
      const face = new THREE.Mesh(clockFaceGeo, clockFaceMat);
      face.position.set(x, 16, z);
      face.rotation.y = ry;
      clockTower.add(face);
    });

    Campus.placeOnTerrain(clockTower, 0, -55);
    objects.push(clockTower);

    // Amphitheater
    const amphitheater = new THREE.Group();
    for (let row = 0; row < 5; row++) {
      const seatRowGeo = new THREE.BoxGeometry(20 - row * 2, 0.8, 2);
      const seatRow = new THREE.Mesh(seatRowGeo, stoneMat);
      seatRow.position.set(0, row * 0.8, row * 2.5);
      amphitheater.add(seatRow);
    }
    const stageGeo = new THREE.BoxGeometry(15, 1, 8);
    const stage = new THREE.Mesh(stageGeo, stoneMat);
    stage.position.set(0, 0.5, -6);
    amphitheater.add(stage);

    Campus.placeOnTerrain(amphitheater, -65, 0);
    amphitheater.rotation.y = Math.PI / 2;
    objects.push(amphitheater);

    // Central Quad
    const quadGeo = new THREE.CircleGeometry(15, 32);
    const quad = new THREE.Mesh(quadGeo, grassMat);
    quad.rotation.x = -Math.PI / 2;
    Campus.placeOnTerrain(quad, 0, -70, 0.02);
    objects.push(quad);

    // Main fountain
    const fountain = new THREE.Group();
    const basinGeo = new THREE.CylinderGeometry(5, 5.5, 1.5, 16);
    const basinMat = new THREE.MeshStandardMaterial({ color: 0x808080, roughness: 0.6 });
    const basin = new THREE.Mesh(basinGeo, basinMat);
    basin.position.y = 0.75;
    fountain.add(basin);

    const waterGeo = new THREE.CylinderGeometry(4.5, 4.5, 0.5, 16);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x4488aa,
      transparent: true,
      opacity: 0.7,
      roughness: 0.2,
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.position.y = 1.25;
    fountain.add(water);

    const centerPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 3, 8), basinMat);
    centerPillar.position.y = 2.5;
    fountain.add(centerPillar);

    Campus.placeOnTerrain(fountain, 0, -70);
    objects.push(fountain);

    // Pathways
    const paths = [
      { w: 6, d: 60, x: 0, z: -55, r: 0 },
      { w: 80, d: 5, x: 0, z: -45, r: 0 },
      { w: 100, d: 5, x: 0, z: -75, r: 0 },
      { w: 80, d: 5, x: 0, z: 45, r: 0 },
      { w: 5, d: 40, x: -35, z: -55, r: Math.PI / 4 },
      { w: 5, d: 40, x: 35, z: -55, r: -Math.PI / 4 },
      { w: 5, d: 50, x: -60, z: -30, r: 0 },
      { w: 5, d: 50, x: 60, z: -30, r: 0 },
      { w: 5, d: 50, x: -60, z: 30, r: 0 },
      { w: 5, d: 50, x: 60, z: 30, r: 0 },
    ];
    paths.forEach((p) => {
      const pathGeo = new THREE.BoxGeometry(p.w, 0.15, p.d);
      const path = new THREE.Mesh(pathGeo, pathMat);
      Campus.placeOnTerrain(path, p.x, p.z, 0.08);
      path.rotation.y = p.r;
      path.receiveShadow = true;
      objects.push(path);
    });

    // Trees
    const treePositions = [
      { x: -20, z: -70 },
      { x: 20, z: -70 },
      { x: -15, z: -85 },
      { x: 15, z: -85 },
      { x: -10, z: -45 },
      { x: 10, z: -45 },
      { x: -30, z: -45 },
      { x: 30, z: -45 },
      { x: -50, z: -45 },
      { x: 50, z: -45 },
      { x: -10, z: -75 },
      { x: 10, z: -75 },
      { x: -35, z: -75 },
      { x: 35, z: -75 },
      { x: -75, z: -55 },
      { x: 75, z: -55 },
      { x: -95, z: -45 },
      { x: 95, z: -45 },
      { x: -80, z: 0 },
      { x: 80, z: -25 },
      { x: -45, z: 70 },
      { x: 45, z: 70 },
      { x: -70, z: 70 },
      { x: 70, z: 70 },
      { x: -100, z: -80 },
      { x: 100, z: -80 },
      { x: -100, z: 0 },
      { x: 100, z: 0 },
      { x: -100, z: 80 },
      { x: 100, z: 80 },
      { x: 0, z: 80 },
      { x: -50, z: 80 },
      { x: 50, z: 80 },
    ];
    treePositions.forEach((pos) => {
      const tree = createTree(0.8 + Math.random() * 0.4);
      Campus.placeOnTerrain(tree, pos.x, pos.z);
      objects.push(tree);
    });

    // Lamp posts
    const lampPositions = [
      { x: -5, z: -45 },
      { x: 5, z: -45 },
      { x: -5, z: -60 },
      { x: 5, z: -60 },
      { x: -5, z: -75 },
      { x: 5, z: -75 },
      { x: -5, z: -90 },
      { x: 5, z: -90 },
      { x: -25, z: -45 },
      { x: 25, z: -45 },
      { x: -45, z: -45 },
      { x: 45, z: -45 },
      { x: -25, z: -75 },
      { x: 25, z: -75 },
      { x: -55, z: -75 },
      { x: 55, z: -75 },
      { x: -60, z: -10 },
      { x: 60, z: -10 },
      { x: -60, z: 10 },
      { x: 60, z: 10 },
    ];
    lampPositions.forEach((pos) => {
      const lamp = createLampPost();
      Campus.placeOnTerrain(lamp, pos.x, pos.z);
      objects.push(lamp);
    });

    // Benches
    const benchPositions = [
      { x: -12, z: -55, r: Math.PI / 2 },
      { x: 12, z: -55, r: -Math.PI / 2 },
      { x: -12, z: -70, r: Math.PI / 2 },
      { x: 12, z: -70, r: -Math.PI / 2 },
      { x: -12, z: -85, r: Math.PI / 2 },
      { x: 12, z: -85, r: -Math.PI / 2 },
      { x: -35, z: -50, r: 0 },
      { x: 35, z: -50, r: 0 },
      { x: -55, z: -50, r: Math.PI / 4 },
      { x: 55, z: -50, r: -Math.PI / 4 },
      { x: 0, z: -95, r: 0 },
      { x: -20, z: -95, r: 0 },
      { x: 20, z: -95, r: 0 },
    ];
    benchPositions.forEach((pos) => {
      const bench = createBench();
      Campus.placeOnTerrain(bench, pos.x, pos.z);
      bench.rotation.y = pos.r;
      objects.push(bench);
    });

    // Statues
    const statue = new THREE.Group();
    const pedestalGeo = new THREE.BoxGeometry(2, 3, 2);
    const pedestal = new THREE.Mesh(pedestalGeo, stoneMat);
    pedestal.position.y = 1.5;
    statue.add(pedestal);

    const figureGeo = new THREE.CylinderGeometry(0.4, 0.5, 4, 8);
    const figure = new THREE.Mesh(
      figureGeo,
      new THREE.MeshStandardMaterial({ color: 0x4a4a4a, metalness: 0.6 })
    );
    figure.position.y = 5;
    statue.add(figure);

    const headGeo = new THREE.SphereGeometry(0.5, 8, 8);
    const head = new THREE.Mesh(
      headGeo,
      new THREE.MeshStandardMaterial({ color: 0x4a4a4a, metalness: 0.6 })
    );
    head.position.y = 7.2;
    statue.add(head);

    Campus.placeOnTerrain(statue, 0, -80);
    objects.push(statue);

    // Bike racks
    const bikeRackPositions = [
      { x: -40, z: -50 },
      { x: 40, z: -50 },
      { x: -65, z: -60 },
      { x: 65, z: -60 },
    ];
    bikeRackPositions.forEach((pos) => {
      const rack = new THREE.Group();
      for (let i = 0; i < 5; i++) {
        const loopGeo = new THREE.TorusGeometry(0.4, 0.05, 8, 16, Math.PI);
        const loop = new THREE.Mesh(
          loopGeo,
          new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8 })
        );
        loop.position.set(i * 0.8 - 1.6, 0.4, 0);
        loop.rotation.x = Math.PI / 2;
        rack.add(loop);
      }
      const barGeo = new THREE.BoxGeometry(4, 0.1, 0.1);
      const bar = new THREE.Mesh(
        barGeo,
        new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8 })
      );
      bar.position.y = 0.05;
      rack.add(bar);
      Campus.placeOnTerrain(rack, pos.x, pos.z);
      objects.push(rack);
    });

    // Notice boards
    const noticeBoardPositions = [
      { x: -30, z: -55 },
      { x: 30, z: -55 },
      { x: 0, z: -50 },
    ];
    noticeBoardPositions.forEach((pos) => {
      const board = new THREE.Group();
      const postGeo = new THREE.CylinderGeometry(0.1, 0.1, 2, 8);
      const postMat = new THREE.MeshStandardMaterial({ color: 0x4a3728 });
      const post1 = new THREE.Mesh(postGeo, postMat);
      post1.position.set(-0.8, 1, 0);
      board.add(post1);
      const post2 = new THREE.Mesh(postGeo, postMat);
      post2.position.set(0.8, 1, 0);
      board.add(post2);

      const panelGeo = new THREE.BoxGeometry(2, 1.5, 0.1);
      const panelMat = new THREE.MeshStandardMaterial({ color: 0xaa8866 });
      const panel = new THREE.Mesh(panelGeo, panelMat);
      panel.position.y = 1.8;
      board.add(panel);

      Campus.placeOnTerrain(board, pos.x, pos.z);
      objects.push(board);
    });

    return objects;
  }
}
