// // store/index.ts 

// import { configureStore } from "@reduxjs/toolkit";
// import productReducer from "./slices/productSlice";
// import categoryReducer from "./slices/categorySlice";
// import cartReducer from "./slices/cartSlice";

// export const store = configureStore({
//   reducer: {
//     cart: cartReducer,
//     products: productReducer,
//     categories: categoryReducer,
//   },
// });

// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;





// store/index.ts

import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";
import storage from "redux-persist/lib/storage";
import cartReducer from "@/store/slices/cartSlice";
import productReducer from "@/store/slices/productSlice";
import categoryReducer from "@/store/slices/categorySlice";

const cartPersistConfig = {
  key: "cart",
  storage,
};

export const store = configureStore({
  reducer: {
    cart: persistReducer(cartPersistConfig, cartReducer) as any,
    products: productReducer,
    categories: categoryReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

