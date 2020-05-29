import { createContext, createUseStore, createProvider } from '@budarin/use-react-redux';

const StateContext1 = createContext({});
const DispatchContext1 = createContext({});

export const useStore = createUseStore(StateContext1, DispatchContext1);
export const StoreProvider = createProvider(StateContext1, DispatchContext1);
