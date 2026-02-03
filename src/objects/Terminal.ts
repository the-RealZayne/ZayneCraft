import * as THREE from 'three';

export class Terminal {
  public static create(): THREE.Group {
    const terminalGroup = new THREE.Group();

    // Base pedestal
    const baseGeo = new THREE.CylinderGeometry(0.8, 1, 0.3, 16);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x333344,
      metalness: 0.8,
      roughness: 0.3,
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.15;
    terminalGroup.add(base);

    // Main pillar
    const pillarGeo = new THREE.CylinderGeometry(0.3, 0.5, 1.2, 16);
    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0x444455,
      metalness: 0.9,
      roughness: 0.2,
    });
    const pillar = new THREE.Mesh(pillarGeo, pillarMat);
    pillar.position.y = 0.9;
    terminalGroup.add(pillar);

    // Top platform
    const topGeo = new THREE.CylinderGeometry(0.6, 0.4, 0.2, 16);
    const topMat = new THREE.MeshStandardMaterial({
      color: 0x555566,
      metalness: 0.9,
      roughness: 0.2,
    });
    const top = new THREE.Mesh(topGeo, topMat);
    top.position.y = 1.6;
    terminalGroup.add(top);

    // Hologram emitter ring
    const emitterGeo = new THREE.TorusGeometry(0.5, 0.05, 8, 32);
    const emitterMat = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.8,
    });
    const emitter = new THREE.Mesh(emitterGeo, emitterMat);
    emitter.rotation.x = Math.PI / 2;
    emitter.position.y = 1.75;
    terminalGroup.add(emitter);

    // Hologram beam particles
    const beamParticleCount = 50;
    const beamPositions = new Float32Array(beamParticleCount * 3);
    for (let i = 0; i < beamParticleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 0.4;
      beamPositions[i * 3] = Math.cos(angle) * radius;
      beamPositions[i * 3 + 1] = 1.8 + Math.random() * 2;
      beamPositions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    const beamGeo = new THREE.BufferGeometry();
    beamGeo.setAttribute('position', new THREE.BufferAttribute(beamPositions, 3));
    const beamMat = new THREE.PointsMaterial({
      color: 0x00ffff,
      size: 0.08,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    const beam = new THREE.Points(beamGeo, beamMat);
    terminalGroup.add(beam);

    // Point light for glow
    const light = new THREE.PointLight(0x00ffff, 1, 10);
    light.position.y = 2.5;
    terminalGroup.add(light);

    // Interaction prompt sprite
    const promptCanvas = document.createElement('canvas');
    const ctx = promptCanvas.getContext('2d')!;
    promptCanvas.width = 256;
    promptCanvas.height = 64;
    ctx.fillStyle = 'rgba(0, 255, 255, 0.8)';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('[ Approach to interact ]', 128, 40);
    const promptTexture = new THREE.CanvasTexture(promptCanvas);
    const promptMat = new THREE.SpriteMaterial({ map: promptTexture, transparent: true });
    const prompt = new THREE.Sprite(promptMat);
    prompt.scale.set(4, 1, 1);
    prompt.position.y = 4;
    terminalGroup.add(prompt);

    // Position in front of spawn
    terminalGroup.position.set(0, 0, -8);

    return terminalGroup;
  }

  public static animate(terminal: THREE.Group, delta: number, time: number): void {
    // Animate emitter ring rotation
    const emitter = terminal.children[3] as THREE.Mesh;
    if (emitter) {
      emitter.rotation.z = time * 2;
    }

    // Animate beam particles
    const beam = terminal.children[4] as THREE.Points;
    if (beam) {
      const positions = beam.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length / 3; i++) {
        positions[i * 3 + 1] += delta * 2;
        if (positions[i * 3 + 1] > 4) {
          positions[i * 3 + 1] = 1.8;
        }
      }
      beam.geometry.attributes.position.needsUpdate = true;
    }

    // Pulse the light
    const light = terminal.children[5] as THREE.PointLight;
    if (light) {
      light.intensity = 1 + Math.sin(time * 3) * 0.5;
    }
  }
}
