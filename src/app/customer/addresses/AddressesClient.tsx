"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Plus, Home, Building2, Trash2, Edit, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

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

export default function AddressesClient({ initialAddresses }: { initialAddresses: Address[] }) {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
      const res = await fetch("/api/customer/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to save address");
      
      const savedAddress = await res.json();
      
      if (savedAddress.isDefault) {
        setAddresses(prev => prev.map(a => ({ ...a, isDefault: false })).concat(savedAddress));
      } else {
        setAddresses([...addresses, savedAddress]);
      }
      
      toast.success("Address saved successfully!");
      setIsModalOpen(false);
      router.refresh();
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
      const res = await fetch(`/api/customer/addresses/${id}`, { method: "DELETE" });
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
          <h1 className="text-2xl font-heading font-bold text-white">Saved Addresses</h1>
          <p className="text-gray-400 text-sm mt-1">Manage your shipping and billing addresses</p>
        </div>
        <button 
          onClick={handleOpenModal}
          className="flex items-center gap-2 bg-primary text-black font-heading font-bold px-4 py-2 rounded-xl hover:bg-primary/90 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Address
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-heading font-bold text-white mb-2">No addresses saved</h3>
          <p className="text-gray-400 text-sm">Add an address to make checkout faster and easier.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <div key={address.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 relative group hover:border-primary/50 transition-colors">
              {address.isDefault && (
                <span className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider bg-primary/20 text-primary px-2 py-1 rounded">
                  Default
                </span>
              )}
              
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center shrink-0">
                  {address.type === "SHIPPING" ? (
                    <Home className="w-5 h-5 text-gray-400" />
                  ) : (
                    <Building2 className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-white font-medium flex items-center gap-2">
                    {address.name}
                  </h3>
                  <p className="text-gray-400 text-sm mt-1">{address.phone}</p>
                </div>
              </div>

              <div className="text-gray-400 text-sm space-y-1 mb-6">
                <p>{address.line1}</p>
                {address.line2 && <p>{address.line2}</p>}
                <p>
                  {address.city}, {address.state} {address.pincode}
                </p>
                <p>{address.country}</p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                <button 
                  onClick={() => handleDelete(address.id)}
                  disabled={deletingId === address.id}
                  className="text-sm font-medium text-gray-300 hover:text-red-400 flex items-center gap-2 transition-colors ml-auto disabled:opacity-50"
                >
                  {deletingId === address.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-heading font-bold text-white mb-6">Add New Address</h2>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
                  <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1">Address Line 1</label>
                  <input required type="text" value={formData.line1} onChange={e => setFormData({...formData, line1: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1">Address Line 2 (Optional)</label>
                  <input type="text" value={formData.line2} onChange={e => setFormData({...formData, line2: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-300 mb-1">City</label>
                  <input required type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-300 mb-1">State</label>
                  <input required type="text" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-300 mb-1">Pincode</label>
                  <input required type="text" value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-300 mb-1">Type</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white">
                    <option value="SHIPPING">Shipping</option>
                    <option value="BILLING">Billing</option>
                  </select>
                </div>
                <div className="col-span-2 flex items-center gap-2 mt-2">
                  <input type="checkbox" id="isDefault" checked={formData.isDefault} onChange={e => setFormData({...formData, isDefault: e.target.checked})} className="w-4 h-4 rounded bg-white/5 border-white/10 text-primary focus:ring-primary focus:ring-offset-black" />
                  <label htmlFor="isDefault" className="text-sm font-medium text-gray-300">Set as default address</label>
                </div>
              </div>
              <button 
                type="submit" 
                disabled={isSaving}
                className="w-full mt-6 bg-primary text-black font-heading font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
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
