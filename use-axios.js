import React, { useEffect, useReducer } from "react";
import axios, { CancelToken, isCancel } from "axios";

// Reducer helps manage complex local state.
const axiosReducer = (state, action) => {
  switch (action.type) {
    case "AXIOS_INIT":
      return {
        isLoading: true,
        isError: false
      };
    case "AXIOS_SUCCESS":
      return {
        isLoading: false,
        isError: false,
        response: action.payload
      };
    case "AXIOS_FAILURE":
      return {
        isLoading: false,
        isError: true
      };
    default:
      throw new Error();
  }
};

/**
 *
 * @param {string} url      - The url to call
 * @param {object} [config] - The axios config object; defaults to GET
 * @returns {state}         - { isLoading, isError, response }
 */
const useAxios = (url, config) => {
  const [state, dispatch] = useReducer(axiosReducer, {
    isLoading: false,
    isError: false
  });

  useEffect(() => {
    let isMounted = true;
    let source = CancelToken.source();

    const callAxios = async () => {
      dispatch({ type: "AXIOS_INIT" });

      try {
        const response = await axios(url, {
          ...config,
          cancelToken: source.token
        });
        if (isMounted) {
          dispatch({ type: "AXIOS_SUCCESS", payload: response });
        }
      } catch (err) {
        if (!isMounted) return;
        if (isCancel(err)) {
          console.log("Canceled request.");
          return;
        }
        dispatch({ type: "AXIOS_FAILURE" });
      }
    };

    callAxios();

    return () => {
      isMounted = false;
      source.cancel("Operation canceled.");
    };
  }, [url]);

  return state;
};

export default useAxios;
