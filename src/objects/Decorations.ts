import * as THREE from 'three';
import { planets } from '../config/planets';
import { Campus } from './Campus';
import { Terrain } from '../environment/Terrain';

export class Decorations {
  public static create(planetId: string): THREE.Object3D[] {
    const objects: THREE.Object3D[] = [];
    const config = planets[planetId];

    // Education planet gets the full campus
    if (planetId === 'education') {
      return Campus.create();
    }

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
