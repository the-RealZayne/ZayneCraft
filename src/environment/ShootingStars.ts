import * as THREE from 'three';

interface ShootingStar {
  mesh: THREE.Line;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
  active: boolean;
}

export class ShootingStars {
  private stars: ShootingStar[] = [];
  public readonly group: THREE.Group;

  constructor() {
    this.group = new THREE.Group();
    this.createPool();
  }

  private createPool(): void {
    for (let i = 0; i < 5; i++) {
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(6); // 2 points for a line
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      const material = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0,
        fog: false,
      });

      const line = new THREE.Line(geometry, material);
      this.group.add(line);

      this.stars.push({
        mesh: line,
        velocity: new THREE.Vector3(),
        life: 0,
        maxLife: 0,
        active: false,
      });
    }
  }

  public spawn(): void {
    const inactive = this.stars.find((s) => !s.active);
    if (!inactive) return;

    // Random starting position on the sky sphere
    const radius = 2200;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI * 0.5 + 0.2;

    const startX = radius * Math.sin(phi) * Math.cos(theta);
    const startY = radius * Math.cos(phi);
    const startZ = radius * Math.sin(phi) * Math.sin(theta);

    // Random velocity direction (generally downward)
    inactive.velocity.set(
      (Math.random() - 0.5) * 800,
      -300 - Math.random() * 400,
      (Math.random() - 0.5) * 800
    );

    const positions = inactive.mesh.geometry.attributes.position.array as Float32Array;
    positions[0] = startX;
    positions[1] = startY;
    positions[2] = startZ;
    positions[3] = startX;
    positions[4] = startY;
    positions[5] = startZ;
    inactive.mesh.geometry.attributes.position.needsUpdate = true;

    inactive.life = 0;
    inactive.maxLife = 1 + Math.random() * 1.5;
    inactive.active = true;
  }

  public update(delta: number): void {
    this.stars.forEach((star) => {
      if (!star.active) return;

      star.life += delta;
      const progress = star.life / star.maxLife;

      if (progress >= 1) {
        star.active = false;
        (star.mesh.material as THREE.LineBasicMaterial).opacity = 0;
        return;
      }

      const positions = star.mesh.geometry.attributes.position.array as Float32Array;

      // Move the head
      positions[0] += star.velocity.x * delta;
      positions[1] += star.velocity.y * delta;
      positions[2] += star.velocity.z * delta;

      // Tail follows with lag
      const tailLength = 50;
      const dir = star.velocity.clone().normalize();
      positions[3] = positions[0] - dir.x * tailLength;
      positions[4] = positions[1] - dir.y * tailLength;
      positions[5] = positions[2] - dir.z * tailLength;

      star.mesh.geometry.attributes.position.needsUpdate = true;

      // Fade in then out
      const fadeIn = Math.min(progress * 4, 1);
      const fadeOut = Math.max(0, 1 - (progress - 0.7) * 3.33);
      (star.mesh.material as THREE.LineBasicMaterial).opacity = fadeIn * fadeOut * 0.8;
    });

    // Random chance to spawn new shooting star
    if (Math.random() < 0.01) {
      this.spawn();
    }
  }
}
