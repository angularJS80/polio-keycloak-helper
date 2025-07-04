import { useState } from 'react';

export type MessageType = { type: 'success' | 'error', text: string } | null;

export function useMessage() {
  const [message, setMessage] = useState<MessageType>(null);

  const showSuccess = (text: string) => setMessage({ type: 'success', text });
  const showError = (text: string) => setMessage({ type: 'error', text });
  const clearMessage = () => setMessage(null);

  return { message, showSuccess, showError, clearMessage };
} 