// store/index.ts

import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import cartReducer, { CartItem } from "@/store/slices/cartSlice";
import productReducer from "@/store/slices/productSlice";
import categoryReducer from "@/store/slices/categorySlice";

const cartPersistConfig = {
  key: "cart",
  storage,
};

const rootReducer = combineReducers({
  cart: persistReducer<{ items: CartItem[] }>(cartPersistConfig, cartReducer),
  products: productReducer,
  categories: categoryReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

