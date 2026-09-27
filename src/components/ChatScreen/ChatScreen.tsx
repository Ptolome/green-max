import { useState, useEffect, useRef} from 'react';
import cn from 'classnames';


import './ChatScreen.css';
import type { ChatMessage, Credentials } from '../../types';
import { GreenApiService } from '../../api/greenApi';

interface ChatScreenProps {
  credentials: Credentials;
  phoneNumber: string;
  chatId: string;
  onBack: () => void;
}

export function ChatScreen({ credentials, phoneNumber, chatId, onBack }: ChatScreenProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<boolean>(true);

  const apiService = new GreenApiService(credentials);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    pollingRef.current = true;

    const pollLoop = async () => {
      if (!pollingRef.current) return;

      try {
        const notification = await apiService.receiveNotification();
        
        if (notification) {
          const { receiptId, body } = notification;
          
          if (body.typeWebhook === 'incomingMessageReceived' && body.messageData?.typeMessage === 'textMessage') {
            const incomingChatId = body.senderData?.chatId;
            const senderPhone = String(body.senderData?.senderPhoneNumber || '');
            
            const isOurChat = 
              incomingChatId === chatId ||
              incomingChatId === phoneNumber ||
              incomingChatId?.endsWith(phoneNumber) ||
              senderPhone === phoneNumber ||
              senderPhone.endsWith(phoneNumber.slice(-10));

            if (isOurChat) {
              const chatMessage: ChatMessage = {
                id: body.idMessage,
                text: body.messageData.textMessageData?.textMessage || '',
                sender: 'recipient',
                timestamp: new Date(body.timestamp * 1000),
              };
              setMessages((prev) => [...prev, chatMessage]);
            }
          }

          await apiService.deleteNotification(receiptId);
        }
      } catch (err) {
        console.error('Polling error:', err);
      }

      if (pollingRef.current) {
        setTimeout(pollLoop, 2000);
      }
    };

    pollLoop();

    return () => {
      pollingRef.current = false;
    };
  }, [chatId, phoneNumber]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedText = inputValue.trim();
    if (!trimmedText || isLoading) return;

    setIsLoading(true);

    try {
      const userMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        text: trimmedText,
        sender: 'user',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setInputValue('');

      await apiService.sendMessage(chatId, trimmedText);
    } catch (err) {
      console.error('Send error:', err);
      setMessages((prev) => prev.filter((msg) => !msg.id.startsWith('temp-')));
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chat-container">
      {/* Header */}
      <header className="chat-header">
        <button className="back-button" onClick={onBack} type="button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        
        <div className="chat-user-info">
          <div className="user-avatar">
            <img src="https://ui-avatars.com/api/?name=П&background=764ba2&color=fff" alt="Avatar" />
          </div>
          <div className="user-details">
            <h3 className="user-name">Полина</h3>
            <span className="user-status">в сети</span>
          </div>
        </div>

        <div className="header-actions">
          <button className="header-btn" type="button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
          </button>
          <button className="header-btn" type="button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className="messages-area">
        {messages.length === 0 && (
          <div className="empty-chat">
            <p>Начните общение</p>
          </div>
        )}

        {messages.map((msg) => (
          <div 
            key={msg.id} 
            // ИСПОЛЬЗУЕМ cn для условного добавления класса 'user' или 'recipient'
            className={cn('message-wrapper', msg.sender)}
          >
            <div className="message-bubble">
              <p className="message-text">{msg.text}</p>
              <div className="message-meta">
                <span className="message-time">{formatTime(msg.timestamp)}</span>
                {msg.sender === 'user' && (
                  <svg className="message-status" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className={cn('message-wrapper', 'user')}>
            <div className={cn('message-bubble', 'sending')}>
              <p className="message-text">Отправка...</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form className="input-area" onSubmit={handleSendMessage}>
        <button type="button" className="attach-btn">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
          </svg>
        </button>
        
        <input
          type="text"
          className="message-input"
          placeholder="Сообщение"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={isLoading}
        />
        
        <button type="button" className="emoji-btn">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
            <line x1="9" y1="9" x2="9.01" y2="9"/>
            <line x1="15" y1="9" x2="15.01" y2="9"/>
          </svg>
        </button>
        
        <button 
          type="submit" 
          className={cn('send-btn', isLoading && 'disabled')}
          disabled={isLoading || !inputValue.trim()}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </form>
    </div>
  );
}