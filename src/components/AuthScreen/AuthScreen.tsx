import { useState} from 'react';
import type { Credentials } from '../../types';


interface AuthScreenProps {
  onLogin: (credentials: Credentials) => void;
}

export function AuthScreen({ onLogin }: AuthScreenProps) {
  const [idInstance, setIdInstance] = useState('');
  const [apiTokenInstance, setApiTokenInstance] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (idInstance.trim() && apiTokenInstance.trim()) {
      onLogin({ idInstance: idInstance.trim(), apiTokenInstance: apiTokenInstance.trim() });
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-container">
        <h1 className="auth-title">MAX Chat</h1>
        <p className="auth-subtitle">Введите учетные данные GREEN-API</p>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="idInstance">ID Instance</label>
            <input
              id="idInstance"
              type="text"
              value={idInstance}
              onChange={(e) => setIdInstance(e.target.value)}
              placeholder="1101000001"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="apiToken">API Token Instance</label>
            <input
              id="apiToken"
              type="password"
              value={apiTokenInstance}
              onChange={(e) => setApiTokenInstance(e.target.value)}
              placeholder="••••••••••••••••"
              required
            />
          </div>

          <button type="submit" className="auth-button">
            Войти
          </button>
        </form>
      </div>
    </div>
  );
}