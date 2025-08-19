import { useMutation } from '@tanstack/react-query';

import * as logMonitoring from '../apis/logMonitoring';



export const usePostLogMonitoring = () => {

    return useMutation({
        mutationFn: ({ sourceType, teamCode }) =>
            logMonitoring.postLogMonitoring(sourceType, teamCode),
    });
};