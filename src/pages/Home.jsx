import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4">Welcome to TAPIOCA</h1>
      <p className="text-gray-600 mb-6">당신의 하루를 더 편하게</p>
      <Link
        to="/auth/login"
        className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition"
      >
        로그인하러 가기 →
      </Link>
    </div>
  );
};

export default Home;
