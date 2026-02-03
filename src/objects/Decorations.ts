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
      let treesPlaced = 0;
      let attempts = 0;

      while (treesPlaced < 200 && attempts < 600) {
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

        const scale = 1.0 + Math.random() * 1.2;
        const tree = this.createTree(scale);

        const terrainY = Terrain.getTerrainHeight(x, z);
        tree.position.set(x, terrainY, z);
        tree.rotation.y = Math.random() * Math.PI * 2;

        objects.push(tree);
        treesPlaced++;
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
