"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, GripVertical, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

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
      
      const res = await fetch(url, {
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
      const res = await fetch(`/api/admin/technical-specs/${specToDelete}`, { method: "DELETE" });
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

    // Fire off updates sequentially or concurrently
    try {
      await Promise.all(
        updatedItems.map((item) =>
          fetch(`/api/admin/technical-specs/${item.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sortOrder: item.sortOrder }),
          })
        )
      );
      toast.success("Order updated");
      router.refresh();
    } catch (error) {
      console.error("Failed to save new order", error);
      toast.error("Failed to save new order");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-white">Technical Specifications</h1>
          <p className="text-sm text-gray-400 mt-1">Manage global specification data for products.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-primary text-black px-4 py-2 rounded-xl font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Specification
        </button>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="specs-list">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="divide-y divide-white/5"
              >
                {/* Header row */}
                <div className="grid grid-cols-12 gap-4 p-4 text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-white/10">
                  <div className="col-span-1"></div>
                  <div className="col-span-3">Model</div>
                  <div className="col-span-2">Volts / Cap</div>
                  <div className="col-span-3">Dimensions (L×B×H)</div>
                  <div className="col-span-2">Weight</div>
                  <div className="col-span-1 text-right">Actions</div>
                </div>

                {specs.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    No specifications added yet.
                  </div>
                ) : (
                  specs.map((spec, index) => (
                    <Draggable key={spec.id} draggableId={spec.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="grid grid-cols-12 gap-4 p-4 items-center bg-[#0d0d0d] hover:bg-white/[0.02] transition-colors group"
                        >
                          <div
                            {...provided.dragHandleProps}
                            className="col-span-1 text-gray-600 hover:text-white transition-colors cursor-grab active:cursor-grabbing"
                          >
                            <GripVertical className="w-5 h-5" />
                          </div>
                          <div className="col-span-3 font-medium text-white">{spec.model}</div>
                          <div className="col-span-2 text-gray-400">
                            {spec.volts} / {spec.capacity}
                          </div>
                          <div className="col-span-3 text-gray-400 text-sm font-mono">
                            {spec.length} × {spec.breadth} × {spec.height}
                          </div>
                          <div className="col-span-2 text-white font-medium">{spec.weight}</div>
                          <div className="col-span-1 flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenModal(spec)}
                              className="text-gray-500 hover:text-primary transition-colors p-1"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => requestDelete(spec.id)}
                              className="text-gray-500 hover:text-red-500 transition-colors p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
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
