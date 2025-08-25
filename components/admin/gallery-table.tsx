import { useState } from 'react';

import Gallery from '../../types/gallery';

interface GalleryTableProps {
  data: Gallery[];
  onRefresh: () => void;
  onEdit?: (gallery: Gallery) => void;
}


import AddGalleryForm from './add-gallery-form';

const GalleryTable = ({ data, onRefresh }: GalleryTableProps) => {
  const [loading, setLoading] = useState(false);
  const [editItem, setEditItem] = useState<Gallery | null>(null);

  const handleDelete = async (id: string | number) => {
    if (!confirm('Are you sure you want to delete this gallery item?')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/gallery/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete gallery item');
      onRefresh();
    } catch (error) {
      console.error('Error deleting gallery item:', error);
      alert('Error deleting gallery item');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: Gallery) => {
    setEditItem(item);
  };

  const handleEditSuccess = async () => {
    setEditItem(null);
    onRefresh();
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((gallery) => (
              <tr key={gallery.id}>
                <td className="px-6 py-4 whitespace-nowrap">{gallery.title}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {gallery.image_url && (
                    <a href={gallery.image_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">View Image</a>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button
                    onClick={() => handleEdit(gallery)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >Edit</button>
                  <button
                    onClick={() => gallery.id !== undefined && handleDelete(gallery.id)}
                    disabled={loading || gallery.id === undefined}
                    className="text-red-600 hover:text-red-900 disabled:opacity-50"
                  >Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.length === 0 && (
          <div className="text-center py-8 text-gray-500">No gallery items found. Add your first gallery item!</div>
        )}
      </div>
      {editItem && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <AddGalleryForm
              onSuccess={handleEditSuccess}
              initialData={editItem}
              mode="edit"
            />
            <button className="mt-4 px-4 py-2 bg-gray-300 rounded" onClick={() => setEditItem(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryTable;
