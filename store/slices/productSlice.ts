// store/slices/productSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

// ─── Types ────────────────────────────────────────────────────

export interface IProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountRate: number;
  discountedPrice: number;
  stock: number;
  images: { url: string; cloudinaryId: string }[];
  imageUrl: string;
  cloudinaryId: string;
  // FIX: category can be a string ID OR a populated object — handle both in the UI
  category: string | { _id: string; name: string; slug: string };
  status: "active" | "draft";
  tags: string[];
  sku: string;
  rating: number;
  ratingCount: number;
  createdAt: string;
  updatedAt: string;
}

// What you send to the API when creating/updating a product
export interface ProductInput {
  name: string;
  description: string;
  price: number;
  discountRate?: number;
  stock?: number;
  category: string;
  status?: "active" | "draft";
  tags?: string[];
  sku?: string;
  imagesBase64?: string[]; // only sent when image is changed
  rating?: number;
  ratingCount?: number;
}

interface ProductState {
  items: IProduct[];
  loading: boolean;
  saving: boolean; // separate flag for form submit spinner
  error: string | null;
}

const initialState: ProductState = {
  items: [],
  loading: false,
  saving: false,
  error: null,
};

// ─── Async Thunks ─────────────────────────────────────────────

// GET /api/products
export const fetchProducts = createAsyncThunk(
  "products/fetchAll",
  async (_, { rejectWithValue }) => {
    const res = await fetch("/api/products");
    if (!res.ok) return rejectWithValue("Failed to fetch products");
    return (await res.json()) as IProduct[];
  }
);

// POST /api/products
export const addProduct = createAsyncThunk(
  "products/add",
  async (data: ProductInput, { rejectWithValue }) => {
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) return rejectWithValue(json.error ?? "Failed to add product");
    return json as IProduct;
  }
);

// PUT /api/products/[id]  — full or partial update
export const updateProduct = createAsyncThunk(
  "products/update",
  async (
    { id, data }: { id: string; data: Partial<ProductInput> },
    { rejectWithValue }
  ) => {
    const res = await fetch(`/api/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) return rejectWithValue(json.error ?? "Failed to update product");
    return json as IProduct;
  }
);

// DELETE /api/products/[id]
export const deleteProduct = createAsyncThunk(
  "products/delete",
  async (id: string, { rejectWithValue }) => {
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) return rejectWithValue(json.error ?? "Failed to delete product");
    // FIX: return the id so the reducer can remove it from the list
    return id;
  }
);

// PUT /api/products/[id]  — quick-edit: stock + discountRate only
export const patchProductInventory = createAsyncThunk(
  "products/patch",
  async (
    { id, stock, discountRate }: { id: string; stock: number; discountRate: number },
    { rejectWithValue }
  ) => {
    const res = await fetch(`/api/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stock, discountRate }),
    });
    const json = await res.json();
    if (!res.ok) return rejectWithValue(json.error ?? "Failed to patch product");
    return json as IProduct;
  }
);

// ─── Slice ────────────────────────────────────────────────────

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // ── fetchProducts ──
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action: PayloadAction<IProduct[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // ── addProduct ──
    builder
      .addCase(addProduct.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(addProduct.fulfilled, (state, action: PayloadAction<IProduct>) => {
        state.saving = false;
        // Prepend so it appears first (API sorts by -createdAt)
        state.items.unshift(action.payload);
      })
      .addCase(addProduct.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      });

    // ── updateProduct ──
    builder
      .addCase(updateProduct.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action: PayloadAction<IProduct>) => {
        state.saving = false;
        // FIX: replace the item in-place so the grid updates immediately
        const idx = state.items.findIndex((p) => p._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      });

    // ── deleteProduct ──
    builder
      .addCase(deleteProduct.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action: PayloadAction<string>) => {
        state.saving = false;
        // FIX: filter by the returned id string
        state.items = state.items.filter((p) => p._id !== action.payload);
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      });

    // ── patchProductInventory ──
    builder
      .addCase(patchProductInventory.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(patchProductInventory.fulfilled, (state, action: PayloadAction<IProduct>) => {
        state.saving = false;
        const idx = state.items.findIndex((p) => p._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(patchProductInventory.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = productSlice.actions;
export default productSlice.reducer;

