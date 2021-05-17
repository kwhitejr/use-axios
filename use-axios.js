import { useState, useEffect, useReducer } from "react";
import axios, { CancelToken, isCancel } from 'axios';

// Reducer helps manage complex local state.
const axiosReducer = (state, action) => {
  switch (action.type) {
    case 'AXIOS_INIT':
      return {
        ...state,
        isLoading: true,
        isError: false
      };
    case 'AXIOS_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case 'AXIOS_FAILURE':
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    default:
      throw new Error();
  }
};

const useAxios = (url, config, initialData) => {
  // const [options, setOptions] = useState({ url, config });

  const [state, dispatch] = useReducer(axiosReducer, {
    isLoading: false,
    isError: false,
    data: initialData,
  });

  useEffect(() => {
    let isMounted = true;
    let source = CancelToken.source();

    const callAxios = async () => {
      dispatch({ type: 'AXIOS_INIT' });

      try {
        const result = await axios(url, { ...config, cancelToken: source.token });
        if (isMounted) {
          dispatch({ type: 'AXIOS_SUCCESS', payload: result });
        }
      } catch (err) {
        if (!isMounted) return;
        if (isCancel(err)) return;
        dispatch({ type: 'AXIOS_FAILURE' });
      }
    };

    callAxios();

    return () => {
      source.cancel('Operation canceled.');
    };

  }, [url, config]);

  return state;
};

export default useAxios;
