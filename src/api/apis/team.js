import client from '../utils/axios.jsx';

export const getTeam = () => {
    return client.get('/team');
};

export const createTeam = (teamData) => {
    return client.post('/team/create', teamData);
};

export const joinTeam = (teamData) => {
    return client.post('/team/join', teamData);
};

export const deleteTeam = (teamId) => {
    return client.delete(`/team/leave/${teamId}`);
};