import * as THREE from 'three';
import { PlanetConfig } from '../config/planets';

export class Skybox {
  private mesh: THREE.Mesh;

  constructor() {
    this.mesh = this.createSkybox();
  }

  private createSkybox(): THREE.Mesh {
    const skyGeometry = new THREE.SphereGeometry(2500, 32, 32);

    const skyMaterial = new THREE.ShaderMaterial({
      uniforms: {
        topColor: { value: new THREE.Color(0x0a0a20) },
        bottomColor: { value: new THREE.Color(0x000000) },
        horizonColor: { value: new THREE.Color(0x1a1a3a) },
        offset: { value: 20 },
        exponent: { value: 0.6 },
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        uniform vec3 horizonColor;
        uniform float offset;
        uniform float exponent;
        varying vec3 vWorldPosition;
        void main() {
          float h = normalize(vWorldPosition + offset).y;
          float t = max(pow(max(h, 0.0), exponent), 0.0);
          vec3 sky = mix(horizonColor, topColor, t);
          float b = max(pow(max(-h, 0.0), exponent * 0.5), 0.0);
          sky = mix(sky, bottomColor, b);
          gl_FragColor = vec4(sky, 1.0);
        }
      `,
      side: THREE.BackSide,
    });

    return new THREE.Mesh(skyGeometry, skyMaterial);
  }

  public getMesh(): THREE.Mesh {
    return this.mesh;
  }

  public updateColors(config: PlanetConfig): void {
    const material = this.mesh.material as THREE.ShaderMaterial;

    // Create variations of the sky color
    const baseColor = new THREE.Color(config.skyColor);
    const topColor = baseColor.clone().multiplyScalar(0.5);
    const horizonColor = baseColor.clone().lerp(new THREE.Color(config.lightColor), 0.15);

    material.uniforms.topColor.value = topColor;
    material.uniforms.horizonColor.value = horizonColor;
    material.uniforms.bottomColor.value = new THREE.Color(0x000000);
  }
}
