
import { useState } from 'react';
import AddStoryForm from './add-story-form';

import type Story from 'd:/tourist-guide/types/story';

interface StoriesTableProps {
  data: Story[];
  onRefresh: () => void;
}

const StoriesTable = ({ data, onRefresh }: StoriesTableProps) => {
  const [loading, setLoading] = useState(false);
  const [editItem, setEditItem] = useState<Story | null>(null);

  const handleDelete = async (id: string | number) => {
    if (!confirm('Are you sure you want to delete this story?')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/stories`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('Failed to delete story');
      onRefresh();
    } catch (error) {
      console.error('Error deleting story:', error);
      alert('Error deleting story');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: Story) => {
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Content</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((story) => (
              <tr key={story.id}>
                <td className="px-6 py-4 whitespace-nowrap">{story.title}</td>
                <td className="px-6 py-4 max-w-xs truncate">{story.content}</td>
                <td className="px-6 py-4 whitespace-nowrap">{story.author}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {story.image_url && (
                    <a href={story.image_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">View Image</a>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button
                    onClick={() => handleEdit(story)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >Edit</button>
                  <button
                    onClick={() => story.id !== undefined && handleDelete(story.id)}
                    disabled={loading || story.id === undefined}
                    className="text-red-600 hover:text-red-900 disabled:opacity-50"
                  >Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.length === 0 && (
          <div className="text-center py-8 text-gray-500">No stories found. Add your first story!</div>
        )}
      </div>
      {editItem && (
        <div className="fixed inset-0 bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <AddStoryForm
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
}

export default StoriesTable;
