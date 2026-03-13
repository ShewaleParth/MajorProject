import * as THREE from "three";
import { useEffect, useRef } from "react";

export function useThreeOrb(containerRef) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const W = container.offsetWidth;
    const H = container.offsetHeight;

    const scene    = new THREE.Scene();
    const camera   = new THREE.PerspectiveCamera(55, W / H, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true, alpha: true
    });
    camera.position.set(0, 0, 50);
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 0); // transparent bg

    // Point lights — orange, amber, cyan
    const lights = [
      [0xff6b1a, 5, 80, [12, 10, 20]],
      [0xff9d52, 3, 60, [-14, -8, 14]],
      [0x00e5ff, 1.5, 50, [0, 18, -12]],
    ];
    lights.forEach(([col, int, dist, pos]) => {
      const l = new THREE.PointLight(col, int, dist);
      l.position.set(...pos);
      scene.add(l);
    });

    // Icosahedron wireframe (the "orb")
    const ico = new THREE.Mesh(
      new THREE.IcosahedronGeometry(11, 2),
      new THREE.MeshPhongMaterial({
        color: 0xff6b1a, wireframe: true,
        transparent: true, opacity: 0.12,
      })
    );
    scene.add(ico);

    // Inner glowing core
    const core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(6, 1),
      new THREE.MeshPhongMaterial({
        color: 0xff4400, emissive: 0x280600,
        emissiveIntensity: 1.5, transparent: true, opacity: 0.2
      })
    );
    scene.add(core);

    // Orbiting nodes (Fibonacci sphere distribution)
    const nodes = [];
    for (let i = 0; i < 65; i++) {
      const phi   = Math.acos(1 - 2 * (i + 0.5) / 65);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const r = 15 + Math.random() * 9;
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.2 + Math.random() * 0.25, 8, 8),
        new THREE.MeshPhongMaterial({ color: 0xff9d52, emissive: 0xff6b1a, emissiveIntensity: 0.7 })
      );
      mesh.position.set(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      );
      mesh.userData = { phase: Math.random() * Math.PI * 2, speed: 0.4 + Math.random() * 0.4 };
      scene.add(mesh);
      nodes.push(mesh);
    }

    // Animation loop
    let t = 0, frameId;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      t += 0.006;
      scene.rotation.y = t * 0.065;
      ico.rotation.x   = t * 0.1;
      core.scale.setScalar(1 + Math.sin(t * 1.2) * 0.09);
      nodes.forEach(n => {
        const s = 1 + Math.sin(t * n.userData.speed + n.userData.phase) * 0.22;
        n.scale.setScalar(s);
      });
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      renderer.dispose();
    };
  }, []);

  return canvasRef;
}
