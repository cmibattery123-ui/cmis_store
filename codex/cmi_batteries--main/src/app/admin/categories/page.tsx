"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit, Trash2, Tag, Loader2, X, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
  _count: { products: number };
}

export default function AdminCategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "", sortOrder: 0, isActive: true });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadCategories() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      setCategories(data.data ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadCategories(); }, []);

  async function save() {
    if (!form.name.trim()) { toast.error("Category name is required"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: editId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editId ? { id: editId, ...form } : form),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? "Failed to save");
        return;
      }
      toast.success(editId ? "Category updated" : "Category created");
      setShowForm(false);
      setEditId(null);
      setForm({ name: "", description: "", sortOrder: 0, isActive: true });
      await loadCategories();
    } finally {
      setSaving(false);
    }
  }

  async function deleteCategory(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Cannot delete"); return; }
      toast.success("Category deleted");
      await loadCategories();
    } finally {
      setDeletingId(null);
    }
  }

  function startEdit(cat: Category) {
    setEditId(cat.id);
    setForm({ name: cat.name, description: cat.description ?? "", sortOrder: cat.sortOrder, isActive: cat.isActive });
    setShowForm(true);
  }

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-white">Categories</h1>
          <p className="text-gray-400 text-sm mt-0.5">{categories.length} categories</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm({ name: "", description: "", sortOrder: 0, isActive: true }); }}
          className="flex items-center gap-2 bg-primary text-black font-heading font-bold px-4 py-2.5 rounded-xl hover:bg-primary/90 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white/5 border border-primary/30 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-bold text-white">{editId ? "Edit Category" : "New Category"}</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1.5">Name *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Inverter Batteries" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1.5">Sort Order</label>
              <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} className={inputCls} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm text-gray-300 mb-1.5">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className={`${inputCls} resize-none`} />
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="isActive" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="accent-primary" />
              <label htmlFor="isActive" className="text-sm text-gray-300">Active</label>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={save} disabled={saving} className="flex items-center gap-2 bg-primary text-black font-bold px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {editId ? "Update" : "Create"} Category
            </button>
            <button onClick={() => setShowForm(false)} className="border border-white/10 text-gray-400 px-5 py-2.5 rounded-xl hover:bg-white/5 transition-colors text-sm">Cancel</button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-gray-500">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />Loading…
          </div>
        ) : categories.length === 0 ? (
          <div className="py-16 text-center">
            <Tag className="w-10 h-10 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500">No categories yet</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 text-xs uppercase tracking-widest border-b border-white/10">
                <th className="text-left p-4">Name</th>
                <th className="text-left p-4">Slug</th>
                <th className="text-left p-4">Products</th>
                <th className="text-left p-4">Sort</th>
                <th className="text-left p-4">Status</th>
                <th className="text-right p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 font-medium text-white">{cat.name}</td>
                  <td className="p-4 font-mono text-gray-400 text-xs">{cat.slug}</td>
                  <td className="p-4 text-gray-400">{cat._count.products}</td>
                  <td className="p-4 text-gray-400">{cat.sortOrder}</td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${cat.isActive ? "bg-green-400/10 text-green-400" : "bg-gray-400/10 text-gray-400"}`}>
                      {cat.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-3">
                      <button onClick={() => startEdit(cat)} className="text-gray-500 hover:text-primary transition-colors"><Edit className="w-4 h-4" /></button>
                      <button
                        onClick={() => deleteCategory(cat.id)}
                        disabled={deletingId === cat.id || cat._count.products > 0}
                        className="text-gray-500 hover:text-red-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title={cat._count.products > 0 ? "Cannot delete — has products" : "Delete"}
                      >
                        {deletingId === cat.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
