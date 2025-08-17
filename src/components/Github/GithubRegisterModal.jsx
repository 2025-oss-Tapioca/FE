// src/components/Github/GithubRegisterModal.jsx
import React from 'react';
import GithubRegisterForm from './GithubRegisterForm';
import '@/styles/css/AddServerModal.css';

export default function GithubRegisterModal({ teamCode, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>GitHub 저장소 등록</h2>
        <GithubRegisterForm teamCode={teamCode} onDone={onClose}/>
      </div>
    </div>
  );
}
