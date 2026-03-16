import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AdminMode } from './components/AdminMode';
import { UserMode } from './components/UserMode';
import { TemplateEditor } from './components/TemplateEditor';
import { ImageEditor } from './components/ImageEditor';
import { Settings, User as UserIcon, LogIn, LogOut } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { user, login, logout, isAdmin: isUserAdmin, loading } = useAuth();
  const isAdmin = location.pathname.startsWith('/admin');
  const isEditor = location.pathname.startsWith('/editor/') || location.pathname.startsWith('/admin/template/');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {!isEditor && (
        <nav className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 text-white p-2 rounded-lg">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
            </div>
            <span className="text-xl font-bold text-slate-800 tracking-tight">EPX图片助手</span>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <Link
                to="/"
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  !isAdmin ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <UserIcon size={16} />
                用户模式
              </Link>
              {isUserAdmin && (
                <Link
                  to="/admin"
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    isAdmin ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Settings size={16} />
                  管理模式
                </Link>
              )}
            </div>

            <div className="flex items-center gap-3 border-l border-slate-200 pl-6">
              {loading ? (
                <div className="w-8 h-8 rounded-full bg-slate-100 animate-pulse"></div>
              ) : user ? (
                <div className="flex items-center gap-3">
                  <img src={user.photoURL || ''} alt={user.displayName || ''} className="w-8 h-8 rounded-full border border-slate-200" />
                  <button
                    onClick={logout}
                    className="text-slate-500 hover:text-red-600 transition-colors p-1"
                    title="退出登录"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={login}
                  className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-medium transition-colors"
                >
                  <LogIn size={18} />
                  登录
                </button>
              )}
            </div>
          </div>
        </nav>
      )}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<UserMode />} />
            <Route path="/admin" element={<AdminMode />} />
            <Route path="/admin/template/:id" element={<TemplateEditor />} />
            <Route path="/editor/:id" element={<ImageEditor />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  );
}
