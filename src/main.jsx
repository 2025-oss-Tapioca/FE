import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

// 1. React Query에서 필요한 것들을 import 합니다.
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// 2. QueryClient 인스턴스를 생성합니다.
const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* 3. QueryClientProvider로 App 컴포넌트를 감싸고 client를 전달합니다. */}
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);