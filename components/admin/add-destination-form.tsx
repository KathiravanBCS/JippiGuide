// components/admin/add-destination-form.jsx
import React, { useState } from 'react';

type AddDestinationFormProps = {
  onSuccess: () => void;
  initialData?: FormState & { id?: string | number };
  mode?: 'add' | 'edit';
};

type FormState = {
  name: string;
  description: string;
  image_url: string;
};

const AddDestinationForm: React.FC<AddDestinationFormProps> = ({ onSuccess, initialData, mode = 'add' }) => {
  const [form, setForm] = useState<FormState>(initialData || { name: '', description: '', image_url: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      let res;
      if (mode === 'edit' && initialData?.id) {
        res = await fetch('/api/destinations', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, id: initialData.id }),
        });
      } else {
        res = await fetch('/api/destinations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      }
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || (mode === 'edit' ? 'Failed to update destination' : 'Failed to add destination'));
      }
      onSuccess();
      setForm({ name: '', description: '', image_url: '' });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold">{mode === 'edit' ? 'Edit Destination' : 'Add Destination'}</h2>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
        <input
          name="image_url"
          value={form.image_url}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={() => onSuccess()}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? (mode === 'edit' ? 'Updating...' : 'Adding...') : (mode === 'edit' ? 'Update Destination' : 'Add Destination')}
        </button>
      </div>
    </form>
  );
};

export default AddDestinationForm;