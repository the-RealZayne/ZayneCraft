import * as THREE from 'three';

export class Terrain {
  // Simplex-like noise function for terrain
  public static noise(x: number, y: number): number {
    const n =
      Math.sin(x * 0.1) * Math.cos(y * 0.1) +
      Math.sin(x * 0.05 + 1.3) * Math.cos(y * 0.07 + 0.7) * 0.5 +
      Math.sin(x * 0.02 + 2.1) * Math.cos(y * 0.03 + 1.2) * 0.25;
    return n;
  }

  // Get terrain height at world coordinates (x, z)
  // flatRadius: area to keep completely flat (default 40)
  // Note: The terrain plane is rotated -90 around X, so plane localY = -worldZ
  public static getTerrainHeight(worldX: number, worldZ: number, flatRadius = 40): number {
    const distance = Math.sqrt(worldX * worldX + worldZ * worldZ);

    if (distance <= flatRadius) {
      return 0;
    }

    const falloff = Math.min((distance - flatRadius) / 60, 1);

    // Convert world coords to plane local coords
    // Plane rotation: mesh.rotation.x = -Math.PI / 2
    // This means: localX = worldX, localY = -worldZ
    const localX = worldX;
    const localY = -worldZ;

    // Match the terrain generation in createGround exactly
    let height = 0;
    height += Terrain.noise(localX, localY) * 8 * falloff;
    height += Terrain.noise(localX * 2, localY * 2) * 3 * falloff;
    height += Terrain.noise(localX * 5, localY * 5) * 0.8 * falloff;

    return height;
  }

  // Create ground with more detailed terrain
  // flatRadius: how much area around center to keep flat (default 40, use larger for education)
  public static createGround(color: number, flatRadius = 40): THREE.Group {
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
      if (distance > flatRadius) {
        const falloff = Math.min((distance - flatRadius) / 60, 1);

        // Large rolling hills
        height += Terrain.noise(x, y) * 8 * falloff;

        // Medium bumps
        height += Terrain.noise(x * 2, y * 2) * 3 * falloff;

        // Small detail
        height += Terrain.noise(x * 5, y * 5) * 0.8 * falloff;
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
      rock.position.set(Math.cos(angle) * dist, 0.2 + Math.random() * 0.3, Math.sin(angle) * dist);
      rock.rotation.set(Math.random(), Math.random(), Math.random());
      rock.castShadow = true;
      group.add(rock);
    }

    return group;
  }
}
