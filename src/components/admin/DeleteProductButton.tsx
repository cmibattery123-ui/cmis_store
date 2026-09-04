"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function DeleteProductButton({ id, name }: { id: string, name: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const [showModal, setShowModal] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete product");
      }

      toast.success("Product deleted successfully");
      setShowModal(false);
      router.refresh(); // Refresh the server component table
    } catch (error: any) {
      toast.error(error.message || "An error occurred while deleting");
      setIsDeleting(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="text-gray-500 hover:text-red-500 transition-colors"
        title="Delete Product"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-heading font-bold text-white mb-2">Delete Product</h3>
            <p className="text-gray-400 text-sm mb-6">
              Are you sure you want to delete <span className="text-white font-medium">"{name}"</span>? 
              This action cannot be undone and will remove all associated data.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 transition-colors disabled:opacity-50"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
