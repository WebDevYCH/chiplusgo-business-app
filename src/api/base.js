import axios from 'axios';
import {
  API_URL,
  
} from '../utiles';

const apiClient = axios.create({
  baseURL: API_URL,
});

/**
 * Inject the header, otherwise continue
 * without any Auth token.
 */
apiClient.interceptors.request.use(
  async (config) => {
    try {
      return {
        ...config,
        headers: {
          ...config.headers,
          'content-type': 'application/json',
        },
      };
    } catch (e) {
      // no token in local storage
      return config;
    }
  },
  (error) => Promise.reject(error)
);

const { get, post } = apiClient;
export { get, post };
