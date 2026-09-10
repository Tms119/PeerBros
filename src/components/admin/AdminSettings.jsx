import { useState } from 'react';
import { useQuery, useAction } from 'convex/react';
import { api } from '../../../convex/_generated/api';

export default function AdminSettings({ currentAdminEmail }) {
  const admins = useQuery(api.auth.getAllAdmins);
  const setupAdmin = useAction(api.auth.setupAdmin);

  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let pass = 'pb-';
    for (let i = 0; i < 8; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(pass);
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });
    setIsSubmitting(true);

    try {
      const result = await setupAdmin({
        adminEmail: currentAdminEmail,
        adminPassword: currentPassword,
        newEmail,
        newPassword
      });

      if (result.success) {
        setStatus({ type: 'success', message: 'Admin created and email sent successfully!' });
        setNewEmail('');
        setNewPassword('');
        setCurrentPassword('');
      } else {
        setStatus({ type: 'error', message: result.message || 'Failed to create admin' });
      }
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: 'An unexpected error occurred.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Current Admins List */}
      <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Current Administrators</h3>
        {admins === undefined ? (
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-white/10 rounded w-3/4"></div>
              <div className="h-4 bg-white/10 rounded w-1/2"></div>
            </div>
          </div>
        ) : (
          <ul className="space-y-3">
            {admins.map((admin) => (
              <li key={admin._id} className="flex items-center justify-between bg-white/5 px-4 py-3 rounded-lg border border-white/5">
                <span className="text-white/90 font-medium">{admin.email}</span>
                {admin.email === currentAdminEmail && (
                  <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded font-medium">You</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Add New Admin Form */}
      <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-1">Add New Admin</h3>
        <p className="text-sm text-white/50 mb-6">Create a new account. They will receive an email with their credentials.</p>
        
        <form onSubmit={handleAddAdmin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">New Admin Email</label>
            <input
              type="email"
              required
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="colleague@peerbros.com"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-white/30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Generated Password</label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Click generate or type..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-white/30 font-mono"
              />
              <button
                type="button"
                onClick={generatePassword}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap text-sm font-medium"
              >
                Generate
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 mt-4">
            <label className="block text-sm font-medium text-white/70 mb-1">Verify Your Password</label>
            <p className="text-xs text-white/40 mb-2">Please enter your own admin password to authorize this action.</p>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Your current password"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-white/30"
            />
          </div>

          {status.message && (
            <div className={`p-3 rounded-lg text-sm ${status.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {status.message}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-white text-black font-semibold py-3 rounded-xl hover:bg-white/90 transition-colors disabled:opacity-50 mt-2"
          >
            {isSubmitting ? 'Creating...' : 'Create & Email Admin'}
          </button>
        </form>
      </div>
    </div>
  );
}
