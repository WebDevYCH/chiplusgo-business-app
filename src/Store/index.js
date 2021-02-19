import {createStore, compose, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import reducers from './reducers';
import {createLogger} from 'redux-logger';
import { persistStore, persistReducer } from 'redux-persist'
import AsyncStorage from '@react-native-async-storage/async-storage';

const middleWare = [];

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist:['user']
  // stateReconciler: autoMergeLevel2
};

middleWare.push(thunk);
const loggerMiddleware = createLogger({
  predicate: () => process.env.NODE_ENV === 'development',
});
middleWare.push(loggerMiddleware);
const persistedReducer = persistReducer(persistConfig, reducers);
export const store = createStore(
  persistedReducer,
  {},
  compose(applyMiddleware(...middleWare)),
);
export const persistor = persistStore(store);