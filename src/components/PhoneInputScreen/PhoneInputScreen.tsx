import { useState } from 'react';

interface PhoneInputScreenProps {
  onStartChat: (phoneNumber: string, chatId: string) => void;
  onLogout: () => void;
}

export function PhoneInputScreen({ onStartChat, onLogout }: PhoneInputScreenProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e:React.FormEvent) => {
    e.preventDefault();
    
    const trimmedPhone = phoneNumber.trim();
    if (!trimmedPhone) return;

    // Форматируем номер: убираем +, пробелы, скобки, дефисы
    const formattedPhone = trimmedPhone.replace(/[\s\+\(\)\-]/g, '');
    
    // Простая проверка на длину номера (от 10 до 15 цифр)
    if (!/^\d{10,15}$/.test(formattedPhone)) {
      setError('Неверный формат номера. Введите только цифры, например: 79001234567');
      return;
    }

    // Сразу формируем chatId по стандарту GREEN-API
    const chatId = `${formattedPhone}@c.us`;
    
    // Переходим в чат
    onStartChat(formattedPhone, chatId);
  };

  return (
    <div className="phone-screen">
      <div className="phone-container">
        <div className="phone-header">
          <h2>Новый чат</h2>
          <button onClick={onLogout} className="logout-button">
            Выйти
          </button>
        </div>

        <form onSubmit={handleSubmit} className="phone-form">
          <div className="form-group">
            <label htmlFor="phone">Номер телефона получателя</label>
            <input
              id="phone"
              type="tel"
              value={phoneNumber}
              onChange={(e) => {
                setPhoneNumber(e.target.value);
                setError(null); // Сбрасываем ошибку при вводе
              }}
              placeholder="79001234567"
              required
            />
            <small>Введите номер в формате 79001234567 (без + и пробелов)</small>
          </div>

          {error && <div className="error-message" style={{color: 'red', marginTop: '8px', fontSize: '14px'}}>{error}</div>}

          <button type="submit" className="start-chat-button">
            Начать чат
          </button>
        </form>
      </div>
    </div>
  );
}