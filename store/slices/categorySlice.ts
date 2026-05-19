// store/slices/categorySlice.ts — Category state: fetch, add, update, remove

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { ICategory } from "@/types";

interface CategoryState {
  items: ICategory[];
  loading: boolean;
  error: string | null;
}

const initialState: CategoryState = { items: [], loading: false, error: null };

export const fetchCategories = createAsyncThunk(
  "categories/fetchAll",
  async () => {
    const res = await fetch("/api/categories");
    return res.json() as Promise<ICategory[]>;
  },
);

export const addCategory = createAsyncThunk(
  "categories/add",
  async (data: Partial<ICategory>) => {
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json() as Promise<ICategory>;
  },
);

export const updateCategory = createAsyncThunk(
  "categories/update",
  async ({ id, data }: { id: string; data: Partial<ICategory> }) => {
    const res = await fetch(`/api/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json() as Promise<ICategory>;
  },
);

export const deleteCategory = createAsyncThunk(
  "categories/delete",
  async (id: string) => {
    await fetch(`/api/categories/${id}`, { method: "DELETE" });
    return id;
  },
);

const categorySlice = createSlice({
  name: "categories",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchCategories.fulfilled, (s, a) => {
        s.loading = false;
        s.items = a.payload;
      })
      .addCase(fetchCategories.rejected, (s) => {
        s.loading = false;
        s.error = "Failed";
      })
      .addCase(addCategory.fulfilled, (s, a) => {
        s.items.unshift(a.payload);
      })
      .addCase(updateCategory.fulfilled, (s, a) => {
        const i = s.items.findIndex((c) => c._id === a.payload._id);
        if (i !== -1) s.items[i] = a.payload;
      })
      .addCase(deleteCategory.fulfilled, (s, a) => {
        s.items = s.items.filter((c) => c._id !== a.payload);
      });
  },
});

export default categorySlice.reducer;

