import type { Credentials, NotificationResponse } from "../types";


const BASE_URL = 'https://api.green-api.com';

const parseJson = async (response: Response): Promise<any> => {
  const text = await response.text();
  if (!text) return null;
  
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error('Ошибка парсинга JSON. Сырой ответ:', text);
    return null;
  }
};

export class GreenApiService {
  private credentials: Credentials;

  constructor(credentials: Credentials) {
    this.credentials = credentials;
  }

  async sendMessage(chatId: string, message: string): Promise<{ idMessage: string }> {
    const url = `${BASE_URL}/waInstance${this.credentials.idInstance}/sendMessage/${this.credentials.apiTokenInstance}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId, message }),
    });

    const data = await parseJson(response);

    if (!response.ok) {
      if (response.status === 400) throw new Error(data?.message || 'Ошибка валидации.');
      if (response.status === 401) throw new Error('Неверный ID Instance или API Token.');
      if (response.status === 403) throw new Error('Аккаунт не авторизован или заблокирован.');
      throw new Error(`Ошибка отправки: ${response.status}`);
    }

    if (!data || !data.idMessage) {
      throw new Error('Сообщение не отправлено: сервер не вернул idMessage');
    }

    return data;
  }

  async receiveNotification(): Promise<NotificationResponse | null> {
    // URL совпадает с Python-примером
    const url = `${BASE_URL}/waInstance${this.credentials.idInstance}/receiveNotification/${this.credentials.apiTokenInstance}`;
    
    const response = await fetch(url, { 
      method: 'GET',
    });

    if (response.status === 200) {
      const data = await parseJson(response);
      return data;
    }
    
    if (response.status === 400) {
      const data = await parseJson(response);
      if (data?.message?.includes('custom webhook url is set')) {
        throw new Error('ОШИБКА: Включен Webhook! Очистите поле "Webhook URL" в личном кабинете.');
      }
      throw new Error(`Ошибка получения: ${data?.message || response.statusText}`);
    }


    return null; 
  }

  async deleteNotification(receiptId: number): Promise<boolean> {
    // ИСПРАВЛЕНО: правильный порядок параметров как в Python-примере
    // /deleteNotification/{apiTokenInstance}/{receiptId}
    const url = `${BASE_URL}/waInstance${this.credentials.idInstance}/deleteNotification/${this.credentials.apiTokenInstance}/${receiptId}`;
    
    const response = await fetch(url, { 
      method: 'DELETE',
    });
    
    return response.ok;
  }
}