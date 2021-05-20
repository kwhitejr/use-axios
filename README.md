# use-axios
Source code and demo for a generic Axios call React Hook. [Live example](https://codesandbox.io/s/use-axios-nydlk)

Want to suggest an improvement? I'm all ears! Please file an issue or open a PR!

## Usage
```jsx
import React, { useState } from "react";
import { useAxios } from "./use-axios";

const App = () => {
  const [id, setId] = useState("1");
  const axiosConfig = { method: "get", timeout: 2500 };
  const { isLoading, isError, response } = useAxios(
    `https://pokeapi.co/api/v2/pokemon/${id}`,
    axiosConfig
  );

  return (
    {response?.data && <div>{data}</div>}
    {isLoading && <LoadingIcon/>}
    {isError && <ErrorMsg/>}
  );
};
```

## Overview
`useAxios` is an [Axios](https://github.com/axios/axios)-specific implementation of my generic [useAsyncFunc](https://github.com/kwhitejr/use-async-func) React hook.

One issue for async operations is when the return value is no longer required. For example, the user leaves the page (the requesting component is unmounted) or the user provides a new search query (the old search query's response is superfluous).

You might see an error like this:
```
Warning: Can't perform a React state update on an unmounted component. This is a no-op, but it indicates a memory leak in your application. To fix, cancel all subscriptions and asynchronous tasks in a useEffect cleanup function.
```

In these situations, we want to cancel the initial request. The browser Web API provides the [`AbortController` interface](https://developer.mozilla.org/en-US/docs/Web/API/AbortController); it is a controller object that allows you to abort one or more Web requests. Axios provides similar capability with the [CancelToken](https://github.com/axios/axios#cancellation) class. CancelTokens are straightforward to implement if you are already using the Axios library. You read a little more about each implementation [here](https://medium.datadriveninvestor.com/aborting-cancelling-requests-with-fetch-or-axios-db2e93825a36).

## useAxios
```javascript
/**
 *
 * @param {string} url      - The url to call
 * @param {object} [config] - The axios config object; defaults to GET, etc
 * @returns {state}         - { isLoading, isError, response }
 */
const useAxios = (url, config) => {
  // useReducer manages the local complex state of the async func hook's lifecycle.
  // See the source code for the full reducer!
  // NOTE: it is easy to modify or expand the reducer to fit your needs.
  const [state, dispatch] = useReducer(axiosReducer, {
    isLoading: false,
    isError: false
  });

  useEffect(() => {
    // Declare Axios cancel token
    const source = CancelToken.source();

    // Define the axios call
    const callAxios = async () => {
      // Begin with a clean state
      dispatch({ type: "AXIOS_INIT" });

      try {
        // Straightforward axios call,
        // With cancel token inserted into config
        const response = await axios(url, {
          ...config,
          cancelToken: source.token
        });
        dispatch({ type: "AXIOS_SUCCESS", payload: response });
      } catch (err) {
        // Two options on error:
        // 1. If component is mounted but error is an axios cancel, simply return and move on
        // 2. For all other errors, assume async failure and dispatch failure action
        if (isCancel(err)) {
          console.log("Canceled request.");
          return;
        }
        dispatch({ type: "AXIOS_FAILURE" });
      }
    };

    // Invoke the defined axios call
    callAxios();

    // On unmount, cancel the request
    return () => {
      source.cancel("Operation canceled.");
    };

    // NOTE: here be dragon!
    // My instinct was include the axios config in this array, e.g. [url, config]
    // This causes an infinite re-render loop that I have not debugged yet :-/
  }, [url]);

  return state;
};

export default useAxios;
```

## Conclusion
It is good to cancel superfluous requests so that they do not become memory leaks! I hope you find this example helpful.