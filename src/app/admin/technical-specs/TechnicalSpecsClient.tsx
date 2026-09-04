"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { apiUrl } from "@/lib/api";

const SpecsReorderList = dynamic(
  () => import("./SpecsReorderList"),
  {
    ssr: false,
    loading: () => (
      <div className="p-8 flex flex-col items-center justify-center text-slate-400 dark:text-gray-500 gap-2 font-mono text-xs">
        <Loader2 className="w-5 h-5 animate-spin text-amber-500 dark:text-primary" />
        <span>Loading specifications…</span>
      </div>
    ),
  }
);

type Spec = {
  id: string;
  model: string;
  volts: string;
  capacity: string;
  length: string;
  breadth: string;
  height: string;
  weight: string;
  sortOrder: number;
};

export default function TechnicalSpecsClient({ initialSpecs }: { initialSpecs: Spec[] }) {
  const router = useRouter();
  const [specs, setSpecs] = useState<Spec[]>(initialSpecs);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [specToDelete, setSpecToDelete] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editingSpec, setEditingSpec] = useState<Spec | null>(null);
  
  const [formData, setFormData] = useState({
    model: "",
    volts: "12V",
    capacity: "--",
    length: "--",
    breadth: "--",
    height: "--",
    weight: "--",
  });

  const handleOpenModal = (spec?: Spec) => {
    if (spec) {
      setEditingSpec(spec);
      setFormData({
        model: spec.model,
        volts: spec.volts,
        capacity: spec.capacity,
        length: spec.length,
        breadth: spec.breadth,
        height: spec.height,
        weight: spec.weight,
      });
    } else {
      setEditingSpec(null);
      setFormData({
        model: "",
        volts: "12V",
        capacity: "--",
        length: "--",
        breadth: "--",
        height: "--",
        weight: "--",
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const url = editingSpec ? `/api/admin/technical-specs/${editingSpec.id}` : "/api/admin/technical-specs";
      const method = editingSpec ? "PUT" : "POST";
      
      const res = await fetch(apiUrl(url), {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          sortOrder: editingSpec ? editingSpec.sortOrder : specs.length,
        }),
      });

      if (!res.ok) throw new Error("Failed to save specification");
      
      toast.success(editingSpec ? "Specification updated" : "Specification created");
      setIsModalOpen(false);
      
      // We can rely on router.refresh() to update the server component data,
      // but let's also update local state just in case.
      router.refresh();
      
      // Simple local state update
      const data = await res.json();
      if (editingSpec) {
        setSpecs(specs.map(s => s.id === editingSpec.id ? data.data.spec : s));
      } else {
        setSpecs([...specs, data.data.spec]);
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while saving");
    } finally {
      setIsSaving(false);
    }
  };

  const requestDelete = (id: string) => {
    setSpecToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!specToDelete) return;
    
    setIsSaving(true);
    try {
      const res = await fetch(apiUrl(`/api/admin/technical-specs/${specToDelete}`), { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      
      toast.success("Specification deleted");
      setSpecs(specs.filter(s => s.id !== specToDelete));
      router.refresh();
      setIsDeleteModalOpen(false);
      setSpecToDelete(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete specification");
    } finally {
      setIsSaving(false);
    }
  };

  const onDragEnd = async (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(specs);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update sortOrder based on new index
    const updatedItems = items.map((item, index) => ({
      ...item,
      sortOrder: index,
    }));

    setSpecs(updatedItems);

    // Fire off a single batch reorder request
    try {
      const payload = updatedItems.map((item) => ({
        id: item.id,
        sortOrder: item.sortOrder,
      }));

      const res = await fetch(apiUrl("/api/admin/technical-specs"), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: payload }),
      });

      if (!res.ok) throw new Error("Failed to save new order");
      toast.success("Order updated");
      router.refresh();
    } catch (error) {
      console.error("Failed to save new order", error);
      toast.error("Failed to save new order");
      setSpecs(specs); // Revert to previous state
    }
  };

  return (
    <div className="space-y-6 text-slate-900 dark:text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-slate-900 dark:text-white">Technical Specifications</h1>
          <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">Manage global specification data for products.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-primary text-black px-4 py-2 rounded-xl font-mono font-bold uppercase text-xs flex items-center gap-2 hover:bg-yellow-300 transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Specification
        </button>
      </div>

      <div className="bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden">
        <SpecsReorderList
          specs={specs}
          onDragEnd={onDragEnd}
          onEdit={handleOpenModal}
          onDelete={requestDelete}
        />
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-white/10 shrink-0">
              <h2 className="text-xl font-bold text-white">
                {editingSpec ? "Edit Specification" : "Add Specification"}
              </h2>
            </div>
            
            <form onSubmit={handleSave} className="flex flex-col overflow-y-auto">
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-gray-500">Model Name</label>
                  <input
                    required
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    placeholder="e.g. 12V : Z4 / 4LB"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-gray-500">Voltage</label>
                    <input
                      required
                      type="text"
                      value={formData.volts}
                      onChange={(e) => setFormData({ ...formData, volts: e.target.value })}
                      placeholder="12V"
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-gray-500">Capacity</label>
                    <input
                      required
                      type="text"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                      placeholder="--"
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-gray-500">Length (L)</label>
                    <input
                      required
                      type="text"
                      value={formData.length}
                      onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                      placeholder="--"
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-gray-500">Breadth (B)</label>
                    <input
                      required
                      type="text"
                      value={formData.breadth}
                      onChange={(e) => setFormData({ ...formData, breadth: e.target.value })}
                      placeholder="--"
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-gray-500">Height (H)</label>
                    <input
                      required
                      type="text"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                      placeholder="--"
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-gray-500">Weight (KG)</label>
                  <input
                    required
                    type="text"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    placeholder="--"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              
              <div className="p-6 border-t border-white/10 flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-primary text-black px-6 py-2 rounded-xl font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Specification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white">Delete Specification</h2>
              <p className="text-gray-400 text-sm">
                Are you sure you want to delete this specification? This action cannot be undone.
              </p>
            </div>
            <div className="p-4 border-t border-white/10 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSpecToDelete(null);
                }}
                className="flex-1 px-4 py-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors font-medium"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isSaving}
                className="flex-1 bg-red-500 text-white px-4 py-2 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
