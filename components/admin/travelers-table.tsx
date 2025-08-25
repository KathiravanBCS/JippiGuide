
import { useState } from 'react';
import AddTravelerForm from './add-traveler-form';

interface Traveler {
  id: string | number;
  name: string;
  bio?: string;
  avatar_url?: string;
}

interface TravelersTableProps {
  data: Traveler[];
  onRefresh: () => void;
}

const TravelersTable = ({ data, onRefresh }: TravelersTableProps) => {
  const [loading, setLoading] = useState(false);
  const [editItem, setEditItem] = useState<Traveler | null>(null);

  const handleDelete = async (id: string | number) => {
    if (!confirm('Are you sure you want to delete this traveler?')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/travelers`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('Failed to delete traveler');
      onRefresh();
    } catch (error) {
      console.error('Error deleting traveler:', error);
      alert('Error deleting traveler');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: Traveler) => {
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bio</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avatar</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((traveler) => (
              <tr key={traveler.id}>
                <td className="px-6 py-4 whitespace-nowrap">{traveler.name}</td>
                <td className="px-6 py-4 max-w-xs truncate">{traveler.bio}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {traveler.avatar_url && (
                    <a href={traveler.avatar_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">View Avatar</a>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button
                    onClick={() => handleEdit(traveler)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >Edit</button>
                  <button
                    onClick={() => handleDelete(traveler.id)}
                    disabled={loading}
                    className="text-red-600 hover:text-red-900 disabled:opacity-50"
                  >Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.length === 0 && (
          <div className="text-center py-8 text-gray-500">No travelers found. Add your first traveler!</div>
        )}
      </div>
      {editItem && (
        <div className="fixed inset-0 bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <AddTravelerForm
              onSuccess={handleEditSuccess}
              initialData={editItem ? { ...editItem, id: typeof editItem.id === 'string' ? editItem.id : String(editItem.id) } : undefined}
              mode="edit"
            />
            <button className="mt-4 px-4 py-2 bg-gray-300 rounded" onClick={() => setEditItem(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TravelersTable;
