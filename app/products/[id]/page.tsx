// app/products/[id]/page.tsx

import { notFound } from "next/navigation";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import Order from "@/models/Order";
import "@/models/Category"; // ← just import to register the schema, no usage needed
import ProductDetailClient from "@/components/ProductDetailClient";

interface ReviewData {
  rating: number;
  comment: string;
  submittedAt: string;
  reviewer: string;
  userEmail: string;
}

async function getProduct(id: string) {
  await dbConnect();

  const product = await Product.findById(id)
    .populate("category", "name")
    .lean();

  if (!product) return null;

  const orders = await Order.find({
    "items.productId": id,
    "reviews.productId": id,
    orderStatus: "delivered",
  }).lean();

  const reviews: ReviewData[] = orders
    .map((order: any): ReviewData | null => {
      const review = order.reviews.find(
        (r: any) => r.productId.toString() === id
      );
      if (!review) return null;
      return {
        rating: review.rating,
        comment: review.comment,
        submittedAt: review.submittedAt,
        reviewer: order.shippingAddress.fullName,
        userEmail: order.userEmail || "",
      };
    })
    .filter((r): r is ReviewData => r !== null)
    .sort(
      (a, b) =>
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );

  return { product: JSON.parse(JSON.stringify(product)), reviews };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const data = await getProduct(id);
  if (!data) notFound();

  return <ProductDetailClient product={data.product} reviews={data.reviews} />;
}

