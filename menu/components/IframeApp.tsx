import React from 'react';
import { useLocation } from 'react-router-dom';
import { useApps } from '../context/AppContext';

const IframeApp: React.FC = () => {
  const { apps } = useApps();
  const location = useLocation();
  const currentApp = apps.find(app => location.pathname.startsWith(app.path));
  const src = currentApp?.iframeSrc || '';

  if (!src) return <div style={{ color: 'white', padding: '2rem' }}>App not found</div>;

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <iframe
        src={src}
        style={{ width: '100%', height: '100%', border: 'none' }}
        title="Sub Application"
        allow="camera; microphone"
      />
    </div>
  );
};

export default IframeApp;
