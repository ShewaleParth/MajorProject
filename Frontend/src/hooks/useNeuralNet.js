import * as THREE from "three";
import { useEffect, useRef } from "react";

export function useNeuralNet(containerRef) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const NODE_COUNT = 90;
    const MAX_DIST   = 10;
    const W = container.offsetWidth;
    const H = container.offsetHeight;

    const scene    = new THREE.Scene();
    const camera   = new THREE.PerspectiveCamera(55, W / H, 0.1, 1000);
    camera.position.set(0, 0, 38);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current, antialias: true, alpha: true
    });
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 0);

    // Four node types with distinct visual identities
    const NODE_TYPES = [
      { color: 0x00d4ff, emissive: 0x003355, size: 0.35 }, // Cyan — regular
      { color: 0x7928ca, emissive: 0x1a0033, size: 0.50 }, // Purple — hub (largest)
      { color: 0xff3e78, emissive: 0x330015, size: 0.28 }, // Pink — leaf
      { color: 0x00dc82, emissive: 0x003322, size: 0.40 }, // Green — data
    ];

    // Fibonacci sphere distribution for even node spacing
    const nodes = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      const phi   = Math.acos(1 - 2 * (i + 0.5) / NODE_COUNT);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const r     = 18 + (Math.random() - 0.5) * 10;
      const type  = NODE_TYPES[Math.floor(Math.random() * NODE_TYPES.length)];

      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(type.size, 12, 12),
        new THREE.MeshPhongMaterial({
          color: type.color,
          emissive: type.emissive,
          emissiveIntensity: 0.8,
          transparent: true,
          opacity: 0.85,
        })
      );
      mesh.position.set(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      );
      mesh.userData = {
        phase: Math.random() * Math.PI * 2,
        speed: 0.3 + Math.random() * 0.4,
      };
      scene.add(mesh);
      nodes.push(mesh);
    }
    
    // Dynamic edge group — rebuilt every 10 frames
    const edgeGroup = new THREE.Group();
    scene.add(edgeGroup);

    function buildEdges() {
      while (edgeGroup.children.length) edgeGroup.remove(edgeGroup.children[0]);
      for (let i = 0; i < NODE_COUNT; i++) {
        for (let j = i + 1; j < NODE_COUNT; j++) {
          const d = nodes[i].position.distanceTo(nodes[j].position);
          if (d < MAX_DIST) {
            const alpha = Math.pow(1 - d / MAX_DIST, 2) * 0.6;
            const geo   = new THREE.BufferGeometry()
                            .setFromPoints([nodes[i].position, nodes[j].position]);
            const mat   = new THREE.LineBasicMaterial({
              color: 0x00d4ff,
              transparent: true,
              opacity: alpha,
              blending: THREE.AdditiveBlending,
            });
            edgeGroup.add(new THREE.Line(geo, mat));
          }
        }
      }
    }
    buildEdges();

    // Spawn a pulse particle every 400ms
    const pulses = [];
    function spawnPulse() {
      const fromIdx = Math.floor(Math.random() * NODE_COUNT);
      const from    = nodes[fromIdx].position.clone();
      let   toIdx   = -1, minD = Infinity;
      for (let j = 0; j < NODE_COUNT; j++) {
        if (j === fromIdx) continue;
        const d = from.distanceTo(nodes[j].position);
        if (d < MAX_DIST && d < minD) { minD = d; toIdx = j; }
      }
      if (toIdx < 0) return;
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 6, 6),
        new THREE.MeshBasicMaterial({
          color: 0x00ffff, transparent: true,
          blending: THREE.AdditiveBlending
        })
      );
      mesh.position.copy(from);
      scene.add(mesh);
      pulses.push({ mesh, from, to: nodes[toIdx].position.clone(), progress: 0 });
    }
    const pulseInterval = setInterval(spawnPulse, 400);

    const lights = [
      new THREE.PointLight(0x00d4ff, 2, 50),
      new THREE.PointLight(0x7928ca, 2, 50),
      new THREE.PointLight(0xff3e78, 2, 50),
    ];
    lights[0].position.set(20, 0, 10);
    lights[1].position.set(-20, 20, 10);
    lights[2].position.set(0, -20, 10);
    lights.forEach(l => scene.add(l));

    // Animation loop
    let t = 0, frameCount = 0, frameId;
    function animate() {
      frameId = requestAnimationFrame(animate);
      t += 0.006; frameCount++;

      scene.rotation.y = t * 0.08;
      scene.rotation.x = Math.sin(t * 0.05) * 0.12;

      nodes.forEach(n => {
        const s = 1 + Math.sin(t * n.userData.speed + n.userData.phase) * 0.2;
        n.scale.setScalar(s);
        n.material.emissiveIntensity = 0.5 + Math.sin(t * n.userData.speed + n.userData.phase) * 0.5;
      });

      if (frameCount % 10 === 0) buildEdges(); // periodic edge rebuild

      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.progress += 0.015;
        if (p.progress >= 1) { scene.remove(p.mesh); pulses.splice(i, 1); }
        else {
          p.mesh.position.lerpVectors(p.from, p.to, p.progress);
          // @ts-ignore
          p.mesh.material.opacity = Math.sin(p.progress * Math.PI); // fade in/out
        }
      }

      renderer.render(scene, camera);
    }
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      clearInterval(pulseInterval);
      renderer.dispose();
    };
  }, []);

  return canvasRef;
}
