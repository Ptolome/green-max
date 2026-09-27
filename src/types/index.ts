export interface Credentials {
  idInstance: string;
  apiTokenInstance: string;
}

// Точная структура ответа от receiveNotification согласно вашей документации
export interface NotificationResponse {
  receiptId: number;
  body: {
    typeWebhook: string; // например, "incomingMessageReceived"
    instanceData: {
      idInstance: number;
      wid: string;
      typeInstance: string;
    };
    timestamp: number;
    idMessage: string;
    senderData: {
      chatId: string;
      chatName: string;
      chatType: string;
      sender: string;
      senderName: string;
      senderType: string;
      senderContactName: string;
      senderPhoneNumber: number;
    };
    messageData: {
      typeMessage: string; // например, "textMessage"
      textMessageData?: {
        textMessage: string; // <-- Вот здесь теперь лежит текст!
      };
    };
  };
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'recipient';
  timestamp: Date;
}