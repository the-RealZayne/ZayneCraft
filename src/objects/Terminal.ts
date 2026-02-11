import * as THREE from 'three';

export class Terminal {
  public static create(): THREE.Group {
    const campfireGroup = new THREE.Group();

    // Stone ring base
    const stoneCount = 10;
    for (let i = 0; i < stoneCount; i++) {
      const angle = (i / stoneCount) * Math.PI * 2;
      const stoneGeo = new THREE.DodecahedronGeometry(0.3 + Math.random() * 0.15, 0);
      const stoneMat = new THREE.MeshStandardMaterial({
        color: 0x555555,
        roughness: 0.9,
        flatShading: true,
      });
      const stone = new THREE.Mesh(stoneGeo, stoneMat);
      stone.position.set(Math.cos(angle) * 1.2, 0.15, Math.sin(angle) * 1.2);
      stone.rotation.set(Math.random(), Math.random(), Math.random());
      stone.castShadow = true;
      campfireGroup.add(stone);
    }

    // Logs in fire
    const logMat = new THREE.MeshStandardMaterial({ color: 0x3d2817 });
    for (let i = 0; i < 4; i++) {
      const logGeo = new THREE.CylinderGeometry(0.12, 0.15, 1.5, 6);
      const log = new THREE.Mesh(logGeo, logMat);
      const angle = (i / 4) * Math.PI * 2 + Math.PI / 8;
      log.position.set(Math.cos(angle) * 0.3, 0.25, Math.sin(angle) * 0.3);
      log.rotation.z = Math.PI / 2 - 0.3;
      log.rotation.y = angle + Math.PI / 2;
      log.castShadow = true;
      campfireGroup.add(log);
    }

    // Ember base (glowing coals)
    const emberGeo = new THREE.SphereGeometry(0.5, 8, 6);
    const emberMat = new THREE.MeshBasicMaterial({
      color: 0xff4400,
      transparent: true,
      opacity: 0.8,
    });
    const ember = new THREE.Mesh(emberGeo, emberMat);
    ember.position.y = 0.2;
    ember.scale.y = 0.4;
    campfireGroup.add(ember);

    // Fire particles
    const fireParticleCount = 80;
    const firePositions = new Float32Array(fireParticleCount * 3);
    const fireColors = new Float32Array(fireParticleCount * 3);

    for (let i = 0; i < fireParticleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 0.4;
      const height = Math.random() * 2;
      firePositions[i * 3] = Math.cos(angle) * radius * (1 - height / 3);
      firePositions[i * 3 + 1] = 0.3 + height;
      firePositions[i * 3 + 2] = Math.sin(angle) * radius * (1 - height / 3);

      // Color gradient: orange at bottom, yellow at top
      const t = height / 2;
      fireColors[i * 3] = 1;
      fireColors[i * 3 + 1] = 0.3 + t * 0.5;
      fireColors[i * 3 + 2] = t * 0.2;
    }

    // Pre-compute random speeds for animation
    const fireSpeeds = new Float32Array(fireParticleCount);
    for (let i = 0; i < fireParticleCount; i++) {
      fireSpeeds[i] = 1.5 + Math.random();
    }

    const fireGeo = new THREE.BufferGeometry();
    fireGeo.setAttribute('position', new THREE.BufferAttribute(firePositions, 3));
    fireGeo.setAttribute('color', new THREE.BufferAttribute(fireColors, 3));
    fireGeo.setAttribute('speed', new THREE.BufferAttribute(fireSpeeds, 1));

    const fireMat = new THREE.PointsMaterial({
      size: 0.25,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });
    const fire = new THREE.Points(fireGeo, fireMat);
    campfireGroup.add(fire);

    // Spark particles (smaller, rising faster)
    const sparkCount = 30;
    const sparkPositions = new Float32Array(sparkCount * 3);
    const sparkSpeeds = new Float32Array(sparkCount);
    for (let i = 0; i < sparkCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 0.3;
      sparkPositions[i * 3] = Math.cos(angle) * radius;
      sparkPositions[i * 3 + 1] = 0.5 + Math.random() * 3;
      sparkPositions[i * 3 + 2] = Math.sin(angle) * radius;
      sparkSpeeds[i] = 2 + Math.random() * 2;
    }
    const sparkGeo = new THREE.BufferGeometry();
    sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPositions, 3));
    sparkGeo.setAttribute('speed', new THREE.BufferAttribute(sparkSpeeds, 1));
    const sparkMat = new THREE.PointsMaterial({
      color: 0xffaa00,
      size: 0.08,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    const sparks = new THREE.Points(sparkGeo, sparkMat);
    campfireGroup.add(sparks);

    // Fire light
    const fireLight = new THREE.PointLight(0xff6622, 2, 15);
    fireLight.position.y = 1;
    fireLight.castShadow = true;
    campfireGroup.add(fireLight);

    // Secondary softer light for ambience
    const ambientFireLight = new THREE.PointLight(0xff4400, 0.8, 25);
    ambientFireLight.position.y = 0.5;
    campfireGroup.add(ambientFireLight);

    // Interaction prompt sprite
    const promptCanvas = document.createElement('canvas');
    const ctx = promptCanvas.getContext('2d')!;
    promptCanvas.width = 256;
    promptCanvas.height = 64;
    ctx.fillStyle = 'rgba(255, 200, 100, 0.9)';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('[ Sit by the fire ]', 128, 40);
    const promptTexture = new THREE.CanvasTexture(promptCanvas);
    const promptMat = new THREE.SpriteMaterial({ map: promptTexture, transparent: true });
    const prompt = new THREE.Sprite(promptMat);
    prompt.scale.set(3, 0.75, 1);
    prompt.position.y = 3.5;
    campfireGroup.add(prompt);

    // Position in front of spawn
    campfireGroup.position.set(0, 0, -8);

    return campfireGroup;
  }

  public static animate(terminal: THREE.Group, delta: number, time: number): void {
    // Find fire particles (index after stones, logs, ember)
    const fireIndex = 15; // 10 stones + 4 logs + 1 ember
    const fire = terminal.children[fireIndex] as THREE.Points;
    if (fire && fire.geometry) {
      const positions = fire.geometry.attributes.position.array as Float32Array;
      const colors = fire.geometry.attributes.color.array as Float32Array;
      const speeds = fire.geometry.attributes.speed?.array as Float32Array;

      for (let i = 0; i < positions.length / 3; i++) {
        // Move particles up using pre-computed speed
        const speed = speeds ? speeds[i] : 2;
        positions[i * 3 + 1] += delta * speed;

        // Reset when too high
        if (positions[i * 3 + 1] > 2.5) {
          // Use time-based pseudo-random for reset position
          const angle = (time * 3 + i * 0.7) % (Math.PI * 2);
          const radius = ((i * 0.13) % 1) * 0.4;
          positions[i * 3] = Math.cos(angle) * radius;
          positions[i * 3 + 1] = 0.3;
          positions[i * 3 + 2] = Math.sin(angle) * radius;
        }

        // Wobble using sin/cos instead of random (cheaper)
        const wobble = Math.sin(time * 5 + i * 0.5) * delta * 0.3;
        positions[i * 3] += wobble;
        positions[i * 3 + 2] += Math.cos(time * 4 + i * 0.7) * delta * 0.3;

        // Update colors based on height
        const height = positions[i * 3 + 1] - 0.3;
        const t = height / 2;
        colors[i * 3] = 1;
        colors[i * 3 + 1] = 0.3 + t * 0.5;
        colors[i * 3 + 2] = t * 0.2;
      }
      fire.geometry.attributes.position.needsUpdate = true;
      fire.geometry.attributes.color.needsUpdate = true;
    }

    // Animate sparks
    const sparks = terminal.children[fireIndex + 1] as THREE.Points;
    if (sparks && sparks.geometry) {
      const positions = sparks.geometry.attributes.position.array as Float32Array;
      const speeds = sparks.geometry.attributes.speed?.array as Float32Array;

      for (let i = 0; i < positions.length / 3; i++) {
        const speed = speeds ? speeds[i] : 3;
        positions[i * 3 + 1] += delta * speed;

        // Wobble using sin/cos
        positions[i * 3] += Math.sin(time * 6 + i) * delta * 0.2;
        positions[i * 3 + 2] += Math.cos(time * 5 + i) * delta * 0.2;

        if (positions[i * 3 + 1] > 4) {
          const angle = (time * 2 + i * 0.9) % (Math.PI * 2);
          const radius = ((i * 0.17) % 1) * 0.2;
          positions[i * 3] = Math.cos(angle) * radius;
          positions[i * 3 + 1] = 0.5;
          positions[i * 3 + 2] = Math.sin(angle) * radius;
        }
      }
      sparks.geometry.attributes.position.needsUpdate = true;
    }

    // Flicker the fire lights
    const fireLight = terminal.children[fireIndex + 2] as THREE.PointLight;
    if (fireLight) {
      fireLight.intensity = 1.8 + Math.sin(time * 10) * 0.4 + Math.sin(time * 7) * 0.3;
    }

    const ambientLight = terminal.children[fireIndex + 3] as THREE.PointLight;
    if (ambientLight) {
      ambientLight.intensity = 0.7 + Math.sin(time * 8) * 0.2;
    }
  }
}
