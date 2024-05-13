import React, { useState } from 'react';
import ThreeViewer from './ThreeViewer';

function parseMLPFile(mlpContent) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(mlpContent, 'text/xml');

  const meshGroup = xmlDoc.querySelector('MeshGroup');
  const meshList = meshGroup.querySelectorAll('MLMesh');

  const models = [];
  meshList.forEach(mesh => {
    const label = mesh.getAttribute('label');
    const filename = mesh.getAttribute('filename');
    models.push({ label, filename });
  });

  return models;
}

function ViewerWrapper() {
  const [plyFileUrls, setPlyFileUrls] = useState([]);
  // const [screenshot, setScreenshot] = useState([]);

  const addScreenshot = newScreenshotUrl => {
    // setScreenshot(prevScreenshots => [...prevScreenshots, newScreenshotUrl]);

    // 创建一个虚拟的链接元素
    const link = document.createElement('a');
    link.href = newScreenshotUrl;
    link.download = 'screenshot.jpg'; // 设置下载文件的名称
    link.target = '_blank'; // 在新标签页打开链接（可选）

    // 触发点击事件下载截图
    link.click();

    console.log('screenshot added and downloaded', newScreenshotUrl);
  };
  function handleFileChange(event: React.ChangeEvent<HTMLInputElement> | Event) {
    const files: FileList = (event.target as HTMLInputElement).files;
    const fileUrls = Array.from(files).map(file => URL.createObjectURL(file));
    console.log('files selected', files, fileUrls);
    setPlyFileUrls(fileUrls);
  }

  function handleOpenExplorer() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.ply';
    input.multiple = true; // Allow multiple file selection
    input.onchange = handleFileChange;
    input.click();
  }

  return (
    <>
      {plyFileUrls.length === 0 && (
        <button onClick={handleOpenExplorer} style={{ marginBottom: '20px' }}>
          Open PLY files
        </button>
      )}
      {plyFileUrls.length > 0 && <ThreeViewer fileURLs={plyFileUrls} />}
    </>
  );
}

export default ViewerWrapper;
