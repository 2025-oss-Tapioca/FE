import { clientAI } from '../utils/axios.jsx';


export const postPrompt = async (prompt) => {
    const response = await clientAI.post('/api/invoke', prompt);
    return response
};