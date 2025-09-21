import React, { useCallback, useState } from 'react';
import { UploadIcon } from './icons';

interface FileDropzoneProps {
  onFileSelect: (file: File) => void;
}

const FileDropzone: React.FC<FileDropzoneProps> = ({ onFileSelect }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileAction = (files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('video/')) {
        onFileSelect(file);
      } else {
        alert('Please select a video file.');
      }
    }
  };

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    handleFileAction(event.dataTransfer.files);
  }, [onFileSelect]);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    handleFileAction(event.target.files);
  }, [onFileSelect]);

  const dropzoneClass = isDragOver
    ? 'file-dropzone drag-over'
    : 'file-dropzone';

  return (
    <div
      className={dropzoneClass}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => document.getElementById('file-input')?.click()}
    >
      <input
        type="file"
        id="file-input"
        accept="video/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <div className="dropzone-content">
        <UploadIcon className="icon-large" />
        <p>Drag & drop a video here, or click to select a file</p>
        <p className="small-text">Supports all major video formats, up to 10 GB.</p>
      </div>
    </div>
  );
};

export default FileDropzone;
