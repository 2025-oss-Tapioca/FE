import client from '../utils/axios.jsx';

export const getTeam = () => {
    return client.get('/api/team');
};

export const getTeamByCode = (teamCode) => {
    return client.get(`/api/team/${teamCode}`);
};

export const createTeam = (teamData) => {
    return client.post('/api/team/create', teamData);
};

export const joinTeam = (teamData) => {
    return client.post('/api/team/join', teamData);
};

export const deleteTeam = (teamCode) => {
    return client.delete('/api/team/leave', { data: teamCode });
};