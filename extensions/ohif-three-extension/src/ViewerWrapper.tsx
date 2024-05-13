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
