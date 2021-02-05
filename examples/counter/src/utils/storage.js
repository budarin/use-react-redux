import { createStorage } from '@budarin/use-react-redux';

const { useStore, StoreProvider } = createStorage();

export const useAppStore = useStore;
export const AppStoreProvider = StoreProvider;
