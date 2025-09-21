import React, { useState, useEffect } from 'react';
import { SpinnerIcon } from './icons';

const messages = [
  "Analyzing video metadata...",
  "Optimizing audio stream...",
  "Re-encoding video frames (this may take a while)...",
  "Applying compression algorithms...",
  "Finalizing compressed file...",
];

const ProcessingView: React.FC = () => {
  const [message, setMessage] = useState(messages[0]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setMessage(prevMessage => {
        const currentIndex = messages.indexOf(prevMessage);
        const nextIndex = (currentIndex + 1) % messages.length;
        return messages[nextIndex];
      });
    }, 3000);

    const progressInterval = setInterval(() => {
      setProgress(prev => (prev >= 100 ? 100 : prev + 7));
    }, 1000);

    return () => {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
    }
  }, []);

  return (
    <div className="processing-view">
      <SpinnerIcon className="icon-large spinner" />
      <h2>Compressing Video...</h2>
      <div className="progress-bar">
        <div className="progress-bar-inner" style={{ width: `${progress}%` }}></div>
      </div>
      <p>{message}</p>
    </div>
  );
};

export default ProcessingView;
