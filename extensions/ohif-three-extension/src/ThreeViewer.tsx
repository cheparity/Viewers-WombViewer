import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

function generateSprite() {
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 16;

  const context = canvas.getContext('2d');
  const gradient = context.createRadialGradient(
    canvas.width / 2,
    canvas.height / 2,
    0,
    canvas.width / 2,
    canvas.height / 2,
    canvas.width / 2
  );
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.2, 'rgba(0,255,255,1)');
  gradient.addColorStop(0.4, 'rgba(0,0,64,1)');
  gradient.addColorStop(1, 'rgba(0,0,0,1)');

  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function ThreeViewer({ fileURLs }) {
  const viewportRef = useRef(null);

  useEffect(() => {
    viewportRef.current.innerHTML = '';
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      2000
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(
      window.innerWidth * window.devicePixelRatio,
      window.innerHeight * window.devicePixelRatio
    );
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x000000, 1);

    viewportRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
    scene.add(ambientLight);

    const spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.set(50, 50, 50);
    spotLight.castShadow = true;
    scene.add(spotLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    fileURLs.forEach(fileURL => {
      const loader = new PLYLoader();
      console.log('loading PLY file', fileURL);
      loader.load(
        fileURL,
        geometry => {
          const material = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 1,
            opacity: 0.6,
            transparent: true,
            blending: THREE.AdditiveBlending,
            map: generateSprite(),
          });
          const mesh = new THREE.Points(geometry, material);
          scene.add(mesh);

          // Compute bounding box to center camera on loaded object
          const boundingBox = new THREE.Box3().setFromObject(mesh);
          const center = boundingBox.getCenter(new THREE.Vector3());
          const size = boundingBox.getSize(new THREE.Vector3());

          const maxDim = Math.max(size.x, size.y, size.z);
          const fov = camera.fov * (Math.PI / 180);
          let distance = maxDim / (2 * Math.tan(fov / 2));
          distance *= 1.5; // Optional: adjust distance multiplier as needed

          // Set camera position and controls target
          camera.position.copy(center);
          camera.position.z += distance;
          camera.position.x += maxDim / 2; // Move the camera to the right
          controls.target.copy(center);
          controls.update();

          console.log('finished loading PLY file', mesh);
        },
        xhr => {
          console.log((xhr.loaded / xhr.total) * 100 + '% 已加载');
        },
        error => {
          console.error('error when loading PLY file', error);
        }
      );
    });

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      controls.dispose();
      renderer.dispose();
    };
  }, [viewportRef, fileURLs]);

  return <div ref={viewportRef}></div>;
}

export default ThreeViewer;
