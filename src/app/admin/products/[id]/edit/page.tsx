import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    db.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        specs: { orderBy: { sortOrder: "asc" } },
      },
    }),
    db.category.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  if (!product) notFound();

  const productForForm = {
    id: product.id,
    name: product.name,
    sku: product.sku,
    slug: product.slug,
    description: product.description,
    shortDesc: product.shortDesc ?? undefined,
    price: Number(product.price),
    dealerPrice: Number(product.dealerPrice),
    taxRate: Number(product.taxRate),
    categoryId: product.categoryId,
    warrantyMonths: product.warrantyMonths,
    datasheetUrl: product.datasheetUrl ?? "",
    metaTitle: product.metaTitle ?? "",
    metaDesc: product.metaDesc ?? "",
    isActive: product.isActive,
    isFeatured: product.isFeatured,
    images: product.images.map((img, i) => ({ 
      url: img.url, 
      isPrimary: img.isPrimary,
      publicId: img.publicId,
      sortOrder: img.sortOrder ?? i,
    })),
    specs: product.specs.map((s) => ({
      label: s.label,
      value: s.value,
      unit: s.unit ?? "",
      sortOrder: s.sortOrder,
    })),
  };

  return <ProductForm categories={categories} product={productForForm} isEdit />;
}
