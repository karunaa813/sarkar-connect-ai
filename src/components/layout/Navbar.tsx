import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/lib/store';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Citizen Portal', path: '/dashboard' },
    { name: 'Smart RTI', path: '/rti' },
    { name: 'Evidence Vault', path: '/vault' },
    { name: 'Community Watch', path: '/watch' },
    { name: 'Legal Library', path: '/library' },
    { name: 'Rewards', path: '/rewards' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0a0a0c]/80 backdrop-blur-xl border-b border-white/[0.05]">
      <div className="container mx-auto flex items-center justify-between h-20 px-4">
        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-primary/50 transition-colors">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-display font-bold text-[1.75rem] tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#D35400] via-[#FDFAEF] to-[#1E5D1D]">
                Sarkar Connect AI
              </span>
              <div className="w-6 h-6 rounded-full border-2 border-[#F6ECD5]/40 flex items-center justify-center ml-1">
                <div className="w-1.5 h-1.5 rounded-full bg-[#F6ECD5]/60 animate-spin-slow" />
                <div className="absolute w-5 h-[1px] bg-[#F6ECD5]/20 rotate-45" />
                <div className="absolute w-5 h-[1px] bg-[#F6ECD5]/20 -rotate-45" />
                <div className="absolute w-5 h-[1px] bg-[#F6ECD5]/20 rotate-90" />
                <div className="absolute w-5 h-[1px] bg-[#F6ECD5]/20" />
              </div>
            </div>
            <span className="text-[10px] font-bold tracking-[0.2em] text-[#F6ECD5]/50 uppercase mt-2">
              National Justice Portal
            </span>
          </div>


          </div>
        </Link>

        {/* Navigation Items (Desktop) */}
        <nav className="hidden lg:flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "px-4 py-2 text-sm font-semibold transition-all rounded-lg",
                location.pathname === item.path
                  ? "bg-white/10 text-white shadow-lg"
                  : "text-muted-foreground hover:text-white hover:bg-white/5"
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Link to="/dashboard">
            <Button 
              variant="ghost" 
              className="hidden md:flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white border-none rounded-xl px-5"
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Button>
          </Link>
          <Button 
            onClick={() => logout()}
            className="bg-accent hover:bg-accent/90 text-accent-foreground font-black rounded-xl px-6 border-none shadow-lg shadow-accent/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  );
}
