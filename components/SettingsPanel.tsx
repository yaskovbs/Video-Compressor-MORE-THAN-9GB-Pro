import React from 'react';
import { CompressionSettings } from '../types';

interface SettingsPanelProps {
  file: File;
  settings: CompressionSettings;
  onSettingsChange: (newSettings: CompressionSettings) => void;
  onCompress: () => void;
  onCancel: () => void;
}

const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  file,
  settings,
  onSettingsChange,
  onCompress,
  onCancel,
}) => {
  return (
    <div className="settings-panel">
      <h2>Compression Settings</h2>
      <div className="file-preview">
        <p><strong>File:</strong> {file.name}</p>
        <p><strong>Size:</strong> {formatBytes(file.size)}</p>
        <p><strong>Type:</strong> {file.type}</p>
      </div>
      <div className="settings-form">
        <label>Select Quality:</label>
        <div className="quality-options">
          {(
            [
              ['high_quality', 'High Quality', 'Larger file, best visual fidelity.'],
              ['balanced', 'Balanced', 'Good compression with minimal quality loss.'],
              ['smallest_size', 'Smallest Size', 'Highest compression, noticeable quality loss.']
            ] as const
          ).map(([value, title, description]) => (
            <label key={value}>
              <input
                type="radio"
                name="quality"
                value={value}
                checked={settings.quality === value}
                onChange={() => onSettingsChange({ ...settings, quality: value })}
              />
              <div>
                <strong>{title}</strong>
                <div className="small-text">{description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>
      <div className="action-buttons">
        <button className="button-secondary" onClick={onCancel}>Cancel</button>
        <button className="button-primary" onClick={onCompress}>Compress Video</button>
      </div>
    </div>
  );
};

export default SettingsPanel;
