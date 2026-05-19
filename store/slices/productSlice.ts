// store/slices/productSlice.ts — Product state: fetch, add, update, remove

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { IProduct } from "@/types";

interface ProductState {
  items: IProduct[];
  loading: boolean;
  error: string | null;
}

const initialState: ProductState = { items: [], loading: false, error: null };

export const fetchProducts = createAsyncThunk("products/fetchAll", async () => {
  const res = await fetch("/api/products");
  return res.json() as Promise<IProduct[]>;
});

export const addProduct = createAsyncThunk(
  "products/add",
  async (data: Partial<IProduct>) => {
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json() as Promise<IProduct>;
  },
);

export const updateProduct = createAsyncThunk(
  "products/update",
  async ({ id, data }: { id: string; data: Partial<IProduct> }) => {
    const res = await fetch(`/api/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json() as Promise<IProduct>;
  },
);

export const deleteProduct = createAsyncThunk(
  "products/delete",
  async (id: string) => {
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    return id;
  },
);

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchProducts.fulfilled, (s, a) => {
        s.loading = false;
        s.items = a.payload;
      })
      .addCase(fetchProducts.rejected, (s) => {
        s.loading = false;
        s.error = "Failed";
      })
      .addCase(addProduct.fulfilled, (s, a) => {
        s.items.unshift(a.payload);
      })
      .addCase(updateProduct.fulfilled, (s, a) => {
        const i = s.items.findIndex((p) => p._id === a.payload._id);
        if (i !== -1) s.items[i] = a.payload;
      })
      .addCase(deleteProduct.fulfilled, (s, a) => {
        s.items = s.items.filter((p) => p._id !== a.payload);
      });
  },
});

export default productSlice.reducer;

