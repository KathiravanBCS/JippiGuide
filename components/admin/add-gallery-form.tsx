import React, { useState } from 'react';
import Gallery from '@/types/gallery';


type AddGalleryFormProps = {
  onSuccess: () => void;
  initialData?: Gallery;
  mode?: 'add' | 'edit';
};


const AddGalleryForm: React.FC<AddGalleryFormProps> = ({ onSuccess, initialData, mode = 'add' }) => {
  const [form, setForm] = useState<Gallery>(initialData || { title: '', image_url: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      let res;
      if (mode === 'edit' && initialData?.id) {
        res = await fetch(`/api/gallery`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, id: initialData.id }),
        });
      } else {
        res = await fetch('/api/gallery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      }
      if (!res.ok) throw new Error(mode === 'edit' ? 'Failed to update gallery item' : 'Failed to add gallery item');
      onSuccess();
      setForm({ title: '', image_url: '' });
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto p-4 border rounded">
  <h2 className="text-xl font-bold">{mode === 'edit' ? 'Edit Gallery Item' : 'Add Gallery Item'}</h2>
      <div>
        <label className="block mb-1">Title</label>
        <input name="title" value={form.title} onChange={handleChange} required className="w-full border px-2 py-1 rounded" />
      </div>
      <div>
        <label className="block mb-1">Image URL</label>
        <input name="image_url" value={form.image_url} onChange={handleChange} className="w-full border px-2 py-1 rounded" />
      </div>
      <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">
        {loading ? (mode === 'edit' ? 'Updating...' : 'Adding...') : (mode === 'edit' ? 'Update Gallery Item' : 'Add Gallery Item')}
      </button>
  {/* Success message handled by parent via onSuccess */}
      {error && <div className="text-red-600">{error}</div>}
    </form>
  );
};

export default AddGalleryForm;
