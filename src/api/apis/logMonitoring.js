import { client } from '../utils/axios';

export const postLogMonitoring = (sourceType, teamCode) => {
    return client.post(`/api/log/register/${sourceType.toLowerCase()}/${teamCode}`);
};