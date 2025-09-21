import React, { useCallback } from 'react';
import { CompressionResult } from '../types';
import { CheckCircleIcon, DownloadIcon } from './icons';

interface ResultViewProps {
  result: CompressionResult;
  onStartOver: () => void;
}

const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

const ResultView: React.FC<ResultViewProps> = ({ result, onStartOver }) => {
  const savings = result.originalSize > 0 ? (1 - result.compressedSize / result.originalSize) * 100 : 0;

  const handleDownload = useCallback(() => {
    if (result.downloadUrl) {
      // Use server-provided download URL
      const a = document.createElement('a');
      a.href = result.downloadUrl;
      a.download = `compressed_${result.fileName}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      // Fallback to create a dummy file for download to complete the user flow (legacy behavior)
      console.warn('No download URL provided, creating placeholder');
      const blob = new Blob(
          [`This is a placeholder for the compressed video file: ${result.fileName}`],
          { type: 'video/mp4' }
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `compressed_${result.fileName}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }, [result]);

  return (
    <div className="result-view">
      <CheckCircleIcon className="icon-large success-icon" />
      <h2>Compression Complete!</h2>
      
      <div className="result-stats">
        <div className="stat-item">
          <h3>Original Size</h3>
          <p>{formatBytes(result.originalSize)}</p>
        </div>
        <div className="stat-item">
          <h3>New Size</h3>
          <p>{formatBytes(result.compressedSize)}</p>
        </div>
        <div className="stat-item savings">
          <h3>You Saved</h3>
          <p>{savings.toFixed(2)}%</p>
        </div>
         <div className="stat-item">
          <h3>File Name</h3>
          <p style={{fontSize: '1.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{result.fileName}</p>
        </div>
      </div>
      
      <div className="action-buttons">
        <button className="button-secondary" onClick={onStartOver}>Compress Another</button>
        <button className="button-primary" onClick={handleDownload} style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
          <DownloadIcon />
          Download Now
        </button>
      </div>
    </div>
  );
};

export default ResultView;
