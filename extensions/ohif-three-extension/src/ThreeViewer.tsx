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

// eslint-disable-next-line react/prop-types
function ThreeViewport({ fileURL }) {
  const viewportRef = useRef(null);
  useEffect(() => {
    viewportRef.current.innerHTML = '';
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 10);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(
      window.innerWidth * window.devicePixelRatio,
      window.innerHeight * window.devicePixelRatio
    );
    renderer.shadowMap.enabled = true; // 显示阴影
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x000000, 1); // 设置背景颜色

    viewportRef.current.appendChild(renderer.domElement);

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
        const boundingBox = new THREE.Box3().setFromObject(mesh);
        const size = boundingBox.getSize(new THREE.Vector3());
        const center = boundingBox.getCenter(new THREE.Vector3());

        // 设置相机的位置和焦点
        // 计算相机距离物体的距离
        const distance = Math.max(size.x, size.y, size.z) * 2; // 取物体尺寸的最大值，并乘以一个系数来确定距离

        // 设置相机的位置和焦点
        camera.position.set(center.x, center.y, center.z + distance); // 将相机放在物体后方
        camera.lookAt(center); // 将相机的焦点设置为物体的中心
        camera.lookAt(center); // 将相机的焦点设置为物体的中心
        scene.add(mesh);
        console.log('finished loading PLY file', mesh);
        // handleDownload();
      },
      xhr => {
        console.log((xhr.loaded / xhr.total) * 100 + '% 已加载');
      },
      error => {
        console.error('error when loading PLY file', error);
      }
    );

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.1); // 创建环境光
    scene.add(ambientLight); // 将环境光添加到场景

    const spotLight = new THREE.SpotLight(0xffffff); // 创建聚光灯
    spotLight.position.set(50, 50, 50);
    spotLight.castShadow = true;
    scene.add(spotLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // smooth camera movement

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update(); // to update mouse control
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      controls.dispose();
      renderer.dispose();
    };
  }, [viewportRef, fileURL]);

  // test whether correctly reading the file or not
  // const handleDownload = () => {
  //   const link = document.createElement('a');
  //   link.href = URL.createObjectURL(plyFile);
  //   link.download = plyFile.name;
  //   link.click();
  // };

  return <div ref={viewportRef}></div>;
}

export default ThreeViewport;
