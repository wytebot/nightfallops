import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './style.css';
import ErrorBoundary from './ErrorBoundary';
import { installDiagnostics, logDiagnostic } from './diagnostics';
installDiagnostics();
logDiagnostic('info','startup',`App booted (${navigator.userAgent.includes('wv')?'Android WebView or embedded browser':'browser runtime'})`);

createRoot(document.getElementById('root')!).render(<React.StrictMode><ErrorBoundary><App /></ErrorBoundary></React.StrictMode>);
