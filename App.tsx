import React, { useState, useCallback, useEffect } from 'react';
import { AppState, CompressionSettings, CompressionResult } from './types';
import FileDropzone from './components/FileDropzone';
import SettingsPanel from './components/SettingsPanel';
import ProcessingView from './components/ProcessingView';
import ResultView from './components/ResultView';
import { ErrorIcon, VideoIcon } from './components/icons';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [file, setFile] = useState<File | null>(null);
  const [settings, setSettings] = useState<CompressionSettings>({ quality: 'balanced' });
  const [result, setResult] = useState<CompressionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (selectedFile: File) => {
    // Limit file size to ~10GB
    if (selectedFile.size > 10 * 1024 * 1024 * 1024) {
      setError("File is too large. Please select a video under 10 GB.");
      setAppState(AppState.ERROR);
      return;
    }
    setFile(selectedFile);
    setAppState(AppState.FILE_SELECTED);
  };
  
  const resetState = () => {
    setAppState(AppState.IDLE);
    setFile(null);
    setResult(null);
    setError(null);
  };
  
  const handleCompress = useCallback(async () => {
    if (!file) return;

    setAppState(AppState.PROCESSING);
    setError(null);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('video', file);
      formData.append('quality', settings.quality);

      // Upload and start compression
      const compressResponse = await fetch('http://localhost:3001/compress', {
        method: 'POST',
        body: formData,
      });

      if (!compressResponse.ok) {
        throw new Error('Failed to start compression');
      }

      const { jobId } = await compressResponse.json();

      // Poll for status updates
      const pollStatus = async () => {
        try {
          const statusResponse = await fetch(`http://localhost:3001/status/${jobId}`);
          if (!statusResponse.ok) {
            throw new Error('Failed to get compression status');
          }

          const jobStatus = await statusResponse.json();

          // Update processing state with progress
          const processingElement = document.querySelector('.progress-bar-inner');
          if (processingElement) {
            (processingElement as HTMLElement).style.width = `${jobStatus.progress}%`;
          }

          if (jobStatus.status === 'completed') {
            setResult({
              originalSize: jobStatus.originalSize,
              compressedSize: jobStatus.compressedSize,
              fileName: jobStatus.originalFileName,
              downloadUrl: `http://localhost:3001/download/${jobId}`,
            });
            setAppState(AppState.DONE);
          } else if (jobStatus.status === 'error') {
            setError(jobStatus.error || 'Compression failed');
            setAppState(AppState.ERROR);
          } else {
            // Continue polling for progress updates
            setTimeout(pollStatus, 2000);
          }
        } catch (error) {
          console.error('Status check failed:', error);
          setError('Failed to check compression status');
          setAppState(AppState.ERROR);
        }
      };

      // Start polling
      setTimeout(pollStatus, 2000);

    } catch (e) {
      console.error('Compression error:', e);
      const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred during compression.';
      setError(errorMessage);
      setAppState(AppState.ERROR);
    }
  }, [file, settings]);

  const renderContent = () => {
    switch (appState) {
      case AppState.IDLE:
        return <FileDropzone onFileSelect={handleFileSelect} />;
      case AppState.FILE_SELECTED:
        return file && (
          <SettingsPanel
            file={file}
            settings={settings}
            onSettingsChange={setSettings}
            onCompress={handleCompress}
            onCancel={resetState}
          />
        );
      case AppState.PROCESSING:
        return <ProcessingView />;
      case AppState.DONE:
        return result && <ResultView result={result} onStartOver={resetState} />;
      case AppState.ERROR:
        return (
          <div className="error-view">
            <ErrorIcon className="icon-large error-icon" />
            <h2>An Error Occurred</h2>
            <p>{error}</p>
            <button className="button-primary" onClick={resetState}>Try Again</button>
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <>
      <style>{`
        :root { --primary-color: #4f46e5; --secondary-color: #6b7280; --background-color: #f9fafb; --surface-color: #ffffff; --text-color: #111827; --border-color: #e5e7eb; --success-color: #10b981; --error-color: #ef4444; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: var(--background-color); color: var(--text-color); margin: 0; display: flex; justify-content: center; align-items: flex-start; min-height: 100vh; padding-top: 5vh; }
        .app { max-width: 700px; width: 100%; margin: 2rem; padding: 2rem; background-color: var(--surface-color); border-radius: 8px; box-shadow: 0 4px A6px rgba(0,0,0,0.1); }
        .app-header { display: flex; align-items: center; justify-content: center; gap: 0.75rem; margin-bottom: 1.5rem; }
        .app-header .icon-large { width: 2.5rem; height: 2.5rem; color: var(--primary-color); }
        h1 { text-align: center; color: var(--primary-color); margin: 0; }
        .file-dropzone { border: 2px dashed var(--border-color); border-radius: 8px; padding: 2.5rem; text-align: center; cursor: pointer; transition: background-color 0.2s; }
        .file-dropzone:hover, .file-dropzone.drag-over { background-color: #f0f0ff; border-color: var(--primary-color); }
        .dropzone-content .icon-large { width: 4rem; height: 4rem; margin: 0 auto 1rem; color: var(--primary-color); }
        .dropzone-content p { margin: 0.5rem 0; font-size: 1.1rem; }
        .dropzone-content .small-text { font-size: 0.9rem; color: var(--secondary-color); }
        .settings-panel { text-align: center; }
        .file-preview { background-color: var(--background-color); padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; }
        .file-preview p { color: var(--secondary-color); margin: 0.25rem 0; font-size: 0.9rem; }
        .settings-form { margin: 1.5rem 0; text-align: left; display: inline-block;}
        .settings-form > label { font-weight: bold; }
        .quality-options { display: flex; flex-direction: column; gap: 0.75rem; margin-top: 0.5rem; }
        .quality-options label { font-weight: normal; display: flex; align-items: center; gap: 0.5rem; cursor: pointer; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 6px; transition: border-color 0.2s, box-shadow 0.2s; }
        .quality-options label:has(input:checked) { border-color: var(--primary-color); box-shadow: 0 0 0 2px #c7d2fe; }
        .action-buttons { display: flex; justify-content: center; gap: 1rem; margin-top: 1.5rem; }
        .button-primary, .button-secondary { border: none; padding: 0.75rem 1.5rem; border-radius: 6px; font-size: 1rem; cursor: pointer; transition: background-color 0.2s; font-weight: bold; }
        .button-primary { background-color: var(--primary-color); color: white; }
        .button-primary:hover { background-color: #4338ca; }
        .button-secondary { background-color: var(--border-color); color: var(--text-color); }
        .button-secondary:hover { background-color: #d1d5db; }
        .processing-view { text-align: center; padding: 2rem; }
        .processing-view h2 { margin: 1.5rem 0; }
        .processing-view .spinner { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .progress-bar { width: 100%; background-color: var(--border-color); border-radius: 8px; overflow: hidden; height: 1.5rem; margin: 1rem 0; }
        .progress-bar-inner { height: 100%; width: 0; background-color: var(--primary-color); border-radius: 8px; transition: width 1s ease-out; }
        .result-view { text-align: center; }
        .result-view .success-icon { color: var(--success-color); }
        .result-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; text-align: center; margin: 2rem 0; }
        .stat-item { background-color: var(--background-color); padding: 1.5rem; border-radius: 8px; }
        .stat-item h3 { margin: 0 0 0.5rem; font-size: 1rem; color: var(--secondary-color); }
        .stat-item p { margin: 0; font-size: 1.5rem; font-weight: bold; color: var(--primary-color); }
        .stat-item.savings p { color: var(--success-color); }
        .error-view { text-align: center; }
        .error-view .error-icon { color: var(--error-color); }
        .error-view h2 { color: var(--error-color); }
        .error-view p { background-color: #fee2e2; padding: 1rem; border-radius: 8px; color: #991b1b; margin-bottom: 1.5rem; }
        .icon-large { width: 3rem; height: 3rem; margin: 0 auto 1rem; }
      `}</style>
      <div className="app">
        <header className="app-header">
          <VideoIcon className="icon-large" />
          <h1>Video Compressor Pro</h1>
        </header>
        {renderContent()}
      </div>
    </>
  );
};

export default App;
