/**
 * 3D Network Globe Component
 * Quantum Telecom Simulator
 */

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const Globe3D = ({ status }) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const animationIdRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 6);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true 
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.5;
    controls.minDistance = 3;
    controls.maxDistance = 10;
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0x3B82F6, 0.5);
    pointLight.position.set(-5, -5, 5);
    scene.add(pointLight);

    // Create Globe
    const globeGeometry = new THREE.SphereGeometry(1.8, 64, 64);
    const globeMaterial = new THREE.MeshPhongMaterial({
      color: 0x1a1a2e,
      emissive: 0x1a1a2e,
      wireframe: true,
      transparent: true,
      opacity: 0.3,
    });
    const globe = new THREE.Mesh(globeGeometry, globeMaterial);
    scene.add(globe);

    // Inner glow
    const innerGlowGeo = new THREE.SphereGeometry(1.6, 32, 32);
    const innerGlowMat = new THREE.MeshBasicMaterial({
      color: 0x3B82F6,
      transparent: true,
      opacity: 0.05,
    });
    const innerGlow = new THREE.Mesh(innerGlowGeo, innerGlowMat);
    scene.add(innerGlow);

    // Node positions on globe
    const nodePositions = [
      { lat: 20, lng: -20, label: 'Alice', color: 0x3B82F6 },
      { lat: -20, lng: 160, label: 'Bob', color: 0x10B981 },
      { lat: 0, lng: 80, label: 'Eve', color: 0xEF4444 },
      { lat: 40, lng: -100, label: 'Node A', color: 0x8B5CF6 },
      { lat: -40, lng: 20, label: 'Node B', color: 0x06B6D4 },
      { lat: 10, lng: -150, label: 'Node C', color: 0xEC4899 },
      { lat: -10, lng: 50, label: 'Node D', color: 0xF59E0B },
    ];

    // Convert lat/lng to 3D position
    const latLngToPosition = (lat, lng, radius) => {
      const phi = (90 - lat) * Math.PI / 180;
      const theta = (lng + 180) * Math.PI / 180;
      return new THREE.Vector3(
        -radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
      );
    };

    // Create nodes
    const nodeGroup = new THREE.Group();
    const connections = [];

    nodePositions.forEach((pos, index) => {
      const position = latLngToPosition(pos.lat, pos.lng, 2.0);
      
      // Node sphere
      const sphereGeo = new THREE.SphereGeometry(0.15, 16, 16);
      const sphereMat = new THREE.MeshPhongMaterial({
        color: pos.color,
        emissive: pos.color,
        emissiveIntensity: 0.3,
        shininess: 100,
      });
      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      sphere.position.copy(position);
      nodeGroup.add(sphere);

      // Glow ring
      const ringGeo = new THREE.RingGeometry(0.18, 0.25, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: pos.color,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.copy(position);
      ring.lookAt(0, 0, 0);
      nodeGroup.add(ring);

      // Store for connections
      connections.push({ position, color: pos.color, index });
    });

    scene.add(nodeGroup);

    // Create connection lines
    const connectionGroup = new THREE.Group();
    for (let i = 0; i < connections.length; i++) {
      for (let j = i + 1; j < connections.length; j++) {
        const points = [
          connections[i].position,
          connections[j].position
        ];
        const geo = new THREE.BufferGeometry().setFromPoints(points);
        const mat = new THREE.LineBasicMaterial({
          color: 0x3B82F6,
          transparent: true,
          opacity: 0.15,
        });
        const line = new THREE.Line(geo, mat);
        connectionGroup.add(line);
      }
    }
    scene.add(connectionGroup);

    // Create orbiting particles
    const particleCount = 200;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    const particleSpeeds = [];
    const particleRadii = [];

    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 2.2 + Math.random() * 0.5;
      particlePos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      particlePos[i * 3 + 1] = radius * Math.cos(phi);
      particlePos[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
      particleSpeeds.push({
        theta: (Math.random() - 0.5) * 0.005,
        phi: (Math.random() - 0.5) * 0.003,
      });
      particleRadii.push(radius);
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x3B82F6,
      size: 0.02,
      transparent: true,
      opacity: 0.6,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);
    particlesRef.current = { particles, particleSpeeds, particleRadii, particleGeo };

    // Animation loop
    let time = 0;
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      time += 0.01;

      // Update controls
      controls.update();

      // Animate particles
      const positions = particles.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        const theta = Math.atan2(positions[i * 2], positions[i * 3]);
        const phi = Math.acos(positions[i * 1] / particleRadii[i]);
        const newTheta = theta + particleSpeeds[i].theta;
        const newPhi = phi + particleSpeeds[i].phi;
        const radius = particleRadii[i];
        positions[i * 3] = radius * Math.sin(newPhi) * Math.cos(newTheta);
        positions[i * 3 + 1] = radius * Math.cos(newPhi);
        positions[i * 3 + 2] = radius * Math.sin(newPhi) * Math.sin(newTheta);
      }
      particles.geometry.attributes.position.needsUpdate = true;

      // Pulse nodes
      nodeGroup.children.forEach((child, index) => {
        if (child.type === 'Mesh' && child.geometry.type === 'SphereGeometry') {
          const scale = 1 + Math.sin(time * 2 + index) * 0.05;
          child.scale.set(scale, scale, scale);
        }
      });

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

  return <div ref={containerRef} className="w-full h-64 rounded-xl overflow-hidden" />;
};

export default Globe3D;