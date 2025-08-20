import "./App.css";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Team from "./pages/Team";
import SignUp from "./pages/SignUp";
import HomeRedirect from "./HomeRedirect";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// 1. QueryClient 생성
const queryClient = new QueryClient();


function App() {
  return (
    // 2. 최상단에서 Provider로 감싸기
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/team/:teamCode" element={<Home />} />
          <Route path="/team" element={<Team />} />
          <Route path="/team/:teamCode" element={<Home />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/signup" element={<SignUp />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
