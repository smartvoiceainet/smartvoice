"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  BarChart, 
  Phone, 
  FileText, 
  Settings, 
  Users, 
  ChevronDown,
  Mic,
  BarChart2,
  RefreshCw
} from 'lucide-react';
import { UserRole } from '@/models/User';

interface VoiceAIMenuProps {
  session?: any; // Accept session from server component or use client-side session
}

const VoiceAIMenu = ({ session: serverSession }: VoiceAIMenuProps) => {
  const { data: clientSession } = useSession();
  const session = serverSession || clientSession; // Use server session if provided, otherwise client session
  
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Check user permissions
  const hasAccess = session?.user?.hasVoiceAiAccess || session?.user?.role === UserRole.ADMIN;
  const isAdmin = session?.user?.role === UserRole.ADMIN;
  
  if (!hasAccess) return null;

  const menuItems = [
    {
      name: 'Real-Time Dashboard',
      href: '/dashboard/voice-ai-analytics?tab=realtime',
      icon: BarChart2,
      active: pathname === '/dashboard/voice-ai-analytics' && (!pathname.includes('tab=') || pathname.includes('tab=realtime')),
      access: hasAccess
    },
    {
      name: 'Data Synchronization',
      href: '/dashboard/voice-ai-analytics?tab=sync',
      icon: RefreshCw,
      active: pathname === '/dashboard/voice-ai-analytics' && pathname.includes('tab=sync'),
      access: isAdmin
    },
    {
      name: 'User Management',
      href: '/dashboard/voice-ai-admin',
      icon: Users,
      active: pathname === '/dashboard/voice-ai-admin',
      access: isAdmin
    },
    {
      name: 'Settings',
      href: '/dashboard/voice-ai-admin?tab=settings',
      icon: Settings,
      active: pathname === '/dashboard/voice-ai-admin' && pathname.includes('tab=settings'),
      access: isAdmin
    }
  ];

  // Filter items based on access permission
  const availableItems = menuItems.filter(item => item.access);

  return (
    <div className="relative">
      {/* Mobile Dropdown Button */}
      <div className="lg:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="btn btn-ghost btn-sm flex items-center gap-2"
        >
          <Mic className="h-4 w-4" />
          <span>Voice AI</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {/* Mobile Dropdown Menu */}
        {isOpen && (
          <div className="absolute left-0 z-10 mt-2 w-56 origin-top-left rounded-md bg-base-100 shadow-lg ring-1 ring-base-300 focus:outline-none">
            <div className="py-1">
              {availableItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-4 py-2 text-sm ${item.active ? 'bg-base-200 text-primary' : 'text-base-content hover:bg-base-200'}`}
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5" aria-hidden="true" />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Desktop Menu */}
      <div className="hidden lg:block w-full">
        <nav className="flex flex-col space-y-1 w-full">
          {availableItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors w-full ${
                item.active 
                  ? 'bg-primary text-primary-content' 
                  : 'text-base-content hover:bg-base-200'
              }`}
            >
              <item.icon className="flex-shrink-0 mr-2 h-4 w-4" aria-hidden="true" />
              <span className="truncate">{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default VoiceAIMenu;
