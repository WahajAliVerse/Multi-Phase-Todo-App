import { useState, useEffect } from 'react';
import axiosInstance from '@/utils/http/axiosConfig';
import { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

const useApi = <T,>(url: string, options?: AxiosRequestConfig): ApiState<T> => {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        
        const response: AxiosResponse<T> = await axiosInstance.request({
          url,
          ...options,
        });

        if (isMounted) {
          setState({
            data: response.data,
            loading: false,
            error: null,
          });
        }
      } catch (error) {
        if (isMounted) {
          const errorMessage = 
            (error as AxiosError)?.response?.data 
              ? (error as AxiosError).response?.data as string 
              : (error as Error).message || 'An error occurred';
          
          setState({
            data: null,
            loading: false,
            error: errorMessage,
          });
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [url]);

  return state;
};

export default useApi;