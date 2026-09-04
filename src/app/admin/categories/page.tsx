"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Tag, Loader2, X, Check } from "lucide-react";
import { toast } from "sonner";
import { apiUrl } from "@/lib/api";

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
      const res = await fetch(apiUrl("/api/admin/categories"));
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
      const res = await fetch(apiUrl("/api/admin/categories"), {
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
    if (!confirm("Are you sure you want to delete this category?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(apiUrl(`/api/admin/categories?id=${id}`), { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? "Failed to delete");
        return;
      }
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

  const inputCls = "w-full bg-slate-50 dark:bg-[#12131A] border border-slate-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-amber-500 dark:focus:border-primary transition-colors text-sm";

  return (
    <div className="space-y-6 text-slate-900 dark:text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-slate-900 dark:text-white">Categories</h1>
          <p className="text-slate-500 dark:text-gray-400 text-sm mt-0.5">{categories.length} categories</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm({ name: "", description: "", sortOrder: 0, isActive: true }); }}
          className="flex items-center gap-2 bg-primary text-black font-mono font-bold uppercase text-xs px-4 py-2.5 rounded-xl hover:bg-yellow-300 transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white dark:bg-[#0C0D14] border border-amber-500/40 dark:border-primary/30 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-bold text-slate-900 dark:text-white">{editId ? "Edit Category" : "New Category"}</h2>
            <button onClick={() => setShowForm(false)} aria-label="Close category form" className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="category-name" className="block text-xs font-mono font-bold uppercase text-slate-600 dark:text-gray-300 mb-1.5">Name *</label>
              <input id="category-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Inverter Batteries" className={inputCls} />
            </div>
            <div>
              <label htmlFor="category-sort" className="block text-xs font-mono font-bold uppercase text-slate-600 dark:text-gray-300 mb-1.5">Sort Order</label>
              <input id="category-sort" type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} className={inputCls} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="category-desc" className="block text-xs font-mono font-bold uppercase text-slate-600 dark:text-gray-300 mb-1.5">Description</label>
              <textarea id="category-desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className={`${inputCls} resize-none`} />
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="isActive" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="accent-amber-500 dark:accent-primary w-4 h-4" />
              <label htmlFor="isActive" className="text-sm font-medium text-slate-700 dark:text-gray-300 cursor-pointer">Active</label>
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={save} disabled={saving} className="flex items-center gap-2 bg-primary text-black font-mono font-bold text-xs uppercase px-5 py-2.5 rounded-xl hover:bg-yellow-300 transition-colors disabled:opacity-50 cursor-pointer shadow-sm">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {editId ? "Update" : "Create"} Category
            </button>
            <button onClick={() => setShowForm(false)} className="border border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 px-5 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors text-xs font-mono font-bold uppercase cursor-pointer">Cancel</button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-500 dark:text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-600 dark:text-primary" />Loading…
          </div>
        ) : categories.length === 0 ? (
          <div className="py-16 text-center">
            <Tag className="w-10 h-10 text-slate-300 dark:text-gray-700 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-gray-400">No categories yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-500 dark:text-gray-400 text-xs uppercase tracking-widest border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-transparent">
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
                  <tr key={cat.id} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-medium text-slate-900 dark:text-white">{cat.name}</td>
                    <td className="p-4 font-mono text-slate-500 dark:text-gray-400 text-xs">{cat.slug}</td>
                    <td className="p-4 text-slate-600 dark:text-gray-400">{cat._count?.products || 0}</td>
                    <td className="p-4 text-slate-600 dark:text-gray-400">{cat.sortOrder}</td>
                    <td className="p-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${cat.isActive ? "bg-emerald-500/10 text-emerald-600 dark:text-green-400 border border-emerald-500/20" : "bg-slate-500/10 text-slate-600 dark:text-gray-400 border border-slate-500/20"}`}>
                        {cat.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-3">
                        <button onClick={() => startEdit(cat)} className="text-slate-400 dark:text-gray-500 hover:text-amber-600 dark:hover:text-primary transition-colors cursor-pointer p-1"><Edit className="w-4 h-4" /></button>
                        <button
                          onClick={() => deleteCategory(cat.id)}
                          disabled={deletingId === cat.id || (cat._count?.products || 0) > 0}
                          className="text-slate-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer p-1"
                          title={(cat._count?.products || 0) > 0 ? "Cannot delete — has products" : "Delete"}
                        >
                          {deletingId === cat.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
