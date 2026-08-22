import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  LayoutDashboard,
  TrendingUp,
  Target,
  LineChart,
  Layers,
  FileSpreadsheet,
  TestTube2,
  Bell,
  History,
  Settings,
  LogOut
} from 'lucide-react';

const Sidebar = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'NIFTY Market', path: '/market', icon: TrendingUp },
    { label: 'Trade Plan', path: '/trade-plan', icon: Target },
    { label: 'Charts', path: '/chart', icon: LineChart },
    { label: 'NIFTY Options', path: '/options', icon: Layers },
    { label: 'Paper Trading', path: '/paper-trading', icon: FileSpreadsheet },
    { label: 'Backtesting', path: '/backtesting', icon: TestTube2 },
    { label: 'Alerts', path: '/alerts', icon: Bell },
    { label: 'Trade History', path: '/history', icon: History },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#131b2e] border-r border-[#1e293b] flex flex-col justify-between h-[calc(100vh-57px)] sticky top-[57px] p-3 select-none">
      <div className="space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] font-bold text-gray-500 tracking-wider uppercase">
          Trading Terminal Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600/90 text-white shadow-md shadow-blue-500/20 font-bold'
                    : 'text-gray-400 hover:text-white hover:bg-[#1e293b]'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="pt-3 border-t border-[#1e293b]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
