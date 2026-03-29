import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutGrid, Truck, Map as MapIcon, Bell, History, LogOut, Menu, X, ShieldAlert } from 'lucide-react';
import { Button } from './ui/TacticalUI';
import { cn } from '@/src/lib/utils';

const SidebarItem: React.FC<{ to: string; icon: any; label: string; active: boolean }> = ({ to, icon: Icon, label, active }) => (
  <Link
    to={to}
    className={cn(
      'flex items-center gap-4 p-4 transition-all group',
      active 
        ? 'bg-surface text-on-surface border-l-4 border-primary-container translate-x-1' 
        : 'text-outline hover:bg-surface-container-low hover:text-on-surface'
    )}
  >
    <Icon className={cn('w-5 h-5', active ? 'text-primary-container' : 'text-outline group-hover:text-on-surface')} />
    <span className="font-display text-xs tracking-[0.1em] uppercase">{label}</span>
  </Link>
);

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navItems = [
    { to: '/', icon: LayoutGrid, label: 'Dashboard' },
    { to: '/vehicles', icon: Truck, label: 'Assets' },
    { to: '/geofences', icon: MapIcon, label: 'Geofences' },
    { to: '/alerts', icon: Bell, label: 'Alert Config' },
    { to: '/violations', icon: History, label: 'Violations' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('fleetspy_token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      {/* Top Bar */}
      <header className="fixed top-0 left-0 w-full h-20 bg-surface/80 backdrop-blur-xl z-50 flex items-center justify-between px-6 border-b border-outline-variant">
        <div className="flex items-center gap-8">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2">
            {isSidebarOpen ? <X /> : <Menu />}
          </button>
          <Link to="/" className="text-2xl font-display tracking-tighter uppercase flex items-center gap-2">
            <ShieldAlert className="w-8 h-8 text-primary-container" />
            FleetSpy
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end mr-4">
            <span className="text-[10px] font-bold tracking-widest text-outline uppercase">System Status</span>
            <span className="text-xs font-display text-emerald-600">OPERATIONAL // NOMINAL</span>
          </div>
          <div className="w-10 h-10 bg-surface-container-highest overflow-hidden rounded-sm">
            <img 
              src="https://picsum.photos/seed/commander/100/100" 
              alt="User" 
              className="w-full h-full object-cover grayscale"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </header>

      <div className="flex flex-1 pt-20">
        {/* Sidebar */}
        <aside 
          className={cn(
            "fixed left-0 top-20 h-[calc(100vh-5rem)] bg-surface-container-low transition-all duration-300 z-40 flex flex-col justify-between py-8",
            isSidebarOpen ? "w-64" : "w-0 -translate-x-full lg:w-20 lg:translate-x-0"
          )}
        >
          <div className="flex flex-col overflow-hidden">
            <div className="px-6 mb-10 whitespace-nowrap">
              <h2 className="text-lg font-display">Fleet HQ</h2>
              <p className="text-[10px] tracking-[0.2em] text-outline uppercase font-semibold">Sector 7</p>
            </div>
            
            <nav className="flex flex-col">
              {navItems.map((item) => (
                <SidebarItem 
                  key={item.to} 
                  to={item.to}
                  icon={item.icon}
                  label={item.label}
                  active={location.pathname === item.to} 
                />
              ))}
            </nav>
          </div>

          <div className="px-4 space-y-4 whitespace-nowrap overflow-hidden">
            <Button variant="secondary" className="w-full text-[10px]" onClick={() => navigate('/mission')}>
              Initiate Mission
            </Button>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-4 p-4 text-outline hover:text-on-surface w-full transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-display text-xs tracking-[0.1em] uppercase">Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className={cn(
          "flex-1 transition-all duration-300 p-8",
          isSidebarOpen ? "lg:ml-64" : "lg:ml-20"
        )}>
          {children}
        </main>
      </div>
    </div>
  );
};
