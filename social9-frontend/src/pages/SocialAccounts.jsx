import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import socialAccountsService from '../services/social-accounts.service';
import AnalyticsDrawer from '../components/ui/AnalyticsDrawer';
import Sidebar from '../components/ui/Sidebar';
import { Instagram, Linkedin, CheckCircle, XCircle, AlertCircle, Trash2 } from 'lucide-react';

export default function SocialAccounts() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [drawerOpenFor, setDrawerOpenFor] = useState(null);

  useEffect(() => {
    loadAccounts();

    const success = searchParams.get('success');
    const error = searchParams.get('error');

    if (success === 'instagram_connected') {
      setMessage({ type: 'success', text: 'Instagram account connected successfully!' });
      window.history.replaceState({}, '', '/settings/social-accounts');
    } else if (success === 'linkedin_connected') {
      setMessage({ type: 'success', text: 'LinkedIn account connected successfully!' });
      window.history.replaceState({}, '', '/settings/social-accounts');
    } else if (error) {
      setMessage({ type: 'error', text: decodeURIComponent(error) });
      window.history.replaceState({}, '', '/settings/social-accounts');
    }
  }, [searchParams]);

  // Auto-dismiss success messages after 3 seconds
  useEffect(() => {
    if (message.type === 'success') {
      const timer = setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message.type]);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const data = await socialAccountsService.getAccounts();
      setAccounts(data.accounts || []);
    } catch (err) {
      console.error('Failed to load accounts:', err);
      setMessage({ type: 'error', text: 'Failed to load social accounts' });
    } finally {
      setLoading(false);
    }
  };

  const handleConnectInstagram = async () => {
    try {
      await socialAccountsService.connectInstagram();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to connect Instagram' });
    }
  };

  const handleConnectLinkedIn = async () => {
    try {
      await socialAccountsService.connectLinkedIn();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to connect LinkedIn' });
    }
  };

  const handleDisconnect = async (accountId, platform) => {
    if (!confirm(`Are you sure you want to disconnect your ${platform} account?`)) return;
    try {
      await socialAccountsService.disconnectAccount(accountId);
      setMessage({ type: 'success', text: `${platform} account disconnected` });
      loadAccounts();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to disconnect account' });
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      ACTIVE: { icon: CheckCircle, text: 'Active', color: 'text-green-600 bg-green-50' },
      EXPIRED: { icon: AlertCircle, text: 'Expired', color: 'text-yellow-600 bg-yellow-50' },
      REVOKED: { icon: XCircle, text: 'Revoked', color: 'text-red-600 bg-red-50' },
      ERROR: { icon: XCircle, text: 'Error', color: 'text-red-600 bg-red-50' }
    };

    const badge = badges[status] || badges.ERROR;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {badge.text}
      </span>
    );
  };

  const getPlatformIcon = (platform) => {
    const icons = { INSTAGRAM: Instagram, LINKEDIN: Linkedin };
    return icons[platform] || Instagram;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <Sidebar />

      <div className="flex-1 pt-16 md:pt-0">
        <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Connected Accounts</h1>
              <p className="mt-1 text-sm text-gray-600">Connect your social media accounts to start scheduling posts</p>
            </div>

            {message.text && (
              <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                <button onClick={() => setMessage({ type: '', text: '' })} className="float-right text-gray-400 hover:text-gray-600">×</button>
                {message.text}
              </div>
            )}

            <div className="card mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Connect New Account</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button onClick={handleConnectInstagram} disabled={accounts.some(a => a.platform === 'INSTAGRAM' && a.status === 'ACTIVE')} className={`flex items-center justify-between p-4 border-2 rounded-lg transition-colors ${accounts.some(a => a.platform === 'INSTAGRAM' && a.status === 'ACTIVE') ? 'border-gray-200 bg-gray-50 cursor-not-allowed' : 'border-gray-300 hover:border-primary-500 hover:bg-primary-50'}`}>
                  <div className="flex items-center">
                    <div className="bg-gradient-to-br from-purple-600 to-pink-500 p-3 rounded-lg"><Instagram className="w-6 h-6 text-white" /></div>
                    <div className="ml-4 text-left"><div className="font-semibold text-gray-900">Instagram</div><div className="text-sm text-gray-600">Business Account</div></div>
                  </div>
                  <span className="text-sm text-primary-600 font-medium">Connect →</span>
                </button>

                <button onClick={handleConnectLinkedIn} disabled={accounts.some(a => a.platform === 'LINKEDIN' && a.status === 'ACTIVE')} className={`flex items-center justify-between p-4 border-2 rounded-lg transition-colors ${accounts.some(a => a.platform === 'LINKEDIN' && a.status === 'ACTIVE') ? 'border-gray-200 bg-gray-50 cursor-not-allowed' : 'border-gray-300 hover:border-primary-500 hover:bg-primary-50'}`}>
                  <div className="flex items-center">
                    <div className="bg-blue-600 p-3 rounded-lg"><Linkedin className="w-6 h-6 text-white" /></div>
                    <div className="ml-4 text-left"><div className="font-semibold text-gray-900">LinkedIn</div><div className="text-sm text-gray-600">Personal Profile</div></div>
                  </div>
                  <span className="text-sm text-primary-600 font-medium">Connect →</span>
                </button>
              </div>
            </div>

            {loading ? (
              <div className="card text-center py-12"><div className="text-gray-600">Loading accounts...</div></div>
            ) : accounts.length === 0 ? (
              <div className="card text-center py-12"><Instagram className="w-12 h-12 text-gray-400 mx-auto mb-4" /><h3 className="text-lg font-medium text-gray-900 mb-2">No accounts connected yet</h3><p className="text-gray-600">Connect your first social media account to get started</p></div>
            ) : (
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Connected Accounts</h2>
                <div className="space-y-4">
                  {accounts.map((account) => {
                    const Icon = getPlatformIcon(account.platform);
                    return (
                      <div key={account.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-4">
                          {account.profilePictureUrl ? (
                            <img src={account.profilePictureUrl} alt={account.platformDisplayName} className="w-12 h-12 rounded-full" />
                          ) : (
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${account.platform === 'INSTAGRAM' ? 'bg-gradient-to-br from-purple-600 to-pink-500' : account.platform === 'LINKEDIN' ? 'bg-blue-600' : 'bg-gray-400'}`}><Icon className="w-6 h-6 text-white" /></div>
                          )}
                          <div>
                            <div className="font-semibold text-gray-900">{account.platformDisplayName || account.platformUsername}</div>
                            <div className="text-sm text-gray-600">@{account.platformUsername}</div>
                            <div className="mt-1">{getStatusBadge(account.status)}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {account.status === 'EXPIRED' && <button onClick={() => {}} className="btn-secondary text-sm">Refresh</button>}
                          {account.platform === 'INSTAGRAM' && account.status === 'ACTIVE' && <button onClick={() => setDrawerOpenFor(account.id)} className="px-3 py-1 bg-primary-50 text-primary-700 rounded-lg text-sm hover:bg-primary-100" title="View analytics">View Analytics</button>}
                          <button onClick={() => handleDisconnect(account.id, account.platform)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Disconnect"><Trash2 className="w-5 h-5" /></button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </main>

        <AnalyticsDrawer accountId={drawerOpenFor} open={!!drawerOpenFor} onClose={() => setDrawerOpenFor(null)} />
      </div>
    </div>
  );
}
