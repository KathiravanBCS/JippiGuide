
import { useState } from 'react';
import AddPackageForm from './add-package-form';

interface Package {
  id?: string;
  name: string;
  price?: number;
  description?: string;
  image_url?: string;
}

interface PackagesTableProps {
  data: Package[];
  onRefresh: () => void;
}

const PackagesTable = ({ data, onRefresh }: PackagesTableProps) => {
  const [loading, setLoading] = useState(false);
  const [editItem, setEditItem] = useState<Package | null>(null);

  const handleDelete = async (id: string | number) => {
    if (!confirm('Are you sure you want to delete this package?')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/packages`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('Failed to delete package');
      onRefresh();
    } catch (error) {
      console.error('Error deleting package:', error);
      alert('Error deleting package');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: Package) => {
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((pkg) => (
              <tr key={pkg.id}>
                <td className="px-6 py-4 whitespace-nowrap">{pkg.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{pkg.price}</td>
                <td className="px-6 py-4 max-w-xs truncate">{pkg.description}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {pkg.image_url && (
                    <a href={pkg.image_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">View Image</a>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button
                    onClick={() => handleEdit(pkg)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >Edit</button>
                  <button
                    onClick={() => pkg.id !== undefined && handleDelete(pkg.id)}
                    disabled={loading || pkg.id === undefined}
                    className="text-red-600 hover:text-red-900 disabled:opacity-50"
                  >Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.length === 0 && (
          <div className="text-center py-8 text-gray-500">No packages found. Add your first package!</div>
        )}
      </div>
      {editItem && (
        <div className="fixed inset-0  bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <AddPackageForm
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

export default PackagesTable;
