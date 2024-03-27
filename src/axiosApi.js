import axios from "axios";

const createAPI = () => {
    return axios.create({
        baseURL: 'http://localhost:8000/api'
    });
};

const API = createAPI();

API.interceptors.request.use((config) => {
    config.headers.Authorization = `Bearer ${localStorage.getItem('loginToken')}`;
    return config;
});
API.interceptors.response.use(function (response) {
    return response;
}, async function (error) {
    if (error.response.status === 401) {
        console.log("unauthentificated")
    }
    return Promise.reject(error);
});

export default API;
