import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as dashBoardAPI from '../apis/dashBoard';

export const usePostPrompt = () => {
    // 1. queryClient 인스턴스를 가져옵니다.
    //    이것은 React Query의 캐시를 관리하고 쿼리를 무효화하는 데 사용됩니다.
    const queryClient = useQueryClient();

    return useMutation({
        // 2. mutationFn: 실제 API를 호출하는 비동기 함수를 지정합니다.
        mutationFn: dashBoardAPI.postPrompt,

        // 3. onSuccess: mutation이 성공적으로 완료되면 실행됩니다.
        //    'response'는 mutationFn이 반환한 성공 데이터입니다.
        onSuccess: (response) => {
            console.log('프롬프트 전송 성공:', response);

            // 성공 후 가장 흔하게 하는 작업은 관련된 데이터를 새로고침하는 것입니다.
            // 예를 들어, 채팅 메시지 목록을 다시 불러오게 합니다.
            // 'prompts'라는 쿼리 키를 가진 모든 쿼리를 무효화(invalidate)시킵니다.
            queryClient.invalidateQueries({ queryKey: ['prompts'] });
            return response;

            // 사용자에게 성공 피드백을 줄 수도 있습니다. (예: toast 알림)
            // toast.success('프롬프트가 성공적으로 전송되었습니다.');
        },

        // 4. onError: mutation이 실패하면 실행됩니다.
        //    'error'는 발생한 에러 객체입니다.
        onError: (error) => {
            console.error('프롬프트 전송 실패:', error);

            // 사용자에게 실패 피드백을 줍니다.
            const errorMessage = error.response?.data?.message || '프롬프트 전송에 실패했습니다.';
            alert(errorMessage);
        },

        // 5. onSettled: 성공/실패 여부와 관계없이 mutation이 완료되면 항상 실행됩니다.
        //    로딩 스피너를 숨기는 등의 공통 작업을 하기에 좋습니다.
        onSettled: () => {
            console.log('프롬프트 전송 시도 완료.');
        },
    });
};