import axios from "axios";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
});

const clientAI = axios.create({
  baseURL: import.meta.env.VITE_AI_API_URL,
  timeout: 10000,
});

// 요청 인터셉터: 모든 API 요청이 서버로 전송되기 전에 특정 작업을 수행합니다.
client.interceptors.request.use(
  (config) => {
    // 로컬 스토리지에서 액세스 토큰을 가져옵니다.
    // const accessToken = localStorage.getItem('accessToken');

    // // 토큰이 존재하면, 요청 헤더에 'Authorization' 헤더를 추가합니다.
    // if (accessToken) {
    //     config.headers.Authorization = `Bearer ${accessToken}`;
    // }

    config.headers.Authorization =
      "Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI0ZjlhMTIzZC02Yzk4LTQ3MWUtODUzNi0wNDA0YWI5ODhmOTUiLCJsb2dpbklkIjoic29ubnkiLCJwYXNzd29yZCI6IntiY3J5cHR9JDJhJDEwJEhoSEJTS1c4LkUzOFplUW9YaVp1Li5OYTJuWDhra1NaS3dueVV1QnRWTmhOaHpobk1BS3RtIiwiYXV0aCI6IlJPTEVfVVNFUiIsImV4cCI6MTc1Nzc3NzgyNX0.3C7ekn4qdGrxTfQjL1FvNH6AWL_vjbSnNHbid13LsII";

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 서버로부터 응답을 받은 후, then 또는 catch로 처리되기 전에 작업을 수행합니다.
client.interceptors.response.use(
  (response) => {
    console.log("Axios Response:", response);
    // 성공적인 응답(2xx 상태 코드)을 받으면, 응답 데이터만 반환하여 사용하기 편하게 만듭니다.
    return response.data;
  },
  (error) => {
    // 여기서 401 에러(토큰 만료) 시 리프레시 토큰으로 재발급 요청을 보내거나
    // 로그인 페이지로 리디렉션하는 등의 공통 에러 처리를 할 수 있습니다.
    if (error.response?.status === 401) {
      // 예: 로그인 페이지로 이동
      // window.location.href = '/login';
    }
    console.log("Axios Error:", error);

    // 처리한 에러 외 다른 에러들은 그대로 반환하여,
    // API를 호출한 쪽에서 개별적으로 처리하도록 합니다.
    return Promise.reject(error);
  }
);

// 요청 인터셉터: 모든 API 요청이 서버로 전송되기 전에 특정 작업을 수행합니다.
clientAI.interceptors.request.use(
  (config) => {
    // 로컬 스토리지에서 액세스 토큰을 가져옵니다.
    // const accessToken = localStorage.getItem('accessToken');

    // // 토큰이 존재하면, 요청 헤더에 'Authorization' 헤더를 추가합니다.
    // if (accessToken) {
    //     config.headers.Authorization = `Bearer ${accessToken}`;
    // }

    config.headers.Authorization =
      "Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI0ZjlhMTIzZC02Yzk4LTQ3MWUtODUzNi0wNDA0YWI5ODhmOTUiLCJsb2dpbklkIjoic29ubnkiLCJwYXNzd29yZCI6IntiY3J5cHR9JDJhJDEwJEhoSEJTS1c4LkUzOFplUW9YaVp1Li5OYTJuWDhra1NaS3dueVV1QnRWTmhOaHpobk1BS3RtIiwiYXV0aCI6IlJPTEVfVVNFUiIsImV4cCI6MTc1Nzc3NzgyNX0.3C7ekn4qdGrxTfQjL1FvNH6AWL_vjbSnNHbid13LsII";

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 서버로부터 응답을 받은 후, then 또는 catch로 처리되기 전에 작업을 수행합니다.
clientAI.interceptors.response.use(
  (response) => {
    console.log("Axios Response:", response);
    // 성공적인 응답(2xx 상태 코드)을 받으면, 응답 데이터만 반환하여 사용하기 편하게 만듭니다.
    return response.data;
  },
  (error) => {
    // 여기서 401 에러(토큰 만료) 시 리프레시 토큰으로 재발급 요청을 보내거나
    // 로그인 페이지로 리디렉션하는 등의 공통 에러 처리를 할 수 있습니다.
    if (error.response?.status === 401) {
      // 예: 로그인 페이지로 이동
      // window.location.href = '/login';
    }
    console.log("Axios Error:", error);

    // 처리한 에러 외 다른 에러들은 그대로 반환하여,
    // API를 호출한 쪽에서 개별적으로 처리하도록 합니다.
    return Promise.reject(error);
  }
);

export default client;        
export { client, clientAI };
