import { NavLink, useNavigate } from 'react-router-dom';
import { Home, BarChart2, Settings, LogOut, Calendar } from 'lucide-react';
import useAuthStore from '../../store/authStore';

export default function Sidebar() {
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="hidden md:flex flex-col w-20 lg:w-56 bg-white border-r border-gray-100 h-screen p-4">
      <div className="flex items-center justify-center lg:justify-start space-x-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-600 to-pink-500 flex items-center justify-center">
          <span className="text-white font-bold">S9</span>
        </div>
        <div className="hidden lg:block">
          <div className="text-lg font-bold text-primary-600">Social9</div>
          <div className="text-xs text-gray-500">{user?.name || user?.email}</div>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        <NavLink to="/dashboard" className={({isActive}) => `flex items-center lg:space-x-3 p-3 rounded-md hover:bg-gray-50 ${isActive ? 'bg-primary-50' : ''}`}>
          <Home className="w-5 h-5 text-primary-600" />
          <span className="hidden lg:inline text-sm font-medium text-gray-700">Home</span>
        </NavLink>

        <NavLink to="/settings/social-accounts" className={({isActive}) => `flex items-center lg:space-x-3 p-3 rounded-md hover:bg-gray-50 ${isActive ? 'bg-primary-50' : ''}`}>
          <BarChart2 className="w-5 h-5 text-purple-600" />
          <span className="hidden lg:inline text-sm font-medium text-gray-700">Accounts</span>
        </NavLink>

        <NavLink to="/strategy" className={({isActive}) => `flex items-center lg:space-x-3 p-3 rounded-md hover:bg-gray-50 ${isActive ? 'bg-primary-50' : ''}`}>
          <Calendar className="w-5 h-5 text-green-600" />
          <span className="hidden lg:inline text-sm font-medium text-gray-700">Strategy</span>
        </NavLink>

        <NavLink to="/dashboard" className={({isActive}) => `flex items-center lg:space-x-3 p-3 rounded-md hover:bg-gray-50 ${isActive ? 'bg-primary-50' : ''}`}>
          <Settings className="w-5 h-5 text-gray-600" />
          <span className="hidden lg:inline text-sm font-medium text-gray-700">Settings</span>
        </NavLink>
      </nav>

      <div className="mt-4">
        <button onClick={handleLogout} className="w-full flex items-center lg:space-x-3 p-3 rounded-md hover:bg-gray-50 text-sm text-gray-700">
          <LogOut className="w-5 h-5 text-red-500" />
          <span className="hidden lg:inline">Logout</span>
        </button>
      </div>
    </aside>
  );
}
