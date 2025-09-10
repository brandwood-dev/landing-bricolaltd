
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFavorites } from '@/hooks/useFavorites';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useAuth } from '@/contexts/AuthContext';
import { Search, User, Menu, Wrench, Heart, X, LogOut, Settings, UserCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import "/node_modules/flag-icons/css/flag-icons.min.css";
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { useNotifications } from '@/hooks/useNotifications';

const Header = () => {
  const { language, setLanguage, t } = useLanguage();
  const { favoritesCount } = useFavorites();
  const { currency, setCurrency, currencies } = useCurrency();
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const {
    notifications,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className=" mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/LOGO BRICOLA LTD VF.webp" 
              alt="Bricola" 
              className="h-8"
            />
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8 gap-7">
            <Link to="/" className="text-gray-700 hover:text-accent font-medium transition-colors">
              {t('nav.home')}
            </Link>
            <Link to="/search" className="text-gray-700 hover:text-accent font-medium transition-colors">
              {t('nav.catalog')}
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-accent font-medium transition-colors">
              {t('nav.propos')}
            </Link>
            <Link to="/blog" className="text-gray-700 hover:text-accent font-medium transition-colors">
              {t('nav.blog')}
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-accent font-medium transition-colors">
              {t('nav.contact')}
            </Link>
          </nav>

          {/* Desktop Right side */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Currency selector */}
            <Select value={currency.code} onValueChange={(value) => {
              const selectedCurrency = currencies.find(c => c.code === value);
              if (selectedCurrency) setCurrency(selectedCurrency);
            }}>
              <SelectTrigger className="w-20 border-none bg-transparent">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((curr) => (
                  <SelectItem key={curr.code} value={curr.code}>
                    <span className='mx-2' dangerouslySetInnerHTML={{ __html: curr.flag }} />
                    {curr.code} 
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Language selector */}
            <Select value={language} onValueChange={(value: 'fr' | 'en' | 'ar') => setLanguage(value)}>
              <SelectTrigger className="w-28 border-none bg-transparent">
                <SelectValue placeholder="Langue" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fr"><span class="fi fi-fr"></span> Français</SelectItem>
                <SelectItem value="en"><span class="fi fi-gb-eng"></span>  English</SelectItem>
                <SelectItem value="ar"><span class="fi fi-sa"></span> العربية</SelectItem>
              </SelectContent>
            </Select>

            {/* Favorites - Only for authenticated users */}
            {isAuthenticated && (
              <Link to="/favorites" className="relative">
                <Button variant="ghost" size="sm">
                  <Heart className="h-5 w-5" />
                  {favoritesCount > 0 && (
                    <span className="absolute -top-1 -right-1 text-black text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {favoritesCount}
                    </span>
                  )}
                </Button>
              </Link>
            )}

            {/* List tool button - Only for authenticated users */}
            {isAuthenticated && (
              <Link to="/add-tool">
                <Button variant="outline">
                  {t('nav.list')}
                </Button>
              </Link>
            )}

            {/* Notifications */}
            {isAuthenticated && (
              <NotificationCenter
                notifications={notifications}
                onMarkAsRead={markAsRead}
                onMarkAllAsRead={markAllAsRead}
                onNotificationClick={(notification) => {
                  if (notification.link) {
                    navigate(notification.link);
                  }
                }}
              />
            )}

            {/* User menu - Conditional based on auth state */}
            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="p-2">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5 text-sm font-medium">
                      {user?.firstName} {user?.lastName}
                    </div>
                    <div className="px-2 py-1.5 text-xs text-gray-500">
                      {user?.email}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center">
                        <UserCircle className="mr-2 h-4 w-4" />
                        {t('nav.profile')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/wallet" className="flex items-center">
                        <Wrench className="mr-2 h-4 w-4" />
                        {t('nav.wallet')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        {t('nav.settings')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      {t('nav.logout')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="outline" size="sm" className="px-3 py-2">
                      {t('nav.login')}
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button size="sm" className="px-3 py-2">
                      {t('nav.signup')}
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Right side */}
          <div className="md:hidden flex items-center space-x-2">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5 text-sm font-medium">
                    {user?.firstName} {user?.lastName}
                  </div>
                  <div className="px-2 py-1.5 text-xs text-gray-500">
                    {user?.email}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center">
                      <UserCircle className="mr-2 h-4 w-4" />
                      {t('nav.profile')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    {t('nav.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            )}

            {/* Mobile Burger Menu */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent 
                side={language === 'ar' ? 'left' : 'right'}
                className={`w-80 p-0 flex !flex-col ${language === 'ar' ? 'rtl text-right' : 'ltr text-left'}`}
              >
                {/* Fixed Header */}
                <div className={`flex items-center justify-between p-6 border-b flex-shrink-0 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                <Link to="/" className="flex items-center space-x-2">

                  <img 
                    src="/lovable-uploads/LOGO BRICOLA LTD VF.webp" 
                    alt="Bricola" 
                    className="h-8"
                  />
                  </Link>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto">
                  <div className="p-6 space-y-6">
                     {/* Auth Buttons - Conditional based on auth state */}
                    <div className="space-y-4">
                      {isAuthenticated ? (
                        <>
                          <div className="text-center py-4 border-b">
                            <div className="font-medium">{user?.firstName} {user?.lastName}</div>
                            <div className="text-sm text-gray-500">{user?.email}</div>
                          </div>
                          <Link to="/profile" onClick={() => setIsMenuOpen(false)}>
                            <Button variant="outline" className="w-full h-12 text-sm">
                              <UserCircle className="mr-2 h-4 w-4" />
                              {t('nav.profile')}
                            </Button>
                          </Link>
                          <Link to="/wallet" onClick={() => setIsMenuOpen(false)}>
                            <Button variant="outline" className="w-full h-12 text-sm">
                              <Wrench className="mr-2 h-4 w-4" />
                              {t('nav.wallet')}
                            </Button>
                          </Link>
                          <Button 
                            variant="outline" 
                            className="w-full h-12 text-sm text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => {
                              handleLogout();
                              setIsMenuOpen(false);
                            }}
                          >
                            <LogOut className="mr-2 h-4 w-4" />
                            {t('nav.logout')}
                          </Button>
                        </>
                      ) : (
                        <>
                          <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                            <Button variant="outline" className="w-full h-12 text-sm">
                              {t('nav.login')}
                            </Button>
                          </Link>
                          <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                            <Button className="w-full h-12 my-4 text-sm">
                              {t('nav.signup')}
                            </Button>
                          </Link>
                        </>
                      )}
                      {/* List tool button - Only for authenticated users */}
                      {isAuthenticated && (
                        <Link to="/add-tool" onClick={() => setIsMenuOpen(false)}>
                          <Button variant="outline" className="w-full  h-12 text-sm">
                            {t('nav.list')}
                          </Button>
                        </Link>
                      )}
                    </div>

                    {/* Navigation Links - RTL optimized */}
                    <div className="space-y-4 border-t pt-6">
                      <h3 className={`font-semibold text-lg `}>{t('nav.navigation')}</h3>
                      <div className="space-y-2">
                        <Link 
                          to="/" 
                          className={`block py-3 text-gray-700 hover:text-accent transition-colors `}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {t('nav.home')}
                        </Link>
                        <Link 
                          to="/search" 
                          className={`block py-3 text-gray-700 hover:text-accent transition-colors `}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {t('nav.catalog')}
                        </Link>
                        <Link 
                          to="/about" 
                          className={`block py-3 text-gray-700 hover:text-accent transition-colors `}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {t('nav.propos')}
                        </Link>
                        <Link 
                          to="/blog" 
                          className={`block py-3 text-gray-700 hover:text-accent transition-colors `}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {t('nav.blog')}
                        </Link>
                        <Link 
                          to="/contact" 
                          className={`block py-3 text-gray-700 hover:text-accent transition-colors `}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {t('nav.contact')}
                        </Link>
                      </div>
                    </div>

                    {/* Language selector - RTL optimized */}
                    <div className="space-y-3 border-t pt-6">
                      <h3 className={`font-semibold text-lg ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                        {language === 'ar' ? 'اللغة' : 'Langue'}
                      </h3>
                      <Select value={language} onValueChange={(value: 'fr' | 'en' | 'ar') => setLanguage(value)}>
                        <SelectTrigger className={`w-full ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                          <SelectValue placeholder="Langue" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fr"><span class="fi fi-fr"></span> Français</SelectItem>
                          <SelectItem value="en"><span class="fi fi-gb-eng"></span>  English</SelectItem>
                          <SelectItem value="ar"><span class="fi fi-sa"></span> العربية</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Currency selector - RTL optimized */}
                    <div className="space-y-3 border-t pt-6">
                      <h3 className={`font-semibold text-lg ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                        {language === 'ar' ? 'العملة' : 'Devise'}
                      </h3>
                      <Select value={currency.code} onValueChange={(value) => {
                        const selectedCurrency = currencies.find(c => c.code === value);
                        if (selectedCurrency) setCurrency(selectedCurrency);
                      }}>
                        <SelectTrigger className={`w-full text-left`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {currencies.map((curr) => (
                            <SelectItem key={curr.code} value={curr.code}>
                              <span className='mx-2' dangerouslySetInnerHTML={{ __html: curr.flag }} /> {curr.code} - {curr.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
