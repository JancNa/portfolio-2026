import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { supabase } from './lib/supabase.ts';

// Test Connection
supabase
  .from('portfolio_projects')
  .select('title, slug')
  .eq('visible', true)
  .then(({ data, error }) => console.log('TEST SUPABASE:', data, error));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
