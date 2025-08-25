
import { useState } from 'react';
import AddDestinationForm from './add-destination-form';

interface Destination {
  id: string | number;
  name: string;
  description: string;
  image_url?: string;
}

interface DestinationsTableProps {
  data: Destination[];
  onRefresh: () => void;
}

const DestinationsTable = ({ data, onRefresh }: DestinationsTableProps) => {
  const [loading, setLoading] = useState(false);
  const [editItem, setEditItem] = useState<Destination | null>(null);

  const handleDelete = async (id: string | number) => {
    if (!confirm('Are you sure you want to delete this destination?')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/destinations`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('Failed to delete destination');
      onRefresh();
    } catch (error) {
      console.error('Error deleting destination:', error);
      alert('Error deleting destination');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: Destination) => {
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
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Image
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((destination) => (
              <tr key={destination.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{destination.name}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500 max-w-xs truncate">{destination.description}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {destination.image_url && (
                    <div className="text-sm text-blue-500 truncate max-w-xs">
                      <a href={destination.image_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        View Image
                      </a>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button
                    onClick={() => handleEdit(destination)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >Edit</button>
                  <button
                    onClick={() => handleDelete(destination.id)}
                    disabled={loading}
                    className="text-red-600 hover:text-red-900 disabled:opacity-50"
                  >Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No destinations found. Add your first destination!
          </div>
        )}
      </div>
      {editItem && (
        <div className="fixed inset-0  bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <AddDestinationForm
              onSuccess={handleEditSuccess}
              initialData={{
                ...editItem,
                image_url: editItem?.image_url ?? ''
              }}
              mode="edit"
            />
            <button className="mt-4 px-4 py-2 bg-gray-300 rounded" onClick={() => setEditItem(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DestinationsTable;