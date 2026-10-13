/**
 * 3D Network Visualization - Three.js
 * Quantum Telecom Simulator
 */

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const Network3D = ({ status }) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const animationIdRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Setup scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Setup camera
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 5;

    // Setup renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true 
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    const pointLight2 = new THREE.PointLight(0x3B82F6, 0.5);
    pointLight2.position.set(-10, -10, 10);
    scene.add(pointLight2);

    // Create Alice Node
    const aliceGeometry = new THREE.SphereGeometry(0.6, 32, 32);
    const aliceMaterial = new THREE.MeshPhongMaterial({
      color: 0x3B82F6,
      emissive: 0x1D4ED8,
      emissiveIntensity: 0.3,
      shininess: 100,
    });
    const alice = new THREE.Mesh(aliceGeometry, aliceMaterial);
    alice.position.set(-2, 0, 0);
    scene.add(alice);

    // Alice glow
    const aliceGlowGeometry = new THREE.SphereGeometry(0.8, 32, 32);
    const aliceGlowMaterial = new THREE.MeshBasicMaterial({
      color: 0x3B82F6,
      transparent: true,
      opacity: 0.2,
    });
    const aliceGlow = new THREE.Mesh(aliceGlowGeometry, aliceGlowMaterial);
    aliceGlow.position.copy(alice.position);
    scene.add(aliceGlow);

    // Create Bob Node
    const bobGeometry = new THREE.SphereGeometry(0.6, 32, 32);
    const bobMaterial = new THREE.MeshPhongMaterial({
      color: 0x10B981,
      emissive: 0x065F46,
      emissiveIntensity: 0.3,
      shininess: 100,
    });
    const bob = new THREE.Mesh(bobGeometry, bobMaterial);
    bob.position.set(2, 0, 0);
    scene.add(bob);

    // Bob glow
    const bobGlowGeometry = new THREE.SphereGeometry(0.8, 32, 32);
    const bobGlowMaterial = new THREE.MeshBasicMaterial({
      color: 0x10B981,
      transparent: true,
      opacity: 0.2,
    });
    const bobGlow = new THREE.Mesh(bobGlowGeometry, bobGlowMaterial);
    bobGlow.position.copy(bob.position);
    scene.add(bobGlow);

    // Create Eve Node (hidden initially)
    const eveGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const eveMaterial = new THREE.MeshPhongMaterial({
      color: 0xEF4444,
      emissive: 0x7F1D1D,
      emissiveIntensity: 0.3,
      shininess: 100,
      transparent: true,
      opacity: 0,
    });
    const eve = new THREE.Mesh(eveGeometry, eveMaterial);
    eve.position.set(0, -0.8, 0);
    scene.add(eve);

    // Eve glow
    const eveGlowGeometry = new THREE.SphereGeometry(0.7, 32, 32);
    const eveGlowMaterial = new THREE.MeshBasicMaterial({
      color: 0xEF4444,
      transparent: true,
      opacity: 0,
    });
    const eveGlow = new THREE.Mesh(eveGlowGeometry, eveGlowMaterial);
    eveGlow.position.copy(eve.position);
    scene.add(eveGlow);

    // Create connection line
    const linePoints = [
      new THREE.Vector3(-2, 0, 0),
      new THREE.Vector3(2, 0, 0),
    ];
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(linePoints);
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x3B82F6,
      transparent: true,
      opacity: 0.5,
    });
    const line = new THREE.Line(lineGeometry, lineMaterial);
    scene.add(line);

    // Create particles along the line
    const particleCount = 20;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const t = i / particleCount;
      particlePositions[i * 3] = -2 + t * 4;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 0.1;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
    }
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x3B82F6,
      size: 0.05,
      transparent: true,
      opacity: 0.6,
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Labels - using sprites for text would be complex, we'll use simple spheres
    // Alice label sphere
    const labelGeom = new THREE.SphereGeometry(0.08, 8, 8);
    const labelMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
    const labelAlice = new THREE.Mesh(labelGeom, labelMat);
    labelAlice.position.set(-2, -1, 0);
    scene.add(labelAlice);

    const labelBob = new THREE.Mesh(labelGeom, labelMat);
    labelBob.position.set(2, -1, 0);
    scene.add(labelBob);

    // Animation loop
    let time = 0;
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      time += 0.01;

      // Rotate glow
      aliceGlow.scale.setScalar(1 + Math.sin(time * 2) * 0.1);
      bobGlow.scale.setScalar(1 + Math.sin(time * 2 + 1) * 0.1);

      // Move particles along the line
      const positions = particles.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        const t = (i / particleCount + time * 0.1) % 1;
        positions[i * 3] = -2 + t * 4;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 0.05;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 0.05;
      }
      particles.geometry.attributes.position.needsUpdate = true;

      // Update Eve visibility based on status
      const isCompromised = status?.quantum_channel?.compromised || false;
      eve.material.opacity = isCompromised ? 1 : 0;
      eveGlow.material.opacity = isCompromised ? 0.3 : 0;

      // Update connection color based on security
      const isSecure = status?.quantum_channel?.status === 'secure';
      line.material.color.setHex(isSecure ? 0x10B981 : (isCompromised ? 0xEF4444 : 0x3B82F6));

      // Update node glow colors
      alice.material.emissiveIntensity = isSecure ? 0.5 : 0.3;
      bob.material.emissiveIntensity = isSecure ? 0.5 : 0.3;

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      window.removeEventListener('resize', handleResize);
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    };
  }, [status]);

  return <div ref={containerRef} className="w-full h-48 rounded-lg overflow-hidden bg-gray-900/5 dark:bg-dark-bg/50" />;
};

export default Network3D;