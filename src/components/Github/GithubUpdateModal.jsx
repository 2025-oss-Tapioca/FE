// src/components/Github/GithubUpdateModal.jsx
import React from 'react';
import GithubUpdateForm from './GithubUpdateForm';
import '@/styles/css/AddServerModal.css';

export default function GithubUpdateModal({ teamCode, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>GitHub 설정 업데이트</h2>
        <GithubUpdateForm teamCode={teamCode} onDone={onClose} />
      </div>
    </div>
  );
}
