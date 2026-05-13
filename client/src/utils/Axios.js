// import axios from "axios";

// const baseURL = process.env.NEXT_PUBLIC_API_URL || '';

// //creating an instance of axios with the baseURL
// // and withCredentials set to true
// const Axios = axios.create({
//     baseURL : baseURL,
//     withCredentials : true
// })

// //sending access token in the header
// Axios.interceptors.request.use(
//     async(config)=>{
//         const accessToken = localStorage.getItem('accesstoken')

//         if(accessToken){
//             config.headers.Authorization = `Bearer ${accessToken}`
//         }

//         return config
//     },
//     (error)=>{
//         return Promise.reject(error)
//     }
// )

// //extend the life span of access token with 
// // the help refresh
// Axios.interceptors.request.use(
//     (response)=>{
//         return response
//     },
//     async(error)=>{
//         let originRequest = error.config 

//         if(error.response.status === 401 && !originRequest.retry){
//             originRequest.retry = true

//             const refreshToken = localStorage.getItem("refreshToken")

//             if(refreshToken){
//                 const newAccessToken = await refreshAccessToken(refreshToken)

//                 if(newAccessToken){
//                     originRequest.headers.Authorization = `Bearer ${newAccessToken}`
//                     return Axios(originRequest)
//                 }
//             }
//         }
        
//         return Promise.reject(error)
//     }
// )


// const refreshAccessToken = async(refreshToken)=>{
//     try {
//         const response = await Axios({
//             ...SummaryApi.refreshToken,
//             headers : {
//                 Authorization : `Bearer ${refreshToken}`
//             }
//         })

//         const accessToken = response.data.data.accessToken
//         localStorage.setItem('accesstoken',accessToken)
//         return accessToken
//     } catch (error) {
//         console.log(error)
//     }
// }

// export default Axios



import axios from "axios";
import SummaryApi, { baseURL as summaryApiBaseURL } from "../common/SummaryApi";
import i18n, { getCurrentLocale } from "@/lib/i18n";

const axiosBaseURL = summaryApiBaseURL || "";

// Creating an instance of axios with the baseURL
// and withCredentials set to true
const Axios = axios.create({
    baseURL: axiosBaseURL,
    withCredentials: true
});

// Sending access token in the header
Axios.interceptors.request.use(
    async (config) => {
        // Only access localStorage on client side
        if (typeof window !== 'undefined') {
            const accessToken = localStorage.getItem('accesstoken');

            if (accessToken) {
                config.headers.Authorization = `Bearer ${accessToken}`;
            }

            config.headers["X-Locale"] = getCurrentLocale();
            config.headers["Accept-Language"] = i18n.language || getCurrentLocale();
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/** Single in-flight refresh so concurrent 401s do not race or invalidate each other */
let refreshAccessTokenPromise = null;

const refreshAccessToken = async (refreshToken) => {
    if (!refreshToken) return null;
    if (!refreshAccessTokenPromise) {
        refreshAccessTokenPromise = (async () => {
            try {
                const response = await Axios({
                    ...SummaryApi.refreshToken,
                    headers: {
                        Authorization: `Bearer ${refreshToken}`
                    }
                });

                const accessToken = response.data?.data?.accessToken;
                if (accessToken) {
                    localStorage.setItem('accesstoken', accessToken);
                }
                const nextRefresh = response.data?.data?.refreshToken;
                if (nextRefresh) {
                    localStorage.setItem('refreshToken', nextRefresh);
                }
                return accessToken || null;
            } catch (err) {
                console.log(err);
                return null;
            } finally {
                refreshAccessTokenPromise = null;
            }
        })();
    }
    return refreshAccessTokenPromise;
};

// Extend the life span of access token with
// the help of refresh token
Axios.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        // Only run this on client side
        if (typeof window === 'undefined') {
            return Promise.reject(error);
        }

        const originRequest = error.config;
        if (!originRequest) {
            return Promise.reject(error);
        }

        const reqUrl = String(originRequest.url || '');
        const isRefreshRequest = reqUrl.includes('refresh-token');

        if (
            error.response?.status === 401 &&
            !originRequest.retry &&
            !isRefreshRequest
        ) {
            originRequest.retry = true;

            const refreshToken = localStorage.getItem("refreshToken");
            const newAccessToken = await refreshAccessToken(refreshToken);

            if (newAccessToken) {
                originRequest.headers = originRequest.headers || {};
                originRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return Axios(originRequest);
            }
        }

        return Promise.reject(error);
    }
);

export default Axios;
