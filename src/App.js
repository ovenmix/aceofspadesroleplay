import React from 'react';
import ServerManagementSystem from './components/ServerManagementSystem';
import { AuthProvider } from './hooks/useAuth';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <ServerManagementSystem />
      </div>
    </AuthProvider>
  );
}

export default App;