import * as THREE from 'three';

interface WalkablePlatform {
  x: number;
  z: number;
  width: number;
  depth: number;
  height: number;
  rotation?: number;
  minApproachHeight?: number; // Player must be at least this height to get on
}

export class Terrain {
  // Registry of walkable platforms (cleared when loading new planet)
  private static walkablePlatforms: WalkablePlatform[] = [];

  public static clearPlatforms(): void {
    this.walkablePlatforms = [];
  }

  public static addWalkablePlatform(platform: WalkablePlatform): void {
    this.walkablePlatforms.push(platform);
  }

  // Check if moving to a position would collide with a platform the player can't access
  public static checkPlatformCollision(
    worldX: number,
    worldZ: number,
    currentHeight: number
  ): { blocked: boolean; pushX: number; pushZ: number } {
    // First check if player can access ANY platform at this position
    // If so, don't block them (they're on valid stairs/platform)
    const accessibleHeight = this.getPlatformHeight(worldX, worldZ, currentHeight);
    if (accessibleHeight !== null) {
      return { blocked: false, pushX: 0, pushZ: 0 };
    }

    for (const platform of this.walkablePlatforms) {
      const rotation = platform.rotation || 0;

      // Transform point to platform's local space
      const dx = worldX - platform.x;
      const dz = worldZ - platform.z;
      const cos = Math.cos(-rotation);
      const sin = Math.sin(-rotation);
      const localX = dx * cos - dz * sin;
      const localZ = dx * sin + dz * cos;

      // Check if within platform bounds
      const halfWidth = platform.width / 2;
      const halfDepth = platform.depth / 2;

      if (localX >= -halfWidth && localX <= halfWidth &&
          localZ >= -halfDepth && localZ <= halfDepth) {
        // Player is within platform bounds - check if they can access it
        const minHeight = platform.minApproachHeight ?? 0;

        // If player is below the required height, they should be blocked
        if (currentHeight < minHeight - 0.3) {
          // Calculate push direction to get player out of the platform
          const overlapLeft = localX + halfWidth;
          const overlapRight = halfWidth - localX;
          const overlapFront = localZ + halfDepth;
          const overlapBack = halfDepth - localZ;

          // Find smallest overlap to determine push direction
          const minOverlap = Math.min(overlapLeft, overlapRight, overlapFront, overlapBack);

          let pushLocalX = 0;
          let pushLocalZ = 0;

          if (minOverlap === overlapLeft) pushLocalX = -overlapLeft - 0.1;
          else if (minOverlap === overlapRight) pushLocalX = overlapRight + 0.1;
          else if (minOverlap === overlapFront) pushLocalZ = -overlapFront - 0.1;
          else pushLocalZ = overlapBack + 0.1;

          // Transform push back to world space
          const pushX = pushLocalX * Math.cos(rotation) - pushLocalZ * Math.sin(rotation);
          const pushZ = pushLocalX * Math.sin(rotation) + pushLocalZ * Math.cos(rotation);

          return { blocked: true, pushX, pushZ };
        }
      }
    }
    return { blocked: false, pushX: 0, pushZ: 0 };
  }

  // Check if position is on a walkable platform
  private static getPlatformHeight(worldX: number, worldZ: number, currentHeight: number): number | null {
    let highestPlatform: number | null = null;

    for (const platform of this.walkablePlatforms) {
      const rotation = platform.rotation || 0;

      // Transform point to platform's local space
      const dx = worldX - platform.x;
      const dz = worldZ - platform.z;
      const cos = Math.cos(-rotation);
      const sin = Math.sin(-rotation);
      const localX = dx * cos - dz * sin;
      const localZ = dx * sin + dz * cos;

      // Check if within platform bounds
      const halfWidth = platform.width / 2;
      const halfDepth = platform.depth / 2;

      if (localX >= -halfWidth && localX <= halfWidth &&
          localZ >= -halfDepth && localZ <= halfDepth) {
        // Check if player meets minimum approach height requirement
        const minHeight = platform.minApproachHeight ?? 0;
        if (currentHeight >= minHeight - 0.5) {
          // Return the highest valid platform
          if (highestPlatform === null || platform.height > highestPlatform) {
            highestPlatform = platform.height;
          }
        }
      }
    }
    return highestPlatform;
  }

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
  // currentPlayerHeight: used to check if player can access elevated platforms
  // Note: The terrain plane is rotated -90 around X, so plane localY = -worldZ
  public static getTerrainHeight(worldX: number, worldZ: number, flatRadius = 40, currentPlayerHeight = 0): number {
    // Check for walkable platforms first
    const platformHeight = this.getPlatformHeight(worldX, worldZ, currentPlayerHeight);
    if (platformHeight !== null) {
      return platformHeight;
    }

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

    // Main terrain - reduced size for performance
    const geometry = new THREE.PlaneGeometry(300, 300, 60, 60);

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

    return group;
  }
}
