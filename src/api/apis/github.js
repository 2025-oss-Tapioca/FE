import client from '../utils/axios.jsx';

export const registerGithub = (payload) =>
  // 서버 명세: POST /api/github
  client.post('/api/github', payload);
// ⚠️ axios 인터셉터가 이미 response.data로 평탄화해서 돌려줌

// GitHub 설정 조회
export const getGithub = (teamCode) =>
  client.get(`/api/github/${encodeURIComponent(teamCode)}`);
