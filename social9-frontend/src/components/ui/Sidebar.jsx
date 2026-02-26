import { NavLink, useNavigate } from 'react-router-dom';
import { Home, BarChart2, Settings, LogOut, Calendar, Menu, X } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { useState } from 'react';

export default function Sidebar() {
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  const navItems = [
    { to: '/dashboard', label: 'Home', icon: Home, color: 'text-primary-600' },
    { to: '/settings/social-accounts', label: 'Accounts', icon: BarChart2, color: 'text-purple-600' },
    { to: '/strategy', label: 'Strategy', icon: Calendar, color: 'text-green-600' },
    { to: '/dashboard', label: 'Settings', icon: Settings, color: 'text-gray-600' },
  ];

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-100 z-40">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-600 to-pink-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">S9</span>
            </div>
            <span className="font-bold text-primary-600 text-lg">Social9</span>
          </div>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
      )}
      <div className={`md:hidden fixed top-16 left-0 right-0 bg-white shadow-lg z-30 transition-all duration-300 ${mobileMenuOpen ? 'visible' : 'invisible'}`}>
        <nav className="space-y-1 p-4">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={handleNavClick}
              className={({isActive}) => `flex items-center space-x-3 px-4 py-3 rounded-md ${isActive ? 'bg-primary-50 text-primary-600' : 'text-gray-700 hover:bg-gray-50'}`}
            >
              <item.icon className={`w-5 h-5 ${item.color}`} />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
          <button 
            onClick={() => {
              handleLogout();
              handleNavClick();
            }}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-md text-gray-700 hover:bg-gray-50"
          >
            <LogOut className="w-5 h-5 text-red-500" />
            <span className="font-medium">Logout</span>
          </button>
        </nav>
      </div>

      {/* Desktop Sidebar */}
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
          {navItems.map(item => (
            <NavLink 
              key={item.to}
              to={item.to} 
              className={({isActive}) => `flex items-center lg:space-x-3 p-3 rounded-md hover:bg-gray-50 ${isActive ? 'bg-primary-50' : ''}`}
            >
              <item.icon className={`w-5 h-5 ${item.color}`} />
              <span className="hidden lg:inline text-sm font-medium text-gray-700">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-4">
          <button onClick={handleLogout} className="w-full flex items-center lg:space-x-3 p-3 rounded-md hover:bg-gray-50 text-sm text-gray-700">
            <LogOut className="w-5 h-5 text-red-500" />
            <span className="hidden lg:inline">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
