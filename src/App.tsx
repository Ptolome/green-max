import { useState } from 'react';

import './App.css';
import type { Credentials } from './types';
import { PhoneInputScreen } from './components/PhoneInputScreen/PhoneInputScreen';
import { AuthScreen } from './components/AuthScreen/AuthScreen';
import { ChatScreen } from './components/ChatScreen/ChatScreen';

type Screen = 'auth' | 'phone' | 'chat';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('auth');
  const [credentials, setCredentials] = useState<Credentials | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [chatId, setChatId] = useState('');

  const handleLogin = (creds: Credentials) => {
    setCredentials(creds);
    setCurrentScreen('phone');
  };

  const handleStartChat = (phone: string, newChatId: string) => {
    setPhoneNumber(phone);
    setChatId(newChatId);
    setCurrentScreen('chat');
  };

  const handleLogout = () => {
    setCredentials(null);
    setPhoneNumber('');
    setChatId('');
    setCurrentScreen('auth');
  };

  const handleBackToPhone = () => {
    setPhoneNumber('');
    setChatId('');
    setCurrentScreen('phone');
  };

  return (
    <div className="app">
      {currentScreen === 'auth' && (
        <AuthScreen onLogin={handleLogin} />
      )}
      
      {currentScreen === 'phone' && credentials && (
        <PhoneInputScreen 
          
          onStartChat={handleStartChat}
          onLogout={handleLogout}
        />
      )}
      
      {currentScreen === 'chat' && credentials && (
        <ChatScreen 
          credentials={credentials}
          phoneNumber={phoneNumber}
          chatId={chatId}
          onBack={handleBackToPhone}
        />
      )}
    </div>
  );
}

export default App;