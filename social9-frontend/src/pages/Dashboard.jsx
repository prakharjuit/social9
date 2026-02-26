import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { Instagram, Linkedin } from 'lucide-react';
import Sidebar from '../components/ui/Sidebar';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <Sidebar />

      <div className="flex-1 pt-16 md:pt-0">
        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Welcome to Social9! 🎉
              </h2>
              
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 font-medium">
                    ✅ Authentication is working!
                  </p>
                  <p className="text-green-700 text-sm mt-1">
                    You successfully signed up and logged in.
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-blue-900 font-semibold mb-2">Your Account Details:</h3>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li><strong>Email:</strong> {user?.email}</li>
                    <li><strong>Name:</strong> {user?.name || 'Not set'}</li>
                    <li><strong>Business:</strong> {user?.businessName || 'Not set'}</li>
                    <li><strong>Plan:</strong> {user?.planType || 'FREE'}</li>
                    <li><strong>Member since:</strong> {new Date(user?.createdAt).toLocaleDateString()}</li>
                  </ul>
                </div>

                {/* NEW: Quick Actions */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="text-purple-900 font-semibold mb-3">🚀 Get Started:</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => navigate('/settings/social-accounts')}
                      className="w-full flex items-center justify-between p-3 bg-white border-2 border-purple-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
                    >
                      <div className="flex items-center">
                        <div className="flex -space-x-2">
                          <div className="bg-gradient-to-br from-purple-600 to-pink-500 p-2 rounded-full">
                            <Instagram className="w-4 h-4 text-white" />
                          </div>
                          <div className="bg-blue-600 p-2 rounded-full">
                            <Linkedin className="w-4 h-4 text-white" />
                          </div>
                        </div>
                        <span className="ml-3 font-medium text-gray-900">
                          Connect Social Accounts
                        </span>
                      </div>
                      <span className="text-purple-600 font-medium">→</span>
                    </button>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="text-yellow-900 font-semibold mb-2">🚧 Coming Soon:</h3>
                  <ul className="text-yellow-800 text-sm space-y-1">
                    <li>• Create posts with AI assistance</li>
                    <li>• Schedule posts to multiple platforms</li>
                    <li>• View analytics dashboard</li>
                    <li>• Industry-specific content templates</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
