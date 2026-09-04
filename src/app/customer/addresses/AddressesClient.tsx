"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Plus, Home, Building2, Trash2, Edit, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiUrl } from "@/lib/api";

type Address = {
  id: string;
  type: string;
  name: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
};

export default function AddressesClient({ initialAddresses }: { initialAddresses?: Address[] }) {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses || []);
  const [loading, setLoading] = useState(!initialAddresses || initialAddresses.length === 0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadAddresses() {
      try {
        const res = await fetch(apiUrl("/api/customer/addresses"));
        if (res.ok) {
          const json = await res.json();
          const list = json?.data?.addresses || json?.addresses || [];
          if (isMounted) setAddresses(list);
        }
      } catch (err) {
        console.error("Failed to load addresses", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadAddresses();
    return () => {
      isMounted = false;
    };
  }, []);

  // Form State
  const [formData, setFormData] = useState({
    name: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "", type: "SHIPPING", isDefault: false
  });

  const handleOpenModal = () => {
    setFormData({ name: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "", type: "SHIPPING", isDefault: false });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch(apiUrl("/api/customer/addresses"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to save address");
      
      const json = await res.json();
      const savedAddress = json?.data || json;
      
      if (savedAddress?.isDefault) {
        setAddresses(prev => prev.map(a => ({ ...a, isDefault: false })).concat(savedAddress));
      } else if (savedAddress) {
        setAddresses([...addresses, savedAddress]);
      }
      
      toast.success("Address saved successfully!");
      setIsModalOpen(false);
    } catch (error) {
      toast.error("Failed to save address");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(apiUrl(`/api/customer/addresses/${id}`), { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete address");
      
      setAddresses(addresses.filter((a) => a.id !== id));
      toast.success("Address deleted");
      router.refresh();
    } catch (error) {
      toast.error("Failed to delete address");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Saved Addresses</h1>
          <p className="text-slate-600 dark:text-gray-400 text-sm mt-1 font-normal">Manage your shipping and billing addresses</p>
        </div>
        <button 
          onClick={handleOpenModal}
          className="flex items-center gap-2 bg-primary text-black font-black uppercase tracking-wider text-xs px-5 py-3 rounded-2xl hover:bg-yellow-300 transition-all shadow-[0_0_15px_rgba(250,255,0,0.25)]"
        >
          <Plus className="w-4 h-4" />
          Add Address
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/15 rounded-3xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-slate-100 dark:bg-[#161722] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-slate-400 dark:text-gray-500" />
          </div>
          <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white mb-2">No addresses saved</h3>
          <p className="text-slate-600 dark:text-gray-300 text-sm font-normal">Add an address to make checkout faster and easier.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((address) => (
            <div key={address.id} className="bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/15 rounded-3xl p-6 relative group hover:border-amber-500/40 dark:hover:border-primary/40 transition-all shadow-sm">
              {address.isDefault && (
                <span className="absolute top-5 right-5 text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/10 dark:bg-primary/20 text-amber-600 dark:text-primary px-2.5 py-1 rounded-full border border-amber-500/20 dark:border-primary/20">
                  Default
                </span>
              )}
              
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 bg-slate-100 dark:bg-[#161722] rounded-xl flex items-center justify-center shrink-0">
                  {address.type === "SHIPPING" ? (
                    <Home className="w-5 h-5 text-amber-600 dark:text-primary" />
                  ) : (
                    <Building2 className="w-5 h-5 text-amber-600 dark:text-primary" />
                  )}
                </div>
                <div>
                  <h3 className="text-slate-900 dark:text-white font-bold text-base flex items-center gap-2">
                    {address.name}
                  </h3>
                  <p className="text-slate-500 dark:text-gray-300 text-xs font-mono mt-0.5">{address.phone}</p>
                </div>
              </div>

              <div className="text-slate-600 dark:text-gray-300 text-sm space-y-1 mb-6 font-normal">
                <p>{address.line1}</p>
                {address.line2 && <p>{address.line2}</p>}
                <p>
                  {address.city}, {address.state} {address.pincode}
                </p>
                <p>{address.country}</p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-white/10">
                <button 
                  onClick={() => handleDelete(address.id)}
                  disabled={deletingId === address.id}
                  className="text-xs font-mono font-bold uppercase text-slate-500 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 flex items-center gap-2 transition-colors ml-auto disabled:opacity-50 cursor-pointer"
                >
                  {deletingId === address.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/15 rounded-3xl p-6 md:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto relative shadow-2xl text-slate-900 dark:text-white">
            <button 
              onClick={() => setIsModalOpen(false)}
              aria-label="Close address modal"
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white mb-6">Add New Address</h2>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label htmlFor="address-name" className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-1.5">Name</label>
                  <input id="address-name" required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 dark:bg-[#12131A] border border-slate-300 dark:border-white/15 rounded-2xl px-4 py-2.5 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-[#181924] text-sm" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label htmlFor="address-phone" className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-1.5">Phone</label>
                  <input id="address-phone" required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-slate-50 dark:bg-[#12131A] border border-slate-300 dark:border-white/15 rounded-2xl px-4 py-2.5 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-[#181924] text-sm" />
                </div>
                <div className="col-span-2">
                  <label htmlFor="address-line1" className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-1.5">Address Line 1</label>
                  <input id="address-line1" required type="text" value={formData.line1} onChange={e => setFormData({...formData, line1: e.target.value})} className="w-full bg-slate-50 dark:bg-[#12131A] border border-slate-300 dark:border-white/15 rounded-2xl px-4 py-2.5 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-[#181924] text-sm" />
                </div>
                <div className="col-span-2">
                  <label htmlFor="address-line2" className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-1.5">Address Line 2 (Optional)</label>
                  <input id="address-line2" type="text" value={formData.line2} onChange={e => setFormData({...formData, line2: e.target.value})} className="w-full bg-slate-50 dark:bg-[#12131A] border border-slate-300 dark:border-white/15 rounded-2xl px-4 py-2.5 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-[#181924] text-sm" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label htmlFor="address-city" className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-1.5">City</label>
                  <input id="address-city" required type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full bg-slate-50 dark:bg-[#12131A] border border-slate-300 dark:border-white/15 rounded-2xl px-4 py-2.5 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-[#181924] text-sm" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label htmlFor="address-state" className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-1.5">State</label>
                  <input id="address-state" required type="text" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className="w-full bg-slate-50 dark:bg-[#12131A] border border-slate-300 dark:border-white/15 rounded-2xl px-4 py-2.5 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-[#181924] text-sm" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label htmlFor="address-pincode" className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-1.5">Pincode</label>
                  <input id="address-pincode" required type="text" value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value})} className="w-full bg-slate-50 dark:bg-[#12131A] border border-slate-300 dark:border-white/15 rounded-2xl px-4 py-2.5 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-[#181924] text-sm" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label htmlFor="address-type" className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-1.5">Type</label>
                  <select id="address-type" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-slate-50 dark:bg-[#12131A] border border-slate-300 dark:border-white/15 rounded-2xl px-4 py-2.5 text-slate-900 dark:text-white text-sm cursor-pointer">
                    <option value="SHIPPING" className="bg-white dark:bg-[#12131A]">Shipping</option>
                    <option value="BILLING" className="bg-white dark:bg-[#12131A]">Billing</option>
                  </select>
                </div>
                <div className="col-span-2 flex items-center gap-2 mt-2">
                  <input type="checkbox" id="isDefault" checked={formData.isDefault} onChange={e => setFormData({...formData, isDefault: e.target.checked})} className="w-4 h-4 rounded bg-slate-100 dark:bg-[#12131A] border-slate-300 dark:border-white/15 text-amber-500 dark:text-primary focus:ring-amber-500" />
                  <label htmlFor="isDefault" className="text-xs font-mono text-slate-700 dark:text-gray-300">Set as default address</label>
                </div>
              </div>
              <button 
                type="submit" 
                disabled={isSaving}
                className="w-full mt-6 bg-primary text-black font-black uppercase tracking-wider text-xs py-4 rounded-2xl hover:bg-yellow-300 transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(250,255,0,0.25)] cursor-pointer"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Address"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
