import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, MessageSquare, Edit, Search, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

const FloatingActionButton = () => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      icon: MessageSquare,
      label: t('fab.contact_support'),
      action: () => window.location.href = 'mailto:contact@bricolaltd.com',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      icon: Edit,
      label: t('fab.publish_ad'),
      href: '/add-tool',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      icon: Search,
      label: t('fab.find_tool'),
      href: '/search',
      color: 'bg-purple-500 hover:bg-purple-600'
    }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Action buttons */}
      <div className={`flex flex-col gap-3 mb-3 transition-all duration-300 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        {actions.map((action, index) => (
          <div
            key={index}
            className="flex items-center gap-3"
            style={{ transitionDelay: `${index * 50}ms` }}
          >
            {/* Label on desktop */}
            <div className="hidden md:block bg-white px-3 py-2 rounded-lg shadow-lg text-sm font-medium text-gray-700 whitespace-nowrap">
              {action.label}
            </div>
            
            {/* Action button */}
            {action.href ? (
              <Link to={action.href}>
                <Button
                  size="icon"
                  className={`w-12 h-12 rounded-full text-white shadow-lg ${action.color} transition-transform hover:scale-110`}
                  onClick={() => setIsOpen(false)}
                >
                  <action.icon className="h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <Button
                size="icon"
                className={`w-12 h-12 rounded-full text-white shadow-lg ${action.color} transition-transform hover:scale-110`}
                onClick={() => {
                  action.action?.();
                  setIsOpen(false);
                }}
              >
                <action.icon className="h-5 w-5" />
              </Button>
            )}
          </div>
        ))}
      </div>

      {/* Main FAB button */}
      <Button
        size="icon"
        className={`w-14 h-14 rounded-full bg-primary hover:bg-primary/90 text-white shadow-lg transition-all duration-300 ${isOpen ? 'rotate-45' : 'rotate-0'}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
      </Button>
    </div>
  );
};

export default FloatingActionButton;