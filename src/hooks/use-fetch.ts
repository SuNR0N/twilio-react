import { useEffect, useState } from 'react';

interface FetchState<T = any> {
  data: T | null;
  isLoading: boolean;
  error: any;
}

const initialState: FetchState = {
  data: null,
  isLoading: false,
  error: null,
};

export const useFetch = <T = any>(url: string, options: RequestInit = {}): [FetchState<T>, () => void] => {
  const [state, setState] = useState<FetchState<T>>(initialState);
  const [trigger, setTrigger] = useState(false);

  const doFetch = () => {
    setTrigger(true);
  };

  useEffect(() => {
    const fetchData = async () => {
      setTrigger(false);
      setState({
        data: null,
        isLoading: true,
        error: null,
      });

      try {
        const result = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            'Content-Type': 'application/json',
          },
        });
        const jsonData = await result.json();
        setState((s) => ({
          ...s,
          data: jsonData,
          isLoading: false,
        }));
      } catch (error) {
        setState((s) => ({
          ...s,
          error,
          isLoading: false,
        }));
      }
    };

    if (trigger) {
      fetchData();
    }
  }, [options, trigger, url]);

  return [state, doFetch];
};
