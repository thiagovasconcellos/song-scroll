import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import { GlobalWorkerOptions } from 'pdfjs-dist';
import { zoomPlugin } from '@react-pdf-viewer/zoom';

GlobalWorkerOptions.workerSrc = './pdf.worker.min.js';

const ViewerWithRef = forwardRef((props, ref) => {
  const viewerRef = useRef();

  useImperativeHandle(ref, () => ({
    scrollViewerBy: (x, y) => {
      if (viewerRef.current) {
        const viewerContainer = viewerRef.current.querySelector('.rpv-core__inner-pages');
        if (viewerContainer) {
          viewerContainer.scrollBy(x, y);
        }
      }
    },
  }));

  return (
    <div ref={viewerRef} style={{ height: '100%' }}>
      <Viewer {...props} />
    </div>
  );
});

function App() {
  const [file, setFile] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(20);
  const viewerRef = useRef(null);
  const zoomPluginInstance = zoomPlugin();
  const { ZoomInButton, ZoomOutButton, ZoomPopover } = zoomPluginInstance;

  useEffect(() => {
    let intervalId;

    if (isActive && viewerRef.current) {
      intervalId = setInterval(() => {
        viewerRef.current.scrollViewerBy(0, 1);
      }, scrollSpeed);
    }

    return () => clearInterval(intervalId);
  }, [isActive, scrollSpeed]);

  const onFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFile(URL.createObjectURL(file));
    }
  };

  const toggleScroll = () => setIsActive(!isActive);

  const handleScrollSpeedChange = (e) => {
    setScrollSpeed(Number(e.target.value));
  };

  return (
    <div className="App flex flex-col h-screen bg-gray-100">
      <div className="flex justify-center items-center p-4 bg-white shadow-md">
        <input
          type="file"
          onChange={onFileChange}
          accept="application/pdf"
          className="mr-4 p-2 border border-gray-300 rounded-lg"
        />
        <input
          type="number"
          value={scrollSpeed}
          onChange={handleScrollSpeedChange}
          placeholder="Scroll Speed (ms)"
          className="mr-4 p-2 border border-gray-300 rounded-lg"
        />
        <button
          onClick={toggleScroll}
          className={`p-2 rounded-lg text-white ${isActive ? 'bg-red-500' : 'bg-blue-500'}`}
        >
          {isActive ? 'Stop Scrolling' : 'Start Scrolling'}
        </button>
        <ZoomOutButton className="ml-4 p-2 bg-gray-200 rounded-lg" />
        <ZoomInButton className="ml-2 p-2 bg-gray-200 rounded-lg" />
        <ZoomPopover className="ml-2" />
      </div>
      {file && (
        <div className="flex-grow overflow-auto">
          <Worker workerUrl={GlobalWorkerOptions.workerSrc}>
            <ViewerWithRef fileUrl={file} ref={viewerRef} plugins={[zoomPluginInstance]} />
          </Worker>
        </div>
      )}
    </div>
  );
}

export default App;