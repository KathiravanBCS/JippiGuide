'use client';

import { SignedIn, SignedOut, SignInButton, useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import AddDestinationForm from '@/components/admin/add-destination-form';
import AddGalleryForm from '@/components/admin/add-gallery-form';
import AddPackageForm from '@/components/admin/add-package-form';
import AddStoryForm from '@/components/admin/add-story-form';
import AddTravelerForm from '@/components/admin/add-traveler-form';
import DestinationsTable from '@/components/admin/destinations-table';
import GalleryTable from '@/components/admin/gallery-table';
import PackagesTable from '@/components/admin/packages-table';
import StoriesTable from '@/components/admin/stories-table';
import TravelersTable from '@/components/admin/travelers-table';

export default function AdminDashboard() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showModal, setShowModal] = useState(false);
  const [data, setData] = useState({
    destinations: [],
    packages: [],
    stories: [],
    gallery: [],
    travelers: []
  });
  const isAdmin = user?.publicMetadata?.role === 'admin';

  // Fetch data based on active tab
  useEffect(() => {
    if (
      isAdmin &&
      (activeTab === 'destinations' ||
        activeTab === 'packages' ||
        activeTab === 'stories' ||
        activeTab === 'gallery' ||
        activeTab === 'travelers')
    ) {
      fetchData(activeTab);
    }
  }, [activeTab, isAdmin]);

  interface Destination { [key: string]: any }
  interface Package { [key: string]: any }
  interface Story { [key: string]: any }
  interface GalleryItem { [key: string]: any }
  interface Traveler { [key: string]: any }

  // Removed unused AdminData interface

  type TabType = 'dashboard' | 'destinations' | 'packages' | 'stories' | 'gallery' | 'travelers';

  const fetchData = async (type: Exclude<TabType, 'dashboard'>): Promise<void> => {
    try {
      const res = await fetch(`/api/${type}`);
      if (res.ok) {
        const result: Destination[] | Package[] | Story[] | GalleryItem[] | Traveler[] = await res.json();
        setData(prev => ({
          ...prev,
          [type]: result
        }));
      }
    } catch (error) {
      // Optionally handle error
      console.error(error);
    }
  };

  const refreshData = () => {
    if (
      activeTab === 'destinations' ||
      activeTab === 'packages' ||
      activeTab === 'stories' ||
      activeTab === 'gallery' ||
      activeTab === 'travelers'
    ) {
      fetchData(activeTab as Exclude<TabType, 'dashboard'>);
    }
  };

  const handleAddNew = () => {
    setShowModal(true);
  };

  const renderTable = () => {
    switch (activeTab) {
      case 'destinations':
        return <DestinationsTable data={data.destinations} onRefresh={refreshData} />;
      case 'packages':
        return <PackagesTable data={data.packages} onRefresh={refreshData} />;
      case 'stories':
        return <StoriesTable data={data.stories} onRefresh={refreshData} />;
      case 'gallery':
        return <GalleryTable data={data.gallery} onRefresh={refreshData} />;
      case 'travelers':
        return <TravelersTable data={data.travelers} onRefresh={refreshData} />;
      default:
        return null;
    }
  };

  const renderForm = () => {
    switch (activeTab) {
      case 'destinations':
        return <AddDestinationForm onSuccess={() => { setShowModal(false); refreshData(); }} />;
      case 'packages':
        return <AddPackageForm onSuccess={() => { setShowModal(false); refreshData(); }} />;
      case 'stories':
        return <AddStoryForm onSuccess={() => { setShowModal(false); refreshData(); }} />;
      case 'gallery':
        return <AddGalleryForm onSuccess={() => { setShowModal(false); refreshData(); }} />;
      case 'travelers':
        return <AddTravelerForm onSuccess={() => { setShowModal(false); refreshData(); }} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-gray-800">
        <div className="flex items-center justify-center h-20 shadow-md">
          <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
        </div>
        <div className="flex flex-col flex-1 overflow-y-auto">
          <nav className="flex-1 px-4 py-6 space-y-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-indigo-700 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('destinations')}
              className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${activeTab === 'destinations' ? 'bg-indigo-700 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Destinations
            </button>
            <button
              onClick={() => setActiveTab('packages')}
              className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${activeTab === 'packages' ? 'bg-indigo-700 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              Packages
            </button>
            <button
              onClick={() => setActiveTab('stories')}
              className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${activeTab === 'stories' ? 'bg-indigo-700 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              Stories
            </button>
            <button
              onClick={() => setActiveTab('gallery')}
              className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${activeTab === 'gallery' ? 'bg-indigo-700 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Gallery
            </button>
            <button
              onClick={() => setActiveTab('travelers')}
              className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${activeTab === 'travelers' ? 'bg-indigo-700 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Travelers
            </button>
          </nav>
        </div>
        <div className="flex items-center p-4 mt-auto border-t border-gray-700">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
              <span className="text-indigo-800 font-medium">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-white">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-gray-300">Administrator</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Mobile header */}
        <header className="bg-white shadow-sm md:hidden">
          <div className="px-4 sm:px-6 py-4 flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="flex items-center space-x-4">
              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="text-indigo-800 font-medium">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </span>
              </div>
            </div>
          </div>
        </header>

        <SignedOut>
          <div className="flex-1 overflow-y-auto p-4 flex items-center justify-center">
            <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4 text-center">Please sign in to access the admin dashboard</h2>
              <div className="flex justify-center">
                <SignInButton>
                  <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
                    Sign In
                  </button>
                </SignInButton>
              </div>
            </div>
          </div>
        </SignedOut>

        <SignedIn>
          {isAdmin ? (
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              {/* Dashboard Overview */}
              {activeTab === 'dashboard' && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg shadow p-6">
                      <div className="flex items-center">
                        <div className="p-3 rounded-lg bg-indigo-100 text-indigo-600">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-sm font-medium text-gray-500">Destinations</h3>
                          <p className="text-2xl font-bold text-gray-900">{data.destinations.length}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                      <div className="flex items-center">
                        <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-sm font-medium text-gray-500">Packages</h3>
                          <p className="text-2xl font-bold text-gray-900">{data.packages.length}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                      <div className="flex items-center">
                        <div className="p-3 rounded-lg bg-green-100 text-green-600">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-sm font-medium text-gray-500">Stories</h3>
                          <p className="text-2xl font-bold text-gray-900">{data.stories.length}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                      <div className="flex items-center">
                        <div className="p-3 rounded-lg bg-yellow-100 text-yellow-600">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-sm font-medium text-gray-500">Gallery Items</h3>
                          <p className="text-2xl font-bold text-gray-900">{data.gallery.length}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                      <div className="flex items-center">
                        <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-sm font-medium text-gray-500">Travelers</h3>
                          <p className="text-2xl font-bold text-gray-900">{data.travelers.length}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Content Section */}
              {activeTab !== 'dashboard' && (
                <div className="mb-6 flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-800 capitalize">{activeTab}</h2>
                  <button
                    onClick={handleAddNew}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add New
                  </button>
                </div>
              )}

              {/* Table Content */}
              {activeTab !== 'dashboard' && renderTable()}

              {/* Modal */}
              {showModal && (
                <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center p-4 z-50">
                  <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-screen overflow-y-auto">
                    <div className="p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-gray-800 capitalize">Add New {activeTab.slice(0, -1)}</h3>
                        <button
                          onClick={() => setShowModal(false)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      {renderForm()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4 flex items-center justify-center">
              <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
                <div className="text-center">
                  <div className="mx-auto h-12 w-12 text-red-500 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
                  <p className="text-gray-500">You don't have administrator privileges to access this dashboard.</p>
                </div>
              </div>
            </div>
          )}
        </SignedIn>
      </div>
    </div>
  );
}