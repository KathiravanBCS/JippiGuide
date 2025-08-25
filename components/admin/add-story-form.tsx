import React, { useState } from 'react';
import Story from '@/types/story';

type AddStoryFormProps = {
  onSuccess: () => void;
  initialData?: Story & { id?: string | number };
  mode?: 'add' | 'edit';
};

const AddStoryForm: React.FC<AddStoryFormProps> = ({ onSuccess, initialData, mode = 'add' }) => {
  const [form, setForm] = useState<Story>(initialData || { title: '', content: '', author: '', image_url: '' });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      let res;
      if (mode === 'edit' && initialData?.id) {
        res = await fetch('/api/stories', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, id: initialData.id }),
        });
      } else {
        res = await fetch('/api/stories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      }
      if (!res.ok) throw new Error(mode === 'edit' ? 'Failed to update story' : 'Failed to add story');
      setMessage(mode === 'edit' ? 'Story updated successfully!' : 'Story added successfully!');
      onSuccess();
      setForm({ title: '', content: '', author: '', image_url: '' });
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto p-4 border rounded">
      <h2 className="text-xl font-bold">{mode === 'edit' ? 'Edit Story' : 'Add Story'}</h2>
      <div>
        <label className="block mb-1">Title</label>
        <input name="title" value={form.title} onChange={handleChange} required className="w-full border px-2 py-1 rounded" />
      </div>
      <div>
        <label className="block mb-1">Content</label>
        <textarea name="content" value={form.content} onChange={handleChange} className="w-full border px-2 py-1 rounded" />
      </div>
      <div>
        <label className="block mb-1">Author</label>
        <input name="author" value={form.author} onChange={handleChange} className="w-full border px-2 py-1 rounded" />
      </div>
      <div>
        <label className="block mb-1">Image URL</label>
        <input name="image_url" value={form.image_url} onChange={handleChange} className="w-full border px-2 py-1 rounded" />
      </div>
      <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">
        {loading ? (mode === 'edit' ? 'Updating...' : 'Adding...') : (mode === 'edit' ? 'Update Story' : 'Add Story')}
      </button>
      {message && <div className="text-green-600">{message}</div>}
      {error && <div className="text-red-600">{error}</div>}
    </form>
  );
};

export default AddStoryForm;
