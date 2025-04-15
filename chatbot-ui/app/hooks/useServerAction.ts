import { useCallback, useEffect, useState } from 'react';

type State<T, E> =
  | {
      data: T;
      error: null;
      isLoading: boolean;
      isPending: false;
    }
  | {
      data: null;
      error: null | E;
      isLoading: false;
      isPending: false;
    }
  | {
      data: null;
      error: null;
      isLoading: true;
      isPending: true;
    };

type ServerActionResult<T, E> = State<T, E> & {
  reload: () => void;
};

export const useServerAction = <T, E = any>(
  serverAction: () => Promise<T>,
): ServerActionResult<T, E> => {
  const [state, setState] = useState<State<T, E>>({
    data: null,
    error: null,
    isLoading: true,
    isPending: true,
  });
  const [reloading, setReloading] = useState<boolean>(true);

  useEffect(() => {
    if (!reloading) return;

    setState(
      state.data === null
        ? { data: null, error: null, isLoading: true, isPending: true }
        : { data: state.data, error: null, isLoading: true, isPending: false },
    );
    serverAction()
      .then((data) => {
        setState({ data, error: null, isLoading: false, isPending: false });
        setReloading(false);
      })
      .catch((err) => {
        console.error(err);
        setState({
          data: null,
          error: err,
          isLoading: false,
          isPending: false,
        });
        setReloading(false);
      });
  }, [reloading, serverAction]);

  return {
    ...state,
    reload: useCallback(() => setReloading(true), [setReloading]),
  };
};
