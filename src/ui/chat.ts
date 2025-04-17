import { ChatPage } from './ChatPage';

document.addEventListener('DOMContentLoaded', () => {
  const chatPage = new ChatPage('http://localhost:3000', 'chat-container');
  
  chatPage.addWelcomeMessage();
  
  console.log('Chat page initialized');
});
