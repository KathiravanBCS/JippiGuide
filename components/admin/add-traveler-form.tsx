import React, { useState } from 'react';
import Traveler from '@/types/traveler';

type AddTravelerFormProps = {
  onSuccess: () => void;
  initialData?: Traveler & { id?: string | number };
  mode?: 'add' | 'edit';
};

const AddTravelerForm: React.FC<AddTravelerFormProps> = ({ onSuccess, initialData, mode = 'add' }) => {
  const [form, setForm] = useState<Traveler>(initialData || { name: '', bio: '', avatar_url: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      let res;
      if (mode === 'edit' && initialData?.id) {
        res = await fetch('/api/travelers', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, id: initialData.id }),
        });
      } else {
        res = await fetch('/api/travelers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      }
      if (!res.ok) throw new Error(mode === 'edit' ? 'Failed to update traveler' : 'Failed to add traveler');
      onSuccess();
      setForm({ name: '', bio: '', avatar_url: '' });
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto p-4 border rounded">
      <h2 className="text-xl font-bold">{mode === 'edit' ? 'Edit Traveler' : 'Add Traveler'}</h2>
      <div>
        <label className="block mb-1">Name</label>
        <input name="name" value={form.name} onChange={handleChange} required className="w-full border px-2 py-1 rounded" />
      </div>
      <div>
        <label className="block mb-1">Bio</label>
        <textarea name="bio" value={form.bio} onChange={handleChange} className="w-full border px-2 py-1 rounded" />
      </div>
      <div>
        <label className="block mb-1">Avatar URL</label>
        <input name="avatar_url" value={form.avatar_url} onChange={handleChange} className="w-full border px-2 py-1 rounded" />
      </div>
      <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">
        {loading ? (mode === 'edit' ? 'Updating...' : 'Adding...') : (mode === 'edit' ? 'Update Traveler' : 'Add Traveler')}
      </button>
      {error && <div className="text-red-600">{error}</div>}
    </form>
  );
};

export default AddTravelerForm;
