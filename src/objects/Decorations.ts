import * as THREE from 'three';
import { planets } from '../config/planets';
import { Campus } from './Campus';
import { Terrain } from '../environment/Terrain';

export class Decorations {
  // ============================================
  // SHARED MATERIALS - Created once, reused everywhere for performance
  // ============================================
  private static readonly mats = {
    // Woods
    wood: new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.8 }),
    darkWood: new THREE.MeshStandardMaterial({ color: 0x3d2817, roughness: 0.7 }),
    lightWood: new THREE.MeshStandardMaterial({ color: 0x654321, roughness: 0.8 }),
    trunk: new THREE.MeshStandardMaterial({ color: 0x4a3728, roughness: 0.9 }),

    // Stone
    stone: new THREE.MeshStandardMaterial({ color: 0x6b6b6b, roughness: 0.9, flatShading: true }),
    darkStone: new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 0.8 }),
    lightStone: new THREE.MeshStandardMaterial({ color: 0x8888a0, roughness: 0.7 }),

    // Metal
    metal: new THREE.MeshStandardMaterial({ color: 0x8b7355, metalness: 0.6, roughness: 0.4 }),
    brass: new THREE.MeshStandardMaterial({ color: 0xb5a642, metalness: 0.7, roughness: 0.3 }),
    darkMetal: new THREE.MeshStandardMaterial({ color: 0x3d3d3d }),
    copper: new THREE.MeshStandardMaterial({ color: 0xb87333 }),

    // Nature
    leaves: new THREE.MeshStandardMaterial({ color: 0x2d5a27, flatShading: true }),
    bush: new THREE.MeshStandardMaterial({ color: 0x2a4a2a }),
    grass: new THREE.MeshStandardMaterial({ color: 0x3d5c3d, roughness: 0.9 }),

    // Fabric/Furniture
    cushion: new THREE.MeshStandardMaterial({ color: 0x8b4557, roughness: 0.9 }),

    // Paper/Books
    paper: new THREE.MeshStandardMaterial({ color: 0xf5f5dc }),
    scroll: new THREE.MeshStandardMaterial({ color: 0xd4b896, roughness: 0.9 }),

    // Book colors
    bookRed: new THREE.MeshStandardMaterial({ color: 0x8b0000, roughness: 0.9 }),
    bookGreen: new THREE.MeshStandardMaterial({ color: 0x006400, roughness: 0.9 }),
    bookBlue: new THREE.MeshStandardMaterial({ color: 0x00008b, roughness: 0.9 }),
    bookPurple: new THREE.MeshStandardMaterial({ color: 0x4b0082, roughness: 0.9 }),
    bookBrown: new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.9 }),
    bookTeal: new THREE.MeshStandardMaterial({ color: 0x2f4f4f, roughness: 0.9 }),
    bookMaroon: new THREE.MeshStandardMaterial({ color: 0x800000, roughness: 0.9 }),
    bookNavy: new THREE.MeshStandardMaterial({ color: 0x191970, roughness: 0.9 }),

    // Emissive/Glow
    flame: new THREE.MeshBasicMaterial({ color: 0xffaa22 }),
    flameYellow: new THREE.MeshBasicMaterial({ color: 0xffdd44, transparent: true, opacity: 0.9 }),
    flameCore: new THREE.MeshBasicMaterial({ color: 0xffffaa, transparent: true, opacity: 1 }),
    candle: new THREE.MeshStandardMaterial({ color: 0xf5f5dc }),

    // Misc
    black: new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 }),
    white: new THREE.MeshStandardMaterial({ color: 0xf5f5f5 }),
    roofDark: new THREE.MeshStandardMaterial({ color: 0x2a2a2a }),
    lens: new THREE.MeshStandardMaterial({ color: 0x4488aa, metalness: 0.9, roughness: 0.1 }),
    mushroomCap: new THREE.MeshStandardMaterial({ color: 0xcc4444 }),
    mushroomSpot: new THREE.MeshStandardMaterial({ color: 0xffffee }),
  };

  // Book materials array for random selection
  private static readonly bookMats = [
    Decorations.mats.bookRed,
    Decorations.mats.bookGreen,
    Decorations.mats.bookBlue,
    Decorations.mats.bookPurple,
    Decorations.mats.bookBrown,
    Decorations.mats.bookTeal,
    Decorations.mats.bookMaroon,
    Decorations.mats.bookNavy,
  ];

  // Check if position is too close to any portal tent (portals are at distance 25 at various angles)
  private static isNearPortal(x: number, z: number): boolean {
    // Portal positions depend on the number of connections
    // Home planet has 5 portals evenly distributed
    const portalDistance = 18;
    // Tent is 6 wide x 5 deep, add small buffer
    const clearanceRadius = 5;

    // For home planet, there are 5 portals
    const numPortals = 5;
    for (let i = 0; i < numPortals; i++) {
      const angle = (i / numPortals) * Math.PI * 2 - Math.PI / 2;
      const portalX = Math.cos(angle) * portalDistance;
      const portalZ = Math.sin(angle) * portalDistance;

      const dx = x - portalX;
      const dz = z - portalZ;
      const dist = Math.sqrt(dx * dx + dz * dz);

      // Circular clearance matching tent size
      if (dist < clearanceRadius) {
        return true;
      }
    }
    return false;
  }

  private static createRock(scale: number): THREE.Mesh {
    const geo = new THREE.DodecahedronGeometry(scale, 0);
    const rock = new THREE.Mesh(geo, this.mats.stone);
    rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    rock.castShadow = true;
    return rock;
  }

  private static createBush(): THREE.Group {
    const bush = new THREE.Group();

    // Low-poly bush using icosahedrons
    for (let i = 0; i < 2; i++) {
      const size = 0.5 + Math.random() * 0.3;
      const sphere = new THREE.Mesh(
        new THREE.IcosahedronGeometry(size, 0),
        this.mats.bush
      );
      sphere.position.set(
        (Math.random() - 0.5) * 0.4,
        size * 0.7,
        (Math.random() - 0.5) * 0.4
      );
      sphere.rotation.set(Math.random(), Math.random(), Math.random());
      bush.add(sphere);
    }
    return bush;
  }

  private static createMushroom(): THREE.Group {
    const mushroom = new THREE.Group();

    // Stem
    const stemGeo = new THREE.CylinderGeometry(0.08, 0.1, 0.3, 6);
    const stem = new THREE.Mesh(stemGeo, this.mats.candle); // cream color
    stem.position.y = 0.15;
    mushroom.add(stem);

    // Cap
    const capGeo = new THREE.SphereGeometry(0.2, 6, 4, 0, Math.PI * 2, 0, Math.PI / 2);
    const cap = new THREE.Mesh(capGeo, this.mats.mushroomCap);
    cap.position.y = 0.3;
    mushroom.add(cap);

    return mushroom;
  }

  // Shared flower materials
  private static flowerColors = [0xff69b4, 0xffff00, 0xff6347, 0x9370db, 0xffffff];
  private static flowerMaterials = Decorations.flowerColors.map(
    c => new THREE.MeshStandardMaterial({ color: c })
  );

  // @ts-ignore
  private static flowerCenterMaterial = new THREE.MeshStandardMaterial({ color: 0xffd700 });
  private static stemMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22 });

  private static createFlower(): THREE.Group {
    const flower = new THREE.Group();

    // Stem - minimal segments
    const stemGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.4, 3);
    const stem = new THREE.Mesh(stemGeo, this.stemMaterial);
    stem.position.y = 0.2;
    flower.add(stem);

    // Flower head - single low-poly shape
    const petalMat = this.flowerMaterials[Math.floor(Math.random() * this.flowerMaterials.length)];
    const head = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.08, 0),
      petalMat
    );
    head.position.y = 0.4;
    flower.add(head);

    return flower;
  }

  private static createDeskSetup(): THREE.Group {
    const setup = new THREE.Group();

    // Desk materials
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x5c4033 });
    const darkWoodMat = new THREE.MeshStandardMaterial({ color: 0x3d2817 });
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, metalness: 0.8, roughness: 0.3 });

    // Desk top
    const deskTopGeo = new THREE.BoxGeometry(2.4, 0.08, 1.2);
    const deskTop = new THREE.Mesh(deskTopGeo, woodMat);
    deskTop.position.y = 0.75;
    deskTop.castShadow = true;
    deskTop.receiveShadow = true;
    setup.add(deskTop);

    // Desk legs
    const legGeo = new THREE.BoxGeometry(0.08, 0.75, 0.08);
    const legPositions = [
      [-1.1, 0.375, -0.5],
      [-1.1, 0.375, 0.5],
      [1.1, 0.375, -0.5],
      [1.1, 0.375, 0.5]
    ];
    for (const pos of legPositions) {
      const leg = new THREE.Mesh(legGeo, darkWoodMat);
      leg.position.set(pos[0], pos[1], pos[2]);
      leg.castShadow = true;
      setup.add(leg);
    }

    // Monitor
    const monitorStandGeo = new THREE.BoxGeometry(0.3, 0.05, 0.2);
    const monitorStand = new THREE.Mesh(monitorStandGeo, metalMat);
    monitorStand.position.set(0, 0.82, -0.3);
    setup.add(monitorStand);

    const monitorNeckGeo = new THREE.BoxGeometry(0.08, 0.25, 0.08);
    const monitorNeck = new THREE.Mesh(monitorNeckGeo, metalMat);
    monitorNeck.position.set(0, 0.97, -0.3);
    setup.add(monitorNeck);

    const monitorFrameGeo = new THREE.BoxGeometry(1.2, 0.7, 0.05);
    const monitorFrame = new THREE.Mesh(monitorFrameGeo, metalMat);
    monitorFrame.position.set(0, 1.45, -0.35);
    monitorFrame.castShadow = true;
    setup.add(monitorFrame);

    // Monitor screen (emissive for glow effect)
    const screenMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e,
      emissive: 0x4444ff,
      emissiveIntensity: 0.3,
    });
    const screenGeo = new THREE.BoxGeometry(1.1, 0.6, 0.02);
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(0, 1.45, -0.32);
    setup.add(screen);

    // Keyboard
    const keyboardMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
    const keyboardGeo = new THREE.BoxGeometry(0.5, 0.03, 0.18);
    const keyboard = new THREE.Mesh(keyboardGeo, keyboardMat);
    keyboard.position.set(0, 0.81, 0.1);
    setup.add(keyboard);

    // Mouse
    const mouseMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
    const mouseGeo = new THREE.BoxGeometry(0.08, 0.025, 0.12);
    const mouse = new THREE.Mesh(mouseGeo, mouseMat);
    mouse.position.set(0.4, 0.805, 0.15);
    setup.add(mouse);

    // Mouse pad
    const mousepadMat = new THREE.MeshStandardMaterial({ color: 0x2d2d2d });
    const mousepadGeo = new THREE.BoxGeometry(0.25, 0.005, 0.2);
    const mousepad = new THREE.Mesh(mousepadGeo, mousepadMat);
    mousepad.position.set(0.4, 0.795, 0.15);
    setup.add(mousepad);

    // Office chair
    const chairGroup = new THREE.Group();
    chairGroup.position.set(0, 0, 1.1);
    chairGroup.rotation.y = Math.PI; // Face the desk

    // Chair base (5-star)
    const chairBaseMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const armGeo = new THREE.BoxGeometry(0.05, 0.03, 0.35);
      const arm = new THREE.Mesh(armGeo, chairBaseMat);
      arm.position.set(Math.sin(angle) * 0.15, 0.05, Math.cos(angle) * 0.15);
      arm.rotation.y = angle;
      chairGroup.add(arm);

      // Wheel
      const wheelGeo = new THREE.SphereGeometry(0.04, 6, 4);
      const wheel = new THREE.Mesh(wheelGeo, chairBaseMat);
      wheel.position.set(Math.sin(angle) * 0.3, 0.04, Math.cos(angle) * 0.3);
      chairGroup.add(wheel);
    }

    // Chair cylinder
    const cylinderGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.4, 8);
    const cylinder = new THREE.Mesh(cylinderGeo, metalMat);
    cylinder.position.y = 0.25;
    chairGroup.add(cylinder);

    // Chair seat
    const seatMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a });
    const seatGeo = new THREE.BoxGeometry(0.5, 0.08, 0.5);
    const seat = new THREE.Mesh(seatGeo, seatMat);
    seat.position.y = 0.5;
    seat.castShadow = true;
    chairGroup.add(seat);

    // Chair back
    const backGeo = new THREE.BoxGeometry(0.48, 0.6, 0.08);
    const back = new THREE.Mesh(backGeo, seatMat);
    back.position.set(0, 0.85, -0.22);
    back.rotation.x = 0.1;
    back.castShadow = true;
    chairGroup.add(back);

    setup.add(chairGroup);

    // Small desk lamp
    const lampBaseMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const lampBaseGeo = new THREE.CylinderGeometry(0.1, 0.12, 0.03, 8);
    const lampBase = new THREE.Mesh(lampBaseGeo, lampBaseMat);
    lampBase.position.set(-0.9, 0.81, -0.3);
    setup.add(lampBase);

    const lampArmGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.4, 6);
    const lampArm = new THREE.Mesh(lampArmGeo, lampBaseMat);
    lampArm.position.set(-0.9, 1.02, -0.3);
    lampArm.rotation.z = 0.3;
    setup.add(lampArm);

    const lampHeadGeo = new THREE.ConeGeometry(0.1, 0.15, 8);
    const lampHead = new THREE.Mesh(lampHeadGeo, lampBaseMat);
    lampHead.position.set(-0.78, 1.2, -0.3);
    lampHead.rotation.z = Math.PI + 0.5;
    setup.add(lampHead);

    // Lamp light
    const lampLight = new THREE.PointLight(0xfff5e6, 0.5, 3);
    lampLight.position.set(-0.75, 1.1, -0.3);
    setup.add(lampLight);

    // Coffee mug
    const mugMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee });
    const mugGeo = new THREE.CylinderGeometry(0.05, 0.045, 0.1, 8);
    const mug = new THREE.Mesh(mugGeo, mugMat);
    mug.position.set(0.9, 0.84, 0.2);
    setup.add(mug);

    // Mug handle
    const handleGeo = new THREE.TorusGeometry(0.03, 0.008, 6, 8, Math.PI);
    const handle = new THREE.Mesh(handleGeo, mugMat);
    handle.position.set(0.95, 0.84, 0.2);
    handle.rotation.y = Math.PI / 2;
    setup.add(handle);

    return setup;
  }

  private static createPetBed(): THREE.Group {
    const bed = new THREE.Group();

    // Bed base (oval cushion)
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 }); // Brown
    const baseGeo = new THREE.CylinderGeometry(0.7, 0.75, 0.15, 16);
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.scale.set(1, 1, 0.8); // Make it oval
    base.position.y = 0.08;
    bed.add(base);

    // Soft cushion inside (lighter color)
    const cushionMat = new THREE.MeshStandardMaterial({ color: 0xdeb887 }); // Tan/beige
    const cushionGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.1, 16);
    const cushion = new THREE.Mesh(cushionGeo, cushionMat);
    cushion.scale.set(1, 1, 0.8);
    cushion.position.y = 0.12;
    bed.add(cushion);

    // Raised rim/edge around the bed
    const rimMat = new THREE.MeshStandardMaterial({ color: 0x6b4423 }); // Darker brown
    const rimGeo = new THREE.TorusGeometry(0.62, 0.1, 8, 24);
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.rotation.x = Math.PI / 2;
    rim.scale.set(1, 0.8, 1);
    rim.position.y = 0.18;
    bed.add(rim);

    // Small bone toy
    const boneMat = new THREE.MeshStandardMaterial({ color: 0xf5f5dc });
    const boneCenter = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 0.15, 6),
      boneMat
    );
    boneCenter.rotation.z = Math.PI / 2;
    boneCenter.position.set(0.3, 0.2, 0.1);
    bed.add(boneCenter);

    // Bone ends
    const boneEndGeo = new THREE.SphereGeometry(0.05, 6, 4);
    const boneEnd1 = new THREE.Mesh(boneEndGeo, boneMat);
    boneEnd1.position.set(0.22, 0.2, 0.1);
    bed.add(boneEnd1);
    const boneEnd2 = new THREE.Mesh(boneEndGeo, boneMat);
    boneEnd2.position.set(0.38, 0.2, 0.1);
    bed.add(boneEnd2);

    return bed;
  }

  private static createServerRack(): THREE.Group {
    const rack = new THREE.Group();

    // Rack frame
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });

    // Main cabinet body
    const cabinetGeo = new THREE.BoxGeometry(0.8, 2, 0.6);
    const cabinet = new THREE.Mesh(cabinetGeo, frameMat);
    cabinet.position.y = 1;
    cabinet.castShadow = true;
    rack.add(cabinet);

    // Front panel (slightly inset, with ventilation look)
    const frontMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0a });
    const frontGeo = new THREE.BoxGeometry(0.75, 1.9, 0.02);
    const front = new THREE.Mesh(frontGeo, frontMat);
    front.position.set(0, 1, 0.3);
    rack.add(front);

    // Server units (blinking lights effect)
    const serverMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
    const ledGreen = new THREE.MeshStandardMaterial({
      color: 0x00ff00,
      emissive: 0x00ff00,
      emissiveIntensity: 0.8
    });
    const ledBlue = new THREE.MeshStandardMaterial({
      color: 0x0088ff,
      emissive: 0x0088ff,
      emissiveIntensity: 0.5
    });

    // Add server units
    for (let i = 0; i < 5; i++) {
      const serverGeo = new THREE.BoxGeometry(0.7, 0.25, 0.5);
      const server = new THREE.Mesh(serverGeo, serverMat);
      server.position.set(0, 0.3 + i * 0.35, 0.02);
      rack.add(server);

      // LED lights on each server
      const ledGeo = new THREE.BoxGeometry(0.02, 0.02, 0.01);
      for (let j = 0; j < 3; j++) {
        const led = new THREE.Mesh(ledGeo, j === 0 ? ledGreen : ledBlue);
        led.position.set(-0.25 + j * 0.08, 0.3 + i * 0.35, 0.28);
        rack.add(led);
      }
    }

    // Side vents
    const ventMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    for (let side = -1; side <= 1; side += 2) {
      const ventGeo = new THREE.BoxGeometry(0.02, 1.5, 0.4);
      const vent = new THREE.Mesh(ventGeo, ventMat);
      vent.position.set(side * 0.41, 1, 0);
      rack.add(vent);
    }

    // Top vent
    const topVentGeo = new THREE.BoxGeometry(0.6, 0.02, 0.4);
    const topVent = new THREE.Mesh(topVentGeo, ventMat);
    topVent.position.set(0, 2.01, 0);
    rack.add(topVent);

    // Small status display
    const displayMat = new THREE.MeshStandardMaterial({
      color: 0x001a00,
      emissive: 0x003300,
      emissiveIntensity: 0.3
    });
    const displayGeo = new THREE.BoxGeometry(0.15, 0.08, 0.01);
    const display = new THREE.Mesh(displayGeo, displayMat);
    display.position.set(0.2, 1.85, 0.31);
    rack.add(display);

    return rack;
  }

  private static createCoffeeCup(fallen: boolean = false): THREE.Group {
    const cup = new THREE.Group();

    const mugMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee });
    const mugGeo = new THREE.CylinderGeometry(0.045, 0.04, 0.09, 8);
    const mug = new THREE.Mesh(mugGeo, mugMat);
    mug.position.y = 0.045;
    cup.add(mug);

    // Handle
    const handleGeo = new THREE.TorusGeometry(0.025, 0.007, 6, 8, Math.PI);
    const handle = new THREE.Mesh(handleGeo, mugMat);
    handle.position.set(0.045, 0.045, 0);
    handle.rotation.y = Math.PI / 2;
    cup.add(handle);

    // Coffee residue inside (dark)
    const coffeeMat = new THREE.MeshStandardMaterial({ color: 0x3d2314 });
    const coffeeGeo = new THREE.CylinderGeometry(0.038, 0.038, 0.01, 8);
    const coffee = new THREE.Mesh(coffeeGeo, coffeeMat);
    coffee.position.y = 0.03;
    cup.add(coffee);

    if (fallen) {
      cup.rotation.x = Math.PI / 2;
      cup.rotation.z = Math.random() * Math.PI * 2;
    }

    return cup;
  }

  private static createRadioSpeaker(): THREE.Group {
    const radio = new THREE.Group();

    // Main body
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a });
    const bodyGeo = new THREE.BoxGeometry(0.4, 0.25, 0.15);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.125;
    radio.add(body);

    // Speaker grilles
    const grilleMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
    const grilleGeo = new THREE.CircleGeometry(0.08, 12);

    const grille1 = new THREE.Mesh(grilleGeo, grilleMat);
    grille1.position.set(-0.1, 0.12, 0.076);
    radio.add(grille1);

    const grille2 = new THREE.Mesh(grilleGeo, grilleMat);
    grille2.position.set(0.1, 0.12, 0.076);
    radio.add(grille2);

    // Display
    const displayMat = new THREE.MeshStandardMaterial({
      color: 0x001a33,
      emissive: 0x0066aa,
      emissiveIntensity: 0.4
    });
    const displayGeo = new THREE.BoxGeometry(0.12, 0.04, 0.01);
    const display = new THREE.Mesh(displayGeo, displayMat);
    display.position.set(0, 0.2, 0.076);
    radio.add(display);

    // Buttons/knobs
    const knobMat = new THREE.MeshStandardMaterial({ color: 0x444444 });
    const knobGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.02, 8);

    for (let i = 0; i < 3; i++) {
      const knob = new THREE.Mesh(knobGeo, knobMat);
      knob.rotation.x = Math.PI / 2;
      knob.position.set(-0.12 + i * 0.06, 0.05, 0.08);
      radio.add(knob);
    }

    // Antenna
    const antennaMat = new THREE.MeshStandardMaterial({ color: 0x666666, metalness: 0.8 });
    const antennaGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.3, 6);
    const antenna = new THREE.Mesh(antennaGeo, antennaMat);
    antenna.position.set(0.15, 0.35, 0);
    antenna.rotation.z = -0.3;
    radio.add(antenna);

    return radio;
  }

  private static createTrashBin(): THREE.Group {
    const bin = new THREE.Group();

    // Bin body (solid cylinder with walls)
    const binMat = new THREE.MeshStandardMaterial({ color: 0x333333, side: THREE.DoubleSide });

    // Outer shell
    const outerGeo = new THREE.CylinderGeometry(0.2, 0.18, 0.4, 12);
    const outer = new THREE.Mesh(outerGeo, binMat);
    outer.position.y = 0.2;
    bin.add(outer);

    // Inner cavity (slightly smaller, darker)
    const innerMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
    const innerGeo = new THREE.CylinderGeometry(0.18, 0.16, 0.38, 12);
    const inner = new THREE.Mesh(innerGeo, innerMat);
    inner.position.y = 0.22;
    bin.add(inner);

    // Rim at top
    const rimGeo = new THREE.TorusGeometry(0.19, 0.02, 6, 12);
    const rim = new THREE.Mesh(rimGeo, binMat);
    rim.position.y = 0.4;
    rim.rotation.x = Math.PI / 2;
    bin.add(rim);

    // Crumpled paper balls
    const paperMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f0 });
    const paperPositions = [
      { x: 0, y: 0.25, z: 0 },
      { x: 0.06, y: 0.3, z: 0.04 },
      { x: -0.05, y: 0.28, z: -0.03 },
      { x: 0.03, y: 0.35, z: -0.05 },
      { x: -0.04, y: 0.32, z: 0.06 },
      { x: 0, y: 0.38, z: 0 },
    ];

    for (const pos of paperPositions) {
      const paperGeo = new THREE.DodecahedronGeometry(0.04 + Math.random() * 0.02, 0);
      const paper = new THREE.Mesh(paperGeo, paperMat);
      paper.position.set(pos.x, pos.y, pos.z);
      paper.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      bin.add(paper);
    }

    // One paper ball fallen next to bin
    const fallenPaper = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.045, 0),
      paperMat
    );
    fallenPaper.position.set(0.25, 0.04, 0.1);
    fallenPaper.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    bin.add(fallenPaper);

    return bin;
  }

  private static createBicycle(): THREE.Group {
    const bike = new THREE.Group();

    const frameMat = new THREE.MeshStandardMaterial({ color: 0x2255aa }); // Blue frame
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.7 });
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
    const seatMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a });

    // Key positions
    const wheelRadius = 0.32;
    const wheelBase = 1.0; // Distance between wheel centers
    const bottomBracketHeight = 0.28;
    const seatTubeTop = { x: -0.15, y: 0.75 };
    const headTubeTop = { x: 0.4, y: 0.72 };
    const bottomBracket = { x: 0, y: bottomBracketHeight };

    // Helper to create tube between two points
    const createTube = (
      from: { x: number; y: number },
      to: { x: number; y: number },
      radius: number,
      material: THREE.Material
    ): THREE.Mesh => {
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);

      const geo = new THREE.CylinderGeometry(radius, radius, length, 6);
      const mesh = new THREE.Mesh(geo, material);
      mesh.position.set((from.x + to.x) / 2, (from.y + to.y) / 2, 0);
      mesh.rotation.z = angle - Math.PI / 2;
      return mesh;
    };

    // Wheels
    const wheelGeo = new THREE.TorusGeometry(wheelRadius, 0.02, 8, 20);

    const backWheelX = -wheelBase / 2;
    const frontWheelX = wheelBase / 2;

    const backWheel = new THREE.Mesh(wheelGeo, tireMat);
    backWheel.position.set(backWheelX, wheelRadius, 0);
    // No rotation - wheel stands upright facing along Z axis
    bike.add(backWheel);

    const frontWheel = new THREE.Mesh(wheelGeo, tireMat);
    frontWheel.position.set(frontWheelX, wheelRadius, 0);
    // No rotation - wheel stands upright facing along Z axis
    bike.add(frontWheel);

    // Wheel hubs
    const hubGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.04, 8);
    const backHub = new THREE.Mesh(hubGeo, metalMat);
    backHub.position.set(backWheelX, wheelRadius, 0);
    backHub.rotation.x = Math.PI / 2;
    bike.add(backHub);

    const frontHub = new THREE.Mesh(hubGeo, metalMat);
    frontHub.position.set(frontWheelX, wheelRadius, 0);
    frontHub.rotation.x = Math.PI / 2;
    bike.add(frontHub);

    // Frame tubes
    // Top tube (seat to head)
    bike.add(createTube(seatTubeTop, headTubeTop, 0.018, frameMat));

    // Down tube (head to bottom bracket)
    bike.add(createTube(headTubeTop, bottomBracket, 0.02, frameMat));

    // Seat tube (seat to bottom bracket)
    bike.add(createTube(seatTubeTop, bottomBracket, 0.02, frameMat));

    // Chain stays (bottom bracket to rear wheel)
    const rearAxle = { x: backWheelX, y: wheelRadius };
    bike.add(createTube(bottomBracket, rearAxle, 0.012, frameMat));

    // Seat stays (seat tube top to rear wheel)
    bike.add(createTube({ x: seatTubeTop.x, y: seatTubeTop.y - 0.1 }, rearAxle, 0.01, frameMat));

    // Fork (head tube to front wheel)
    const frontAxle = { x: frontWheelX, y: wheelRadius };
    bike.add(createTube(headTubeTop, frontAxle, 0.015, frameMat));

    // Head tube
    bike.add(createTube(headTubeTop, { x: headTubeTop.x, y: headTubeTop.y + 0.1 }, 0.02, frameMat));

    // Handlebar stem
    const stemTop = { x: headTubeTop.x + 0.05, y: headTubeTop.y + 0.18 };
    bike.add(createTube({ x: headTubeTop.x, y: headTubeTop.y + 0.1 }, stemTop, 0.012, metalMat));

    // Handlebars
    const handlebarGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.4, 6);
    const handlebar = new THREE.Mesh(handlebarGeo, metalMat);
    handlebar.position.set(stemTop.x, stemTop.y, 0);
    handlebar.rotation.x = Math.PI / 2;
    bike.add(handlebar);

    // Handlebar grips
    const gripMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
    const gripGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.08, 6);
    const grip1 = new THREE.Mesh(gripGeo, gripMat);
    grip1.position.set(stemTop.x, stemTop.y, 0.18);
    grip1.rotation.x = Math.PI / 2;
    bike.add(grip1);
    const grip2 = new THREE.Mesh(gripGeo, gripMat);
    grip2.position.set(stemTop.x, stemTop.y, -0.18);
    grip2.rotation.x = Math.PI / 2;
    bike.add(grip2);

    // Seat post
    const seatPostTop = { x: seatTubeTop.x - 0.02, y: seatTubeTop.y + 0.12 };
    bike.add(createTube(seatTubeTop, seatPostTop, 0.015, metalMat));

    // Seat
    const seatGeo = new THREE.BoxGeometry(0.24, 0.04, 0.14);
    const seat = new THREE.Mesh(seatGeo, seatMat);
    seat.position.set(seatPostTop.x, seatPostTop.y + 0.02, 0);
    bike.add(seat);

    // Crank and pedals
    const crankGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.16, 6);
    const crank = new THREE.Mesh(crankGeo, metalMat);
    crank.position.set(bottomBracket.x, bottomBracket.y, 0);
    crank.rotation.x = Math.PI / 2;
    bike.add(crank);

    const pedalGeo = new THREE.BoxGeometry(0.1, 0.015, 0.06);
    const pedal1 = new THREE.Mesh(pedalGeo, metalMat);
    pedal1.position.set(bottomBracket.x, bottomBracket.y - 0.08, 0.1);
    bike.add(pedal1);
    const pedal2 = new THREE.Mesh(pedalGeo, metalMat);
    pedal2.position.set(bottomBracket.x, bottomBracket.y + 0.08, -0.1);
    bike.add(pedal2);

    // Kickstand (so it stands up)
    const kickstandGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.35, 6);
    const kickstand = new THREE.Mesh(kickstandGeo, metalMat);
    kickstand.position.set(-0.1, 0.15, 0.08);
    kickstand.rotation.z = 0.4;
    kickstand.rotation.x = 0.15;
    bike.add(kickstand);

    return bike;
  }

  private static createBookStack(): THREE.Group {
    const stack = new THREE.Group();

    const numBooks = 4 + Math.floor(Math.random() * 3);
    let currentHeight = 0;

    for (let i = 0; i < numBooks; i++) {
      const width = 0.18 + Math.random() * 0.08;
      const height = 0.03 + Math.random() * 0.02;
      const depth = 0.25 + Math.random() * 0.05;

      const bookGeo = new THREE.BoxGeometry(width, height, depth);
      // Use shared book materials
      const mat = this.bookMats[Math.floor(Math.random() * this.bookMats.length)];
      const book = new THREE.Mesh(bookGeo, mat);

      book.position.y = currentHeight + height / 2;
      // Slight random rotation for messiness
      book.rotation.y = (Math.random() - 0.5) * 0.15;
      book.position.x = (Math.random() - 0.5) * 0.03;
      book.position.z = (Math.random() - 0.5) * 0.03;

      stack.add(book);
      currentHeight += height;
    }

    return stack;
  }

  private static createPaperStack(): THREE.Group {
    const stack = new THREE.Group();
    const numSheets = 8 + Math.floor(Math.random() * 6);
    let currentHeight = 0;

    for (let i = 0; i < numSheets; i++) {
      const width = 0.21; // A4-ish paper width
      const height = 0.003; // Very thin
      const depth = 0.29; // A4-ish paper depth

      const sheetGeo = new THREE.BoxGeometry(width, height, depth);
      const sheet = new THREE.Mesh(sheetGeo, this.mats.paper);

      sheet.position.y = currentHeight + height / 2;
      // Random slight offset and rotation for messy pile effect
      sheet.rotation.y = (Math.random() - 0.5) * 0.1;
      sheet.position.x = (Math.random() - 0.5) * 0.02;
      sheet.position.z = (Math.random() - 0.5) * 0.02;

      stack.add(sheet);
      currentHeight += height + 0.001; // Small gap
    }

    // Add a few sheets askew on top
    for (let i = 0; i < 2; i++) {
      const sheet = new THREE.Mesh(
        new THREE.BoxGeometry(0.21, 0.003, 0.29),
        this.mats.paper
      );
      sheet.position.y = currentHeight + 0.01;
      sheet.rotation.y = (Math.random() - 0.5) * 0.5;
      sheet.rotation.z = (Math.random() - 0.5) * 0.1;
      sheet.position.x = (Math.random() - 0.5) * 0.05;
      sheet.position.z = (Math.random() - 0.5) * 0.05;
      stack.add(sheet);
    }

    return stack;
  }

  private static createMiniFridge(): THREE.Group {
    const fridge = new THREE.Group();

    // Main body
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee });
    const bodyGeo = new THREE.BoxGeometry(0.5, 0.7, 0.45);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.35;
    body.castShadow = true;
    fridge.add(body);

    // Door
    const doorMat = new THREE.MeshStandardMaterial({ color: 0xdddddd });
    const doorGeo = new THREE.BoxGeometry(0.48, 0.68, 0.02);
    const door = new THREE.Mesh(doorGeo, doorMat);
    door.position.set(0, 0.35, 0.24);
    fridge.add(door);

    // Handle
    const handleMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.5 });
    const handleGeo = new THREE.BoxGeometry(0.03, 0.15, 0.03);
    const handle = new THREE.Mesh(handleGeo, handleMat);
    handle.position.set(0.18, 0.45, 0.26);
    fridge.add(handle);

    // Brand logo area (small rectangle)
    const logoMat = new THREE.MeshStandardMaterial({ color: 0x3366cc });
    const logoGeo = new THREE.BoxGeometry(0.12, 0.04, 0.01);
    const logo = new THREE.Mesh(logoGeo, logoMat);
    logo.position.set(0, 0.6, 0.25);
    fridge.add(logo);

    // Feet
    const footMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const footGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.02, 8);
    const footPositions = [
      { x: -0.2, z: -0.18 },
      { x: 0.2, z: -0.18 },
      { x: -0.2, z: 0.18 },
      { x: 0.2, z: 0.18 },
    ];
    for (const pos of footPositions) {
      const foot = new THREE.Mesh(footGeo, footMat);
      foot.position.set(pos.x, 0.01, pos.z);
      fridge.add(foot);
    }

    return fridge;
  }

  private static createWorkbench(): THREE.Group {
    const bench = new THREE.Group();

    // Workbench materials
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x8b7355 });
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.6, roughness: 0.4 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x333333 });

    // Bench top (thick wooden surface)
    const topGeo = new THREE.BoxGeometry(1.6, 0.1, 0.8);
    const top = new THREE.Mesh(topGeo, woodMat);
    top.position.y = 0.85;
    top.castShadow = true;
    top.receiveShadow = true;
    bench.add(top);

    // Legs (4 sturdy legs)
    const legGeo = new THREE.BoxGeometry(0.1, 0.85, 0.1);
    const legPositions = [
      [-0.7, 0.425, -0.3],
      [-0.7, 0.425, 0.3],
      [0.7, 0.425, -0.3],
      [0.7, 0.425, 0.3]
    ];
    for (const pos of legPositions) {
      const leg = new THREE.Mesh(legGeo, woodMat);
      leg.position.set(pos[0], pos[1], pos[2]);
      leg.castShadow = true;
      bench.add(leg);
    }

    // Cross braces for stability
    const braceGeo = new THREE.BoxGeometry(1.4, 0.06, 0.06);
    const brace1 = new THREE.Mesh(braceGeo, woodMat);
    brace1.position.set(0, 0.25, -0.3);
    bench.add(brace1);
    const brace2 = new THREE.Mesh(braceGeo, woodMat);
    brace2.position.set(0, 0.25, 0.3);
    bench.add(brace2);

    // Lower shelf
    const shelfGeo = new THREE.BoxGeometry(1.4, 0.05, 0.6);
    const shelf = new THREE.Mesh(shelfGeo, woodMat);
    shelf.position.set(0, 0.4, 0);
    bench.add(shelf);

    // === DRILL ===
    const drillGroup = new THREE.Group();

    // Drill body (main housing)
    const drillBodyGeo = new THREE.BoxGeometry(0.2, 0.12, 0.08);
    const drillBody = new THREE.Mesh(drillBodyGeo, new THREE.MeshStandardMaterial({ color: 0xdd4422 })); // Orange/red drill
    drillBody.position.set(0, 0.06, 0);
    drillGroup.add(drillBody);

    // Drill motor housing (bulkier back part)
    const motorGeo = new THREE.CylinderGeometry(0.05, 0.06, 0.1, 8);
    const motor = new THREE.Mesh(motorGeo, new THREE.MeshStandardMaterial({ color: 0xcc3311 }));
    motor.rotation.z = Math.PI / 2;
    motor.position.set(-0.12, 0.06, 0);
    drillGroup.add(motor);

    // Handle (grip)
    const handleGeo = new THREE.BoxGeometry(0.05, 0.12, 0.06);
    const handle = new THREE.Mesh(handleGeo, darkMat);
    handle.position.set(-0.05, -0.02, 0);
    drillGroup.add(handle);

    // Chuck (where bit attaches)
    const chuckGeo = new THREE.CylinderGeometry(0.025, 0.03, 0.04, 8);
    const chuck = new THREE.Mesh(chuckGeo, metalMat);
    chuck.rotation.z = Math.PI / 2;
    chuck.position.set(0.12, 0.06, 0);
    drillGroup.add(chuck);

    // Drill bit
    const bitGeo = new THREE.CylinderGeometry(0.008, 0.003, 0.1, 6);
    const bit = new THREE.Mesh(bitGeo, metalMat);
    bit.rotation.z = Math.PI / 2;
    bit.position.set(0.19, 0.06, 0);
    drillGroup.add(bit);

    // Trigger
    const triggerGeo = new THREE.BoxGeometry(0.02, 0.04, 0.03);
    const trigger = new THREE.Mesh(triggerGeo, darkMat);
    trigger.position.set(0.02, 0, 0);
    drillGroup.add(trigger);

    // Position drill on workbench (lying on its side)
    drillGroup.position.set(0.4, 0.9, 0.15);
    drillGroup.rotation.y = 0.3;
    bench.add(drillGroup);

    // Add some other workbench items

    // Small toolbox
    const toolboxGeo = new THREE.BoxGeometry(0.25, 0.12, 0.15);
    const toolbox = new THREE.Mesh(toolboxGeo, new THREE.MeshStandardMaterial({ color: 0x224488 }));
    toolbox.position.set(-0.5, 0.96, 0.2);
    bench.add(toolbox);

    // Screwdriver
    const screwdriverHandle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.018, 0.1, 6),
      new THREE.MeshStandardMaterial({ color: 0xffcc00 })
    );
    screwdriverHandle.position.set(-0.2, 0.95, -0.2);
    screwdriverHandle.rotation.z = Math.PI / 2 + 0.1;
    bench.add(screwdriverHandle);

    const screwdriverShaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.006, 0.006, 0.12, 6),
      metalMat
    );
    screwdriverShaft.position.set(-0.09, 0.94, -0.2);
    screwdriverShaft.rotation.z = Math.PI / 2 + 0.1;
    bench.add(screwdriverShaft);

    // A few screws/nails scattered
    for (let i = 0; i < 4; i++) {
      const screwGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.025, 4);
      const screw = new THREE.Mesh(screwGeo, metalMat);
      screw.position.set(
        0.1 + (Math.random() - 0.5) * 0.3,
        0.91,
        -0.1 + (Math.random() - 0.5) * 0.2
      );
      screw.rotation.x = Math.PI / 2;
      screw.rotation.z = Math.random() * Math.PI;
      bench.add(screw);
    }

    // Tape measure
    const tapeMeasureGeo = new THREE.BoxGeometry(0.08, 0.08, 0.03);
    const tapeMeasure = new THREE.Mesh(tapeMeasureGeo, new THREE.MeshStandardMaterial({ color: 0xffff00 }));
    tapeMeasure.position.set(0.6, 0.94, -0.25);
    tapeMeasure.rotation.y = 0.5;
    bench.add(tapeMeasure);

    return bench;
  }

  private static createBBQ(): THREE.Group {
    const bbq = new THREE.Group();

    const metalMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.6, roughness: 0.4 });
    const grillMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.7 });
    const fireMat = new THREE.MeshStandardMaterial({ color: 0xff4500, emissive: 0xff2200, emissiveIntensity: 0.6 });

    // Simple square grill body
    const bodyGeo = new THREE.BoxGeometry(0.8, 0.3, 0.5);
    const body = new THREE.Mesh(bodyGeo, metalMat);
    body.position.y = 0.75;
    body.castShadow = true;
    bbq.add(body);

    // Grill top surface
    const topGeo = new THREE.BoxGeometry(0.75, 0.02, 0.45);
    const top = new THREE.Mesh(topGeo, grillMat);
    top.position.y = 0.92;
    bbq.add(top);

    // Open lid (tilted back)
    const lidGeo = new THREE.BoxGeometry(0.8, 0.05, 0.5);
    const lid = new THREE.Mesh(lidGeo, metalMat);
    lid.position.set(0, 1.1, -0.35);
    lid.rotation.x = -Math.PI / 3;
    bbq.add(lid);

    // Small fire glow inside
    const fireGeo = new THREE.IcosahedronGeometry(0.15, 0);
    const fire = new THREE.Mesh(fireGeo, fireMat);
    fire.position.set(0, 0.85, 0);
    fire.scale.set(1.5, 0.6, 1);
    bbq.add(fire);

    // Four legs
    for (let i = 0; i < 4; i++) {
      const xPos = (i % 2 === 0 ? -1 : 1) * 0.3;
      const zPos = (i < 2 ? -1 : 1) * 0.18;
      const legGeo = new THREE.BoxGeometry(0.05, 0.6, 0.05);
      const leg = new THREE.Mesh(legGeo, metalMat);
      leg.position.set(xPos, 0.3, zPos);
      bbq.add(leg);
    }

    return bbq;
  }

  private static createGardenTools(): THREE.Group {
    const tools = new THREE.Group();

    const woodMat = new THREE.MeshStandardMaterial({ color: 0x8b7355 });
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x666666, metalness: 0.5 });

    // Rake
    const rakeHandle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.025, 1.5, 6),
      woodMat
    );
    rakeHandle.position.set(0, 0.75, 0);
    rakeHandle.rotation.z = 0.15;
    tools.add(rakeHandle);

    // Rake head
    const rakeHeadGeo = new THREE.BoxGeometry(0.3, 0.02, 0.05);
    const rakeHead = new THREE.Mesh(rakeHeadGeo, metalMat);
    rakeHead.position.set(0.1, 0.05, 0);
    rakeHead.rotation.z = 0.15;
    tools.add(rakeHead);

    // Rake tines
    for (let i = -4; i <= 4; i++) {
      const tineGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.1, 4);
      const tine = new THREE.Mesh(tineGeo, metalMat);
      tine.position.set(0.1 + i * 0.03, 0, 0);
      tine.rotation.x = Math.PI / 2;
      tools.add(tine);
    }

    // Shovel (leaning next to rake)
    const shovelHandle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.025, 1.4, 6),
      woodMat
    );
    shovelHandle.position.set(0.15, 0.7, 0.1);
    shovelHandle.rotation.z = 0.2;
    tools.add(shovelHandle);

    // Shovel blade
    const shovelBladeGeo = new THREE.BoxGeometry(0.2, 0.25, 0.02);
    const shovelBlade = new THREE.Mesh(shovelBladeGeo, metalMat);
    shovelBlade.position.set(0.22, 0.08, 0.1);
    shovelBlade.rotation.z = 0.2;
    shovelBlade.rotation.x = -0.3;
    tools.add(shovelBlade);

    // Watering can nearby
    const canMat = new THREE.MeshStandardMaterial({ color: 0x2e8b57 });
    const canBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.1, 0.2, 8),
      canMat
    );
    canBody.position.set(-0.3, 0.1, 0.2);
    tools.add(canBody);

    // Watering can spout
    const spoutGeo = new THREE.CylinderGeometry(0.02, 0.035, 0.2, 6);
    const spout = new THREE.Mesh(spoutGeo, canMat);
    spout.position.set(-0.2, 0.15, 0.2);
    spout.rotation.z = -0.8;
    tools.add(spout);

    // Watering can handle
    const canHandleGeo = new THREE.TorusGeometry(0.06, 0.012, 6, 12, Math.PI);
    const canHandle = new THREE.Mesh(canHandleGeo, canMat);
    canHandle.position.set(-0.3, 0.22, 0.2);
    canHandle.rotation.x = Math.PI / 2;
    tools.add(canHandle);

    return tools;
  }

  private static createDogToys(): THREE.Group {
    const toys = new THREE.Group();

    // Tennis ball
    const ballMat = new THREE.MeshStandardMaterial({ color: 0xccff00 });
    const ball = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 8, 6),
      ballMat
    );
    ball.position.set(0, 0.06, 0);
    toys.add(ball);

    // White stripe on tennis ball
    const stripeMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const stripe = new THREE.Mesh(
      new THREE.TorusGeometry(0.06, 0.008, 4, 16),
      stripeMat
    );
    stripe.position.set(0, 0.06, 0);
    stripe.rotation.x = Math.PI / 2;
    toys.add(stripe);

    // Rope toy
    const ropeMat = new THREE.MeshStandardMaterial({ color: 0xcc8844 });
    const rope2Mat = new THREE.MeshStandardMaterial({ color: 0x4488cc });

    const ropeGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.35, 8);
    const rope = new THREE.Mesh(ropeGeo, ropeMat);
    rope.position.set(0.25, 0.03, 0.15);
    rope.rotation.z = Math.PI / 2;
    rope.rotation.y = 0.5;
    toys.add(rope);

    // Rope knots
    const knotGeo = new THREE.SphereGeometry(0.05, 6, 5);
    const knot1 = new THREE.Mesh(knotGeo, rope2Mat);
    knot1.position.set(0.08, 0.03, 0.1);
    toys.add(knot1);
    const knot2 = new THREE.Mesh(knotGeo, rope2Mat);
    knot2.position.set(0.42, 0.03, 0.2);
    toys.add(knot2);

    // Frisbee
    const frisbeeMat = new THREE.MeshStandardMaterial({ color: 0xff4444 });
    const frisbeeGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.02, 16);
    const frisbee = new THREE.Mesh(frisbeeGeo, frisbeeMat);
    frisbee.position.set(-0.3, 0.01, 0.3);
    frisbee.rotation.x = 0.1;
    toys.add(frisbee);

    // Frisbee rim
    const rimGeo = new THREE.TorusGeometry(0.14, 0.015, 6, 16);
    const rim = new THREE.Mesh(rimGeo, frisbeeMat);
    rim.position.set(-0.3, 0.02, 0.3);
    rim.rotation.x = Math.PI / 2 + 0.1;
    toys.add(rim);

    return toys;
  }

  private static createLeash(): THREE.Group {
    const leash = new THREE.Group();

    // Leash material (nylon-like)
    const leashMat = new THREE.MeshStandardMaterial({ color: 0x2244aa });
    const metalMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.7 });

    // Coiled leash on ground
    const coilRadius = 0.15;
    const coils = 3;
    for (let i = 0; i < 20; i++) {
      const t = i / 20;
      const angle = t * Math.PI * 2 * coils;
      const r = coilRadius * (1 - t * 0.3);
      const segGeo = new THREE.SphereGeometry(0.015, 4, 3);
      const seg = new THREE.Mesh(segGeo, leashMat);
      seg.position.set(
        Math.cos(angle) * r,
        0.02 + t * 0.08,
        Math.sin(angle) * r
      );
      leash.add(seg);
    }

    // Handle loop
    const handleGeo = new THREE.TorusGeometry(0.06, 0.012, 6, 12);
    const handle = new THREE.Mesh(handleGeo, leashMat);
    handle.position.set(0, 0.12, 0);
    handle.rotation.x = Math.PI / 3;
    leash.add(handle);

    // Metal clip at end
    const clipGeo = new THREE.BoxGeometry(0.025, 0.04, 0.01);
    const clip = new THREE.Mesh(clipGeo, metalMat);
    clip.position.set(0.12, 0.03, 0.08);
    leash.add(clip);

    return leash;
  }

  private static createRubberDuck(): THREE.Group {
    const duck = new THREE.Group();

    const yellowMat = new THREE.MeshStandardMaterial({ color: 0xffd700 });
    const orangeMat = new THREE.MeshStandardMaterial({ color: 0xff8c00 });
    const blackMat = new THREE.MeshStandardMaterial({ color: 0x111111 });

    // Body
    const bodyGeo = new THREE.SphereGeometry(0.06, 10, 8);
    const body = new THREE.Mesh(bodyGeo, yellowMat);
    body.scale.set(1, 0.85, 1.1);
    body.position.y = 0.05;
    duck.add(body);

    // Head
    const headGeo = new THREE.SphereGeometry(0.04, 8, 6);
    const head = new THREE.Mesh(headGeo, yellowMat);
    head.position.set(0, 0.11, 0.04);
    duck.add(head);

    // Beak
    const beakGeo = new THREE.ConeGeometry(0.015, 0.03, 6);
    const beak = new THREE.Mesh(beakGeo, orangeMat);
    beak.position.set(0, 0.1, 0.08);
    beak.rotation.x = Math.PI / 2;
    duck.add(beak);

    // Eyes
    const eyeGeo = new THREE.SphereGeometry(0.008, 6, 4);
    const eye1 = new THREE.Mesh(eyeGeo, blackMat);
    eye1.position.set(-0.02, 0.125, 0.065);
    duck.add(eye1);
    const eye2 = new THREE.Mesh(eyeGeo, blackMat);
    eye2.position.set(0.02, 0.125, 0.065);
    duck.add(eye2);

    // Tail (small bump at back)
    const tailGeo = new THREE.SphereGeometry(0.02, 6, 4);
    const tail = new THREE.Mesh(tailGeo, yellowMat);
    tail.position.set(0, 0.07, -0.07);
    duck.add(tail);

    return duck;
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

  // ============================================
  // Ancient Library components for Memoria/Story world
  // ============================================
  private static createBookshelf(height: number = 3): THREE.Group {
    const shelf = new THREE.Group();

    // Side panels
    const sideGeo = new THREE.BoxGeometry(0.1, height, 0.8);
    const leftSide = new THREE.Mesh(sideGeo, this.mats.wood);
    leftSide.position.set(-0.75, height / 2, 0);
    leftSide.castShadow = true;
    shelf.add(leftSide);

    const rightSide = new THREE.Mesh(sideGeo, this.mats.wood);
    rightSide.position.set(0.75, height / 2, 0);
    rightSide.castShadow = true;
    shelf.add(rightSide);

    // Back panel
    const backGeo = new THREE.BoxGeometry(1.6, height, 0.05);
    const back = new THREE.Mesh(backGeo, this.mats.darkWood);
    back.position.set(0, height / 2, -0.375);
    shelf.add(back);

    // Shelves with books
    const shelfCount = Math.floor(height / 0.7);
    const shelfGeo = new THREE.BoxGeometry(1.5, 0.08, 0.75);
    for (let i = 0; i <= shelfCount; i++) {
      const shelfBoard = new THREE.Mesh(shelfGeo, this.mats.wood);
      shelfBoard.position.set(0, i * 0.7 + 0.1, 0);
      shelf.add(shelfBoard);

      // Add books on each shelf (except top)
      if (i < shelfCount) {
        const books = this.createBookRow();
        books.position.set(0, i * 0.7 + 0.3, 0);
        shelf.add(books);
      }
    }

    // Top decorative trim
    const trimGeo = new THREE.BoxGeometry(1.7, 0.15, 0.85);
    const trim = new THREE.Mesh(trimGeo, this.mats.darkWood);
    trim.position.y = height + 0.05;
    shelf.add(trim);

    return shelf;
  }

  private static createBookRow(): THREE.Group {
    const books = new THREE.Group();

    let xPos = -0.6;
    while (xPos < 0.6) {
      const width = 0.06 + Math.random() * 0.08;
      const height = 0.35 + Math.random() * 0.15;
      const depth = 0.5 + Math.random() * 0.15;

      // Use shared book materials
      const mat = this.bookMats[Math.floor(Math.random() * this.bookMats.length)];

      const bookGeo = new THREE.BoxGeometry(width, height, depth);
      const book = new THREE.Mesh(bookGeo, mat);

      book.rotation.z = (Math.random() - 0.5) * 0.1;
      book.position.set(xPos + width / 2, height / 2, (Math.random() - 0.5) * 0.1);

      books.add(book);
      xPos += width + 0.01;
    }

    return books;
  }

  private static createReadingNook(): THREE.Group {
    const nook = new THREE.Group();

    // Armchair base
    const baseGeo = new THREE.BoxGeometry(1.2, 0.4, 1.2);
    const base = new THREE.Mesh(baseGeo, this.mats.lightWood);
    base.position.y = 0.2;
    base.castShadow = true;
    nook.add(base);

    // Seat cushion
    const cushionGeo = new THREE.BoxGeometry(1.0, 0.15, 1.0);
    const cushion = new THREE.Mesh(cushionGeo, this.mats.cushion);
    cushion.position.y = 0.48;
    nook.add(cushion);

    // Back rest
    const backGeo = new THREE.BoxGeometry(1.2, 1.0, 0.2);
    const backRest = new THREE.Mesh(backGeo, this.mats.lightWood);
    backRest.position.set(0, 0.9, -0.5);
    backRest.castShadow = true;
    nook.add(backRest);

    // Back cushion
    const backCushionGeo = new THREE.BoxGeometry(1.0, 0.8, 0.15);
    const backCushion = new THREE.Mesh(backCushionGeo, this.mats.cushion);
    backCushion.position.set(0, 0.9, -0.35);
    nook.add(backCushion);

    // Armrests
    const armGeo = new THREE.BoxGeometry(0.15, 0.5, 1.0);
    const leftArm = new THREE.Mesh(armGeo, this.mats.lightWood);
    leftArm.position.set(-0.525, 0.65, 0);
    nook.add(leftArm);

    const rightArm = new THREE.Mesh(armGeo, this.mats.lightWood);
    rightArm.position.set(0.525, 0.65, 0);
    nook.add(rightArm);

    // Small side table
    const tableLegGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.5, 6);
    const tableTopGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.05, 12);

    const tableTop = new THREE.Mesh(tableTopGeo, this.mats.lightWood);
    tableTop.position.set(1.0, 0.55, 0);
    nook.add(tableTop);

    const tableLeg = new THREE.Mesh(tableLegGeo, this.mats.lightWood);
    tableLeg.position.set(1.0, 0.25, 0);
    nook.add(tableLeg);

    // Candle on table
    const candleGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.15, 8);
    const candle = new THREE.Mesh(candleGeo, this.mats.candle);
    candle.position.set(1.0, 0.65, 0);
    nook.add(candle);

    // Flame
    const flameGeo = new THREE.ConeGeometry(0.025, 0.06, 6);
    const flame = new THREE.Mesh(flameGeo, this.mats.flame);
    flame.position.set(1.0, 0.76, 0);
    nook.add(flame);

    // Candle light
    const candleLight = new THREE.PointLight(0xffaa44, 0.4, 5);
    candleLight.position.set(1.0, 0.8, 0);
    nook.add(candleLight);

    return nook;
  }

  private static createStudyDesk(): THREE.Group {
    const desk = new THREE.Group();

    // Desk top
    const topGeo = new THREE.BoxGeometry(2.0, 0.1, 1.0);
    const top = new THREE.Mesh(topGeo, this.mats.wood);
    top.position.y = 0.8;
    top.castShadow = true;
    desk.add(top);

    // Legs
    const legGeo = new THREE.BoxGeometry(0.1, 0.8, 0.1);
    const legPositions = [
      { x: -0.9, z: -0.4 },
      { x: -0.9, z: 0.4 },
      { x: 0.9, z: -0.4 },
      { x: 0.9, z: 0.4 },
    ];
    for (const pos of legPositions) {
      const leg = new THREE.Mesh(legGeo, this.mats.wood);
      leg.position.set(pos.x, 0.4, pos.z);
      leg.castShadow = true;
      desk.add(leg);
    }

    // Open book on desk
    const leftPage = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.02, 0.5), this.mats.paper);
    leftPage.position.set(-0.25, 0.87, 0);
    leftPage.rotation.z = 0.05;
    desk.add(leftPage);

    const rightPage = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.02, 0.5), this.mats.paper);
    rightPage.position.set(0.25, 0.87, 0);
    rightPage.rotation.z = -0.05;
    desk.add(rightPage);

    const spine = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.04, 0.52), this.mats.bookBrown);
    spine.position.set(0, 0.86, 0);
    desk.add(spine);

    // Quill and inkwell
    const inkwell = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.08, 8), this.mats.black);
    inkwell.position.set(0.7, 0.89, -0.3);
    desk.add(inkwell);

    const quill = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.002, 0.25, 4), this.mats.white);
    quill.position.set(0.72, 0.95, -0.28);
    quill.rotation.z = 0.3;
    quill.rotation.x = 0.2;
    desk.add(quill);

    // Desk candle holder
    const holder = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.05, 8), this.mats.copper);
    holder.position.set(-0.7, 0.87, -0.3);
    desk.add(holder);

    const deskCandle = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.12, 8), this.mats.candle);
    deskCandle.position.set(-0.7, 0.95, -0.3);
    desk.add(deskCandle);

    const deskFlame = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.05, 6), this.mats.flame);
    deskFlame.position.set(-0.7, 1.04, -0.3);
    desk.add(deskFlame);

    const deskLight = new THREE.PointLight(0xffaa44, 0.5, 6);
    deskLight.position.set(-0.7, 1.1, -0.3);
    desk.add(deskLight);

    return desk;
  }

  private static createScrollRack(): THREE.Group {
    const rack = new THREE.Group();

    // Frame
    const frameH = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.08, 0.3), this.mats.lightWood);
    frameH.position.y = 1.2;
    rack.add(frameH);

    const frameH2 = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.08, 0.3), this.mats.lightWood);
    frameH2.position.y = 0.1;
    rack.add(frameH2);

    const frameV1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.2, 0.3), this.mats.lightWood);
    frameV1.position.set(-0.7, 0.65, 0);
    rack.add(frameV1);

    const frameV2 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.2, 0.3), this.mats.lightWood);
    frameV2.position.set(0.7, 0.65, 0);
    rack.add(frameV2);

    // Scrolls in cubbies
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 4; col++) {
        if (Math.random() > 0.3) {
          const scroll = new THREE.Mesh(
            new THREE.CylinderGeometry(0.06, 0.06, 0.25, 8),
            this.mats.scroll
          );
          scroll.rotation.z = Math.PI / 2;
          scroll.position.set(-0.5 + col * 0.35, 0.3 + row * 0.35, 0);
          rack.add(scroll);
        }
      }
    }

    return rack;
  }

  private static createLantern(): THREE.Group {
    const lantern = new THREE.Group();

    // Simple post
    const postGeo = new THREE.BoxGeometry(0.12, 2, 0.12);
    const post = new THREE.Mesh(postGeo, this.mats.trunk);
    post.position.y = 1;
    lantern.add(post);

    // Simple lantern box frame
    const frameGeo = new THREE.BoxGeometry(0.3, 0.4, 0.3);
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x222222,
      metalness: 0.6,
      transparent: true,
      opacity: 0.7
    });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.y = 2.2;
    lantern.add(frame);

    // Glowing flame - cone shape, bright emissive
    const flameMat = new THREE.MeshStandardMaterial({
      color: 0xffaa00,
      emissive: 0xff6600,
      emissiveIntensity: 2
    });
    const flameGeo = new THREE.ConeGeometry(0.06, 0.15, 6);
    const flame = new THREE.Mesh(flameGeo, flameMat);
    flame.position.y = 2.15;
    flame.userData.isLanternFlame = true;
    flame.userData.baseY = 2.15;
    lantern.add(flame);

    // Bright core
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xffffaa,
      emissive: 0xffff66,
      emissiveIntensity: 3
    });
    const coreGeo = new THREE.ConeGeometry(0.03, 0.1, 4);
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.position.y = 2.13;
    core.userData.isLanternCore = true;
    core.userData.baseY = 2.13;
    lantern.add(core);

    // Simple roof
    const roofGeo = new THREE.ConeGeometry(0.22, 0.15, 4);
    const roof = new THREE.Mesh(roofGeo, this.mats.roofDark);
    roof.position.y = 2.48;
    roof.rotation.y = Math.PI / 4;
    lantern.add(roof);

    // Warm glow light
    const light = new THREE.PointLight(0xffaa44, 1.2, 12);
    light.position.y = 2.2;
    light.userData.isLanternLight = true;
    light.userData.baseIntensity = 1.2;
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

  // Shared fern material
  private static fernMaterial = new THREE.MeshStandardMaterial({
    color: 0x2e5a1c,
    side: THREE.DoubleSide
  });

  private static createFern(): THREE.Group {
    const fern = new THREE.Group();

    // Multiple fronds radiating out - reduced to 4
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + Math.random() * 0.3;
      const frondLength = 0.6 + Math.random() * 0.3;

      const frondGeo = new THREE.PlaneGeometry(0.15, frondLength);
      const frond = new THREE.Mesh(frondGeo, this.fernMaterial);
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

  // Shared grass material
  private static grassMaterial = new THREE.MeshStandardMaterial({
    color: 0x3d6b2a,
    side: THREE.DoubleSide
  });

  private static createTallGrass(): THREE.Group {
    const grass = new THREE.Group();

    // Several grass blades - reduced count
    const bladeCount = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < bladeCount; i++) {
      const height = 0.4 + Math.random() * 0.4;
      const bladeGeo = new THREE.PlaneGeometry(0.05, height);
      const blade = new THREE.Mesh(bladeGeo, this.grassMaterial);
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
    const size = 0.35 + Math.random() * 0.15;

    // Simple box log
    const logGeo = new THREE.BoxGeometry(length, size, size);
    const logMesh = new THREE.Mesh(logGeo, this.mats.wood);
    logMesh.castShadow = true;
    log.add(logMesh);

    // Store radius for positioning
    log.userData.radius = size / 2;

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

  private static createTree(scale: number, bushiness: number = 1): THREE.Group {
    const tree = new THREE.Group();

    const trunkHeight = 5 * scale;
    const trunkGeo = new THREE.CylinderGeometry(0.3 * scale, 0.5 * scale, trunkHeight, 8);
    const trunk = new THREE.Mesh(trunkGeo, this.mats.trunk);
    trunk.position.y = trunkHeight / 2;
    trunk.castShadow = true;
    tree.add(trunk);

    // Layered foliage - bushiness affects width
    const leaves1 = new THREE.Mesh(
      new THREE.ConeGeometry(3 * scale * bushiness, 4 * scale, 8),
      this.mats.leaves
    );
    leaves1.position.y = trunkHeight + 1 * scale;
    leaves1.castShadow = true;
    tree.add(leaves1);

    const leaves2 = new THREE.Mesh(
      new THREE.ConeGeometry(2.2 * scale * bushiness, 3 * scale, 8),
      this.mats.leaves
    );
    leaves2.position.y = trunkHeight + 3 * scale;
    leaves2.castShadow = true;
    tree.add(leaves2);

    const leaves3 = new THREE.Mesh(
      new THREE.ConeGeometry(1.4 * scale * bushiness, 2 * scale, 8),
      this.mats.leaves
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

    // Story/Memoria planet - Ancient Library
    if (planetId === 'story') {
      // Central study area
      const studyDesk = this.createStudyDesk();
      studyDesk.position.set(0, Terrain.getTerrainHeight(0, 0), 0);
      studyDesk.rotation.y = Math.PI;
      objects.push(studyDesk);

      // Bookshelves arranged in sections representing life chapters

      // Section 1: Early Life (behind spawn, to the left)
      const earlyLifeShelves = [
        { x: -12, z: -8, rot: 0.3 },
        { x: -15, z: -6, rot: 0.2 },
        { x: -18, z: -4, rot: 0.1 },
      ];
      for (const pos of earlyLifeShelves) {
        const shelf = this.createBookshelf(2.5);
        shelf.position.set(pos.x, Terrain.getTerrainHeight(pos.x, pos.z), pos.z);
        shelf.rotation.y = pos.rot;
        objects.push(shelf);
      }

      // Reading nook for Early Life section
      const nook1 = this.createReadingNook();
      nook1.position.set(-14, Terrain.getTerrainHeight(-14, -2), -2);
      nook1.rotation.y = Math.PI * 0.3;
      objects.push(nook1);

      // Section 2: Education (to the right)
      const educationShelves = [
        { x: 12, z: -8, rot: -0.3 },
        { x: 15, z: -6, rot: -0.2 },
        { x: 18, z: -4, rot: -0.1 },
      ];
      for (const pos of educationShelves) {
        const shelf = this.createBookshelf(3);
        shelf.position.set(pos.x, Terrain.getTerrainHeight(pos.x, pos.z), pos.z);
        shelf.rotation.y = pos.rot;
        objects.push(shelf);
      }

      // Scroll rack for education
      const scrolls = this.createScrollRack();
      scrolls.position.set(14, Terrain.getTerrainHeight(14, -2), -2);
      scrolls.rotation.y = -Math.PI * 0.2;
      objects.push(scrolls);

      // Section 3: Career Start (front left)
      const careerStartShelves = [
        { x: -10, z: 10, rot: -0.4 },
        { x: -14, z: 12, rot: -0.3 },
      ];
      for (const pos of careerStartShelves) {
        const shelf = this.createBookshelf(3.5);
        shelf.position.set(pos.x, Terrain.getTerrainHeight(pos.x, pos.z), pos.z);
        shelf.rotation.y = pos.rot;
        objects.push(shelf);
      }

      const nook2 = this.createReadingNook();
      nook2.position.set(-8, Terrain.getTerrainHeight(-8, 14), 14);
      nook2.rotation.y = Math.PI * 0.8;
      objects.push(nook2);

      // Section 4: Growth & Experience (front right)
      const growthShelves = [
        { x: 10, z: 10, rot: 0.4 },
        { x: 14, z: 12, rot: 0.3 },
      ];
      for (const pos of growthShelves) {
        const shelf = this.createBookshelf(4);
        shelf.position.set(pos.x, Terrain.getTerrainHeight(pos.x, pos.z), pos.z);
        shelf.rotation.y = pos.rot;
        objects.push(shelf);
      }

      // Section 5: Present Day (directly ahead, taller shelves)
      const presentShelves = [
        { x: -4, z: 20, rot: 0.1 },
        { x: 0, z: 22, rot: 0 },
        { x: 4, z: 20, rot: -0.1 },
      ];
      for (const pos of presentShelves) {
        const shelf = this.createBookshelf(4.5);
        shelf.position.set(pos.x, Terrain.getTerrainHeight(pos.x, pos.z), pos.z);
        shelf.rotation.y = pos.rot;
        objects.push(shelf);
      }

      // Grand reading nook at the end
      const nook3 = this.createReadingNook();
      nook3.position.set(0, Terrain.getTerrainHeight(0, 16), 16);
      nook3.rotation.y = Math.PI;
      objects.push(nook3);

      // Ambient lanterns throughout
      const lanternPositions = [
        { x: -10, z: -5 }, { x: 10, z: -5 },
        { x: -12, z: 8 }, { x: 12, z: 8 },
        { x: -5, z: 18 }, { x: 5, z: 18 },
        { x: 0, z: 8 }, { x: -6, z: 0 }, { x: 6, z: 0 },
      ];
      for (const pos of lanternPositions) {
        const lantern = this.createLantern();
        lantern.position.set(pos.x, Terrain.getTerrainHeight(pos.x, pos.z), pos.z);
        objects.push(lantern);
      }

      // Scattered individual book stacks
      for (let i = 0; i < 8; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 5 + Math.random() * 10;
        const x = Math.cos(angle) * dist;
        const z = Math.sin(angle) * dist;

        if (this.isNearPortal(x, z)) continue;

        const books = this.createBookStack();
        books.position.set(x, Terrain.getTerrainHeight(x, z), z);
        books.rotation.y = Math.random() * Math.PI;
        objects.push(books);
      }

      return objects;
    }

    // Home planet gets lots of trees
    if (planetId === 'home') {
      // Cabin position (near spawn but away from portals which are at distance 25)
      const cabinX = -14;
      const cabinZ = 25;
      const cabinClearance = 12; // Keep trees away from cabin

      let treesPlaced = 0;
      let attempts = 0;
      const minTreeSpacing = 6; // Minimum distance between trees
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

      // === DEBUG: Portal clearance zone outlines (hidden by default, toggle with C key) ===
      const portalDistance = 18;
      const clearanceRadius = 5;
      const numPortals = 5;
      for (let i = 0; i < numPortals; i++) {
        const angle = (i / numPortals) * Math.PI * 2 - Math.PI / 2;
        const portalX = Math.cos(angle) * portalDistance;
        const portalZ = Math.sin(angle) * portalDistance;

        // Circular outline matching tent size
        const circleGeo = new THREE.RingGeometry(clearanceRadius - 0.1, clearanceRadius, 32);
        const circleMat = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide });
        const circle = new THREE.Mesh(circleGeo, circleMat);
        circle.rotation.x = -Math.PI / 2;
        circle.position.set(portalX, 0.1, portalZ);
        circle.visible = false;
        circle.userData.isDebugClearance = true;
        objects.push(circle);
      }

      // === TREES (200) ===
      while (treesPlaced < 200 && attempts < 2000) {
        attempts++;

        const angle = Math.random() * Math.PI * 2;
        // Trees form a forest ring surrounding the center clearing
        const distance = 14 + Math.random() * 35;
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

        const scale = 0.6 + Math.random() * 1.8;
        const bushiness = 0.5 + Math.random() * 0.6; // 0.5 (thin) to 1.1 (normal)
        const tree = this.createTree(scale, bushiness);

        const terrainY = Terrain.getTerrainHeight(x, z);
        tree.position.set(x, terrainY, z);
        tree.rotation.y = Math.random() * Math.PI * 2;

        treesPositions.push({ x, z });
        objects.push(tree);
        treesPlaced++;
      }

      // === CABIN ===
      const cabin = this.createCabin();
      cabin.position.set(cabinX, Terrain.getTerrainHeight(cabinX, cabinZ), cabinZ);
      cabin.rotation.y = Math.atan2(-cabinX, -cabinZ);
      objects.push(cabin);

      // === ALL SMALL ITEMS ===
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

      // Add stepping stones - path from spawn to campfire
      const stonePath = [
        { x: -2, z: -2 },
        { x: -3, z: -4 },
        { x: -2, z: -6 },
        { x: 0, z: -6 },
      ];
      for (const pos of stonePath) {
        const stone = this.createSteppingStone();
        const sx = pos.x + (Math.random() - 0.5) * 0.5;
        const sz = pos.z + (Math.random() - 0.5) * 0.5;
        stone.position.set(sx, Terrain.getTerrainHeight(sx, sz) + 0.05, sz);
        objects.push(stone);
      }

      // Desk position (opposite side from campfire)
      const deskX = 0;
      const deskZ = 5;

      // All object positions for exclusion zones
      const bedX = deskX + 3;
      const bedZ = deskZ + 0.5;
      const rackX = deskX - 3.5;
      const rackZ = deskZ + 1;
      const radioX = deskX + 2.5;
      const radioZ = deskZ - 1.5;
      const binX = -7;
      const binZ = 8;
      const bikeX = deskX - 5;
      const bikeZ = deskZ - 2;

      // Workbench position
      const workbenchX = -8;
      const workbenchZ = 9;

      // BBQ position (outdoor cooking area)
      const bbqX = 6;
      const bbqZ = 9;

      // Garden tools position (near cabin)
      const toolsX = cabinX + 8;
      const toolsZ = cabinZ - 2;

      // Second server rack position
      const rack2X = rackX - 1.2;
      const rack2Z = rackZ + 0.5;

      // Exclusion zones: { x, z, radius }
      const exclusionZones = [
        { x: 0, z: -8, r: 4 },       // Campfire
        { x: deskX, z: deskZ, r: 3.5 },  // Desk area
        { x: bedX, z: bedZ, r: 1.5 },    // Pet bed
        { x: rackX, z: rackZ, r: 1.2 },  // Server rack
        { x: rack2X, z: rack2Z, r: 1.2 }, // Second server rack
        { x: radioX, z: radioZ, r: 1 },  // Radio
        { x: binX, z: binZ, r: 0.8 },    // Bin
        { x: bikeX, z: bikeZ, r: 1.5 },  // Bike
        { x: cabinX, z: cabinZ, r: 8 },  // Cabin
        { x: workbenchX, z: workbenchZ, r: 1.5 },  // Workbench
        { x: bbqX, z: bbqZ, r: 1.2 },    // BBQ
        { x: toolsX, z: toolsZ, r: 1.5 }, // Garden tools
      ];

      // Helper to check if position is in any exclusion zone
      const isInExclusionZone = (x: number, z: number): boolean => {
        for (const zone of exclusionZones) {
          const dx = x - zone.x;
          const dz = z - zone.z;
          if (dx * dx + dz * dz < zone.r * zone.r) return true;
        }
        return false;
      };

      // Helper to check if too close to campfire (at 0, 0, -8)
      const isNearCampfire = (x: number, z: number): boolean => {
        const dx = x - 0;
        const dz = z - (-8);
        return dx * dx + dz * dz < 4 * 4;
      };

      // Helper to check if near desk area (larger zone for desk setup)
      const isNearDesk = (x: number, z: number): boolean => {
        const dx = x - deskX;
        const dz = z - deskZ;
        return dx * dx + dz * dz < 5 * 5;
      };

      // Add the desk setup (computer, chair, etc.)
      const deskSetup = this.createDeskSetup();
      deskSetup.position.set(deskX, Terrain.getTerrainHeight(deskX, deskZ), deskZ);
      // Face the desk towards spawn point
      deskSetup.rotation.y = Math.PI;
      objects.push(deskSetup);

      // Add Ivy's pet bed next to the desk
      const petBed = this.createPetBed();
      petBed.position.set(bedX, Terrain.getTerrainHeight(bedX, bedZ), bedZ);
      objects.push(petBed);

      // Add server rack near the desk
      const serverRack = this.createServerRack();
      serverRack.position.set(rackX, Terrain.getTerrainHeight(rackX, rackZ), rackZ);
      serverRack.rotation.y = Math.PI * 0.15; // Slightly angled
      objects.push(serverRack);

      // Empty coffee cups scattered around desk
      const cupPositions = [
        { x: deskX + 1.5, z: deskZ - 0.5, fallen: false },
        { x: deskX - 1.8, z: deskZ + 0.3, fallen: true },
        { x: deskX + 0.5, z: deskZ + 2.2, fallen: true },
        { x: deskX - 2.5, z: deskZ - 0.8, fallen: false },
      ];
      for (const pos of cupPositions) {
        const cup = this.createCoffeeCup(pos.fallen);
        cup.position.set(pos.x, Terrain.getTerrainHeight(pos.x, pos.z) + (pos.fallen ? 0.04 : 0), pos.z);
        cup.rotation.y = Math.random() * Math.PI * 2;
        objects.push(cup);
      }

      // Radio/speaker on a small area near the desk
      const radio = this.createRadioSpeaker();
      radio.position.set(radioX, Terrain.getTerrainHeight(radioX, radioZ), radioZ);
      radio.rotation.y = -0.3;
      objects.push(radio);

      // Trash bin with crumpled paper near desk
      const bin = this.createTrashBin();
      bin.position.set(binX, 0, binZ); // Place on flat ground
      objects.push(bin);

      // Bicycle parked nearby
      const bike = this.createBicycle();
      bike.position.set(bikeX, Terrain.getTerrainHeight(bikeX, bikeZ), bikeZ);
      bike.rotation.y = Math.PI * 0.3;
      objects.push(bike);

      // Stack of books near the campfire seating area
      const books1 = this.createBookStack();
      const books1X = -4;
      const books1Z = -10;
      books1.position.set(books1X, Terrain.getTerrainHeight(books1X, books1Z), books1Z);
      books1.rotation.y = Math.random() * Math.PI;
      objects.push(books1);

      // Another stack near the bench
      const books2 = this.createBookStack();
      const books2X = 4;
      const books2Z = -5;
      books2.position.set(books2X, Terrain.getTerrainHeight(books2X, books2Z), books2Z);
      books2.rotation.y = Math.random() * Math.PI;
      objects.push(books2);

      // More book stacks scattered around
      const books3 = this.createBookStack();
      const books3X = -6;
      const books3Z = 3;
      books3.position.set(books3X, Terrain.getTerrainHeight(books3X, books3Z), books3Z);
      books3.rotation.y = Math.random() * Math.PI;
      objects.push(books3);

      const books4 = this.createBookStack();
      const books4X = 6;
      const books4Z = 8;
      books4.position.set(books4X, Terrain.getTerrainHeight(books4X, books4Z), books4Z);
      books4.rotation.y = Math.random() * Math.PI;
      objects.push(books4);

      const books5 = this.createBookStack();
      const books5X = -2;
      const books5Z = 10;
      books5.position.set(books5X, Terrain.getTerrainHeight(books5X, books5Z), books5Z);
      books5.rotation.y = Math.random() * Math.PI;
      objects.push(books5);

      // Paper stacks around the area
      const papers1 = this.createPaperStack();
      const papers1X = deskX - 2;
      const papers1Z = deskZ + 1.5;
      papers1.position.set(papers1X, Terrain.getTerrainHeight(papers1X, papers1Z), papers1Z);
      papers1.rotation.y = 0.2;
      objects.push(papers1);

      const papers2 = this.createPaperStack();
      const papers2X = 2;
      const papers2Z = -12;
      papers2.position.set(papers2X, Terrain.getTerrainHeight(papers2X, papers2Z), papers2Z);
      papers2.rotation.y = -0.3;
      objects.push(papers2);

      const papers3 = this.createPaperStack();
      const papers3X = -5;
      const papers3Z = 7;
      papers3.position.set(papers3X, Terrain.getTerrainHeight(papers3X, papers3Z), papers3Z);
      papers3.rotation.y = Math.random() * Math.PI;
      objects.push(papers3);

      const papers4 = this.createPaperStack();
      const papers4X = 7;
      const papers4Z = 3;
      papers4.position.set(papers4X, Terrain.getTerrainHeight(papers4X, papers4Z), papers4Z);
      papers4.rotation.y = 1.2;
      objects.push(papers4);

      // Mini fridge between desk area and campfire
      const fridge = this.createMiniFridge();
      const fridgeX = 5;
      const fridgeZ = -2;
      fridge.position.set(fridgeX, Terrain.getTerrainHeight(fridgeX, fridgeZ), fridgeZ);
      fridge.rotation.y = -0.3;
      objects.push(fridge);

      // Workbench with drill (away from desk, near cabin side)
      const workbench = this.createWorkbench();
      workbench.position.set(workbenchX, Terrain.getTerrainHeight(workbenchX, workbenchZ), workbenchZ);
      workbench.rotation.y = 0.4; // Angled slightly
      objects.push(workbench);

      // BBQ grill for outdoor cooking
      const bbq = this.createBBQ();
      bbq.position.set(bbqX, Terrain.getTerrainHeight(bbqX, bbqZ), bbqZ);
      bbq.rotation.y = -0.5;
      objects.push(bbq);

      // Garden tools leaning against area near cabin
      const gardenTools = this.createGardenTools();
      gardenTools.position.set(toolsX, Terrain.getTerrainHeight(toolsX, toolsZ), toolsZ);
      gardenTools.rotation.y = 0.8;
      objects.push(gardenTools);

      // Second server rack next to the first one
      const serverRack2 = this.createServerRack();
      serverRack2.position.set(rack2X, Terrain.getTerrainHeight(rack2X, rack2Z), rack2Z);
      serverRack2.rotation.y = Math.PI * 0.1;
      objects.push(serverRack2);

      // Dog toys scattered near the pet bed
      const dogToys = this.createDogToys();
      const toysX = bedX - 1.5;
      const toysZ = bedZ + 1;
      dogToys.position.set(toysX, Terrain.getTerrainHeight(toysX, toysZ), toysZ);
      dogToys.rotation.y = 0.3;
      objects.push(dogToys);

      // Leash near the pet bed
      const leash = this.createLeash();
      const leashX = bedX + 0.8;
      const leashZ = bedZ - 0.5;
      leash.position.set(leashX, Terrain.getTerrainHeight(leashX, leashZ), leashZ);
      leash.rotation.y = 1.2;
      objects.push(leash);

      // Rubber duck on the desk (for debugging!)
      const rubberDuck = this.createRubberDuck();
      rubberDuck.position.set(deskX + 0.7, Terrain.getTerrainHeight(deskX, deskZ) + 0.9, deskZ - 0.1);
      rubberDuck.rotation.y = -0.5; // Looking at the monitor
      objects.push(rubberDuck);

      // Add moss patches around (avoiding all objects)
      for (let i = 0; i < 15; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = 15 + Math.random() * 20;
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;

        if (isInExclusionZone(x, z) || this.isNearPortal(x, z)) continue;

        const moss = this.createMoss();
        moss.position.set(x, Terrain.getTerrainHeight(x, z) + 0.01, z);
        objects.push(moss);
      }

      // === OUTER FLOWERS (60 clusters, ~400 flowers) ===
      for (let i = 0; i < 60; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = 42 + Math.random() * 80;
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

      // === FIREFLIES (5 clusters) ===
      // Center area fireflies (around the desk area)
      const centerFireflies = this.createFireflyCluster(deskX, deskZ, 20);
      objects.push(centerFireflies);

      // Add more firefly clusters throughout the forest
      const fireflyClusterPositions = [
        { x: 50, z: 30 },
        { x: -60, z: 40 },
        { x: 70, z: -50 },
        { x: -40, z: -70 },
      ];

      for (const pos of fireflyClusterPositions) {
        const clusterFireflies = this.createFireflyCluster(pos.x, pos.z, 15 + Math.random() * 10);
        objects.push(clusterFireflies);
      }

      // === MIDDLE ROCKS (12) ===
      for (let i = 0; i < 12; i++) {
        let x, z, attempts = 0;
        do {
          const angle = Math.random() * Math.PI * 2;
          const distance = 18 + Math.random() * 25;
          x = Math.cos(angle) * distance;
          z = Math.sin(angle) * distance;
          attempts++;
        } while ((isInExclusionZone(x, z) || this.isNearPortal(x, z)) && attempts < 20);

        if (attempts >= 20) continue;

        const rock = this.createRock(0.3 + Math.random() * 0.5);
        rock.position.set(x, Terrain.getTerrainHeight(x, z) + 0.15, z);
        objects.push(rock);
      }

      // === CENTER FLOWERS (scattered around spawn) ===
      for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 2 + Math.random() * 6;
        const x = Math.cos(angle) * dist;
        const z = Math.sin(angle) * dist;

        if (isInExclusionZone(x, z)) continue;

        const flower = this.createFlower();
        flower.position.set(x, Terrain.getTerrainHeight(x, z), z);
        flower.scale.setScalar(0.6 + Math.random() * 0.4);
        objects.push(flower);
      }

      // === CENTER GRASS (scattered around spawn) ===
      for (let i = 0; i < 15; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 2 + Math.random() * 6;
        const x = Math.cos(angle) * dist;
        const z = Math.sin(angle) * dist;

        if (isInExclusionZone(x, z)) continue;

        const grass = this.createTallGrass();
        grass.position.set(x, Terrain.getTerrainHeight(x, z), z);
        grass.scale.setScalar(0.7 + Math.random() * 0.3);
        objects.push(grass);
      }

      // === MIDDLE TALL GRASS (35) ===
      for (let i = 0; i < 35; i++) {
        let x, z, attempts = 0;
        do {
          const angle = Math.random() * Math.PI * 2;
          const distance = 8 + Math.random() * 20;
          x = Math.cos(angle) * distance;
          z = Math.sin(angle) * distance;
          attempts++;
        } while ((isInExclusionZone(x, z) || this.isNearPortal(x, z)) && attempts < 20);

        if (attempts >= 20) continue;

        const grass = this.createTallGrass();
        grass.position.set(x, Terrain.getTerrainHeight(x, z), z);
        objects.push(grass);
      }

      // === MIDDLE FERNS (20) ===
      for (let i = 0; i < 20; i++) {
        let x, z, attempts = 0;
        do {
          const angle = Math.random() * Math.PI * 2;
          const dist = 8 + Math.random() * 18;
          x = Math.cos(angle) * dist;
          z = Math.sin(angle) * dist;
          attempts++;
        } while ((isInExclusionZone(x, z) || this.isNearPortal(x, z)) && attempts < 20);

        if (attempts >= 20) continue;

        const fern = this.createFern();
        fern.position.set(x, Terrain.getTerrainHeight(x, z), z);
        fern.rotation.y = Math.random() * Math.PI * 2;
        fern.scale.setScalar(0.8 + Math.random() * 0.4);
        objects.push(fern);
      }

      // === SMALL FLOWER PATCHES (15, ~45 flowers) ===
      for (let i = 0; i < 15; i++) {
        let x, z, attempts = 0;
        do {
          const angle = Math.random() * Math.PI * 2;
          const dist = 6 + Math.random() * 16;
          x = Math.cos(angle) * dist;
          z = Math.sin(angle) * dist;
          attempts++;
        } while ((isInExclusionZone(x, z) || this.isNearPortal(x, z)) && attempts < 20);

        if (attempts >= 20) continue;

        for (let j = 0; j < 3; j++) {
          const flower = this.createFlower();
          const fx = x + (Math.random() - 0.5) * 1;
          const fz = z + (Math.random() - 0.5) * 1;
          flower.position.set(fx, Terrain.getTerrainHeight(fx, fz), fz);
          flower.scale.setScalar(0.5 + Math.random() * 0.4);
          objects.push(flower);
        }
      }

      // === MIDDLE BUSHES (10) ===
      for (let i = 0; i < 10; i++) {
        let x, z, attempts = 0;
        do {
          const angle = Math.random() * Math.PI * 2;
          const dist = 8 + Math.random() * 18;
          x = Math.cos(angle) * dist;
          z = Math.sin(angle) * dist;
          attempts++;
        } while ((isInExclusionZone(x, z) || this.isNearPortal(x, z)) && attempts < 20);

        if (attempts >= 20) continue;

        const bush = this.createBush();
        bush.position.set(x, Terrain.getTerrainHeight(x, z), z);
        objects.push(bush);
      }

      // === SEAT LOGS (2) ===
      const seatLogPositions = [
        { x: -3, z: -11, rot: 0.3 },
        { x: 3, z: -11.5, rot: -0.2 },
      ];
      for (const pos of seatLogPositions) {
        const log = this.createLog();
        const radius = log.userData.radius || 0.4;
        log.position.set(pos.x, Terrain.getTerrainHeight(pos.x, pos.z) + radius, pos.z);
        log.rotation.y = pos.rot;
        objects.push(log);
      }

      // === LANTERNS (5) - simplified, no PointLights ===
      const getObjectClearanceRadius = (obj: THREE.Object3D): number => {
        if (typeof obj.userData?.clearanceRadius === 'number') {
          return obj.userData.clearanceRadius as number;
        }
        if (obj instanceof THREE.Points || obj.userData?.isFireflies) {
          return 0;
        }
        const box = new THREE.Box3().setFromObject(obj);
        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        const radius = Math.max(0.5, maxDim * 0.5);
        obj.userData.clearanceRadius = radius;
        return radius;
      };

      const isTooCloseToExistingObject = (x: number, z: number, minClearance = 0.8): boolean => {
        for (const obj of objects) {
          if (obj instanceof THREE.Points || obj.userData?.isFireflies) continue;
          const dx = x - obj.position.x;
          const dz = z - obj.position.z;
          const radius = getObjectClearanceRadius(obj) + minClearance;
          if (dx * dx + dz * dz < radius * radius) return true;
        }
        return false;
      };

      const lanternPositions = [
        { x: -6, z: 6 },
        { x: 6, z: 6 },
        { x: -6, z: -4 },
        { x: 6, z: -4 },
        { x: cabinX + 5, z: cabinZ - 3 },
      ];
      for (const pos of lanternPositions) {
        const x = pos.x;
        const z = pos.z;

        if (isInExclusionZone(x, z)) continue;

        const lantern = this.createLantern();
        lantern.position.set(x, Terrain.getTerrainHeight(x, z), z);
        objects.push(lantern);
        exclusionZones.push({ x, z, r: 2 });
      }

      // === BIRD HOUSES & PORTAL FOLIAGE ===
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
      for (let i = 0; i < 40; i++) {
        const angle = Math.random() * Math.PI * 2;

        // Skip if too close to a portal path
        if (isNearPortalAngle(angle)) continue;

        const distance = 15 + Math.random() * 23; // distance 15-38
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;

        if (isNearDesk(x, z)) continue;

        const terrainY = Terrain.getTerrainHeight(x, z);

        // Mix of foliage
        const choice = Math.random();
        if (choice < 0.2) {
          const bush = this.createBush();
          bush.position.set(x, terrainY, z);
          objects.push(bush);
        } else if (choice < 0.45) {
          const fern = this.createFern();
          fern.position.set(x, terrainY, z);
          fern.rotation.y = Math.random() * Math.PI * 2;
          objects.push(fern);
        } else if (choice < 0.7) {
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
      for (let i = 0; i < 25; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = 40 + Math.random() * 15; // distance 40-55
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;

        const terrainY = Terrain.getTerrainHeight(x, z);

        const choice = Math.random();
        if (choice < 0.3) {
          const bush = this.createBush();
          bush.position.set(x, terrainY, z);
          objects.push(bush);
        } else if (choice < 0.6) {
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
      for (let i = 0; i < 15; i++) {
        const angle = Math.random() * Math.PI * 2;

        if (isNearPortalAngle(angle)) continue;

        const distance = 8 + Math.random() * 6;
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;

        if (isNearCampfire(x, z) || isNearDesk(x, z)) continue;

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
      // === ROCKS (25) ===
      for (let i = 0; i < 25; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = 25 + Math.random() * 80;
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;

        if (this.isNearPortal(x, z)) continue;

        const scale = 0.5 + Math.random() * 1.5;
        const rock = this.createRock(scale);
        const terrainY = Terrain.getTerrainHeight(x, z);
        rock.position.set(x, terrainY + scale * 0.3, z);
        objects.push(rock);
      }

      // === BUSHES (25) ===
      for (let i = 0; i < 25; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = 20 + Math.random() * 80;
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;

        if (this.isNearPortal(x, z)) continue;

        const bush = this.createBush();
        const terrainY = Terrain.getTerrainHeight(x, z);
        bush.position.set(x, terrainY, z);
        objects.push(bush);
      }

      // === FERNS (35) ===
      for (let i = 0; i < 35; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = 25 + Math.random() * 80;
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

      // === TALL GRASS (50 patches) ===
      for (let i = 0; i < 50; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = 18 + Math.random() * 80;
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;

        if (this.isNearPortal(x, z)) continue;

        const grass = this.createTallGrass();
        const terrainY = Terrain.getTerrainHeight(x, z);
        grass.position.set(x, terrainY, z);
        grass.rotation.y = Math.random() * Math.PI * 2;
        objects.push(grass);
      }

      // === MUSHROOM CLUSTERS (15, ~45 mushrooms) ===
      for (let i = 0; i < 15; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = 30 + Math.random() * 70;
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

      // === FLOWER PATCHES (25 patches, ~175 flowers) ===
      for (let i = 0; i < 25; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = 25 + Math.random() * 80;
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

      // === FALLEN LOGS (10) ===
      for (let i = 0; i < 10; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = 40 + Math.random() * 80;
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
      const distance = 30 + Math.random() * 70;
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
