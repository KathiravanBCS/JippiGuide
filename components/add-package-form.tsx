import React, { useState } from 'react';
import Package from '../types/package';

const AddPackageForm: React.FC = () => {
  const [form, setForm] = useState<Package>({ name: '', price: undefined, description: '', image_url: '' });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === 'price' ? Number(value) : value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      // Replace with your API endpoint
      const res = await fetch('/api/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to add package');
      setMessage('Package added successfully!');
      setForm({ name: '', price: undefined, description: '', image_url: '' });
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto p-4 border rounded">
      <h2 className="text-xl font-bold">Add Package</h2>
      <div>
        <label className="block mb-1">Name</label>
        <input name="name" value={form.name} onChange={handleChange} required className="w-full border px-2 py-1 rounded" />
      </div>
      <div>
        <label className="block mb-1">Price</label>
        <input name="price" type="number" value={form.price ?? ''} onChange={handleChange} className="w-full border px-2 py-1 rounded" />
      </div>
      <div>
        <label className="block mb-1">Description</label>
        <textarea name="description" value={form.description} onChange={handleChange} className="w-full border px-2 py-1 rounded" />
      </div>
      <div>
        <label className="block mb-1">Image URL</label>
        <input name="image_url" value={form.image_url} onChange={handleChange} className="w-full border px-2 py-1 rounded" />
      </div>
      <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">
        {loading ? 'Adding...' : 'Add Package'}
      </button>
      {message && <div className="text-green-600">{message}</div>}
      {error && <div className="text-red-600">{error}</div>}
    </form>
  );
};

export default AddPackageForm;
