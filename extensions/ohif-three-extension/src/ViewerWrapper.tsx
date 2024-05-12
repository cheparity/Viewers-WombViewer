import React, { useState } from 'react';
import ThreeViewer from './ThreeViewer';

function ViewerWrapper() {
  const [plyFileUrl, setPlyFileUrl] = useState(null);

  function handleFileChange(event) {
    const file = event.target.files[0];
    const fileUrl = URL.createObjectURL(file);
    console.log('file selected', file, fileUrl);
    setPlyFileUrl(fileUrl);
  }

  function handleOpenExplorer() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.ply';
    input.onchange = handleFileChange;
    input.click();
  }

  return (
    <>
      {!plyFileUrl && (
        <button onClick={handleOpenExplorer} style={{ marginBottom: '20px' }}>
          打开PLY文件
        </button>
      )}
      {plyFileUrl && <ThreeViewer fileURL={plyFileUrl} />}
    </>
  );
}

export default ViewerWrapper;
