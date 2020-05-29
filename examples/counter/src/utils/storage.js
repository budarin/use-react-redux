import { createContext, createStorage } from "@budarin/use-react-redux";

const StateContext1 = createContext({});
const DispatchContext1 = createContext({});

const storage = createStorage(StateContext1, DispatchContext1);

export default storage;
