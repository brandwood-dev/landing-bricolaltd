import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useLanguage } from '@/contexts/LanguageContext'
import { useFavorites } from '@/hooks/useFavorites'
import { useCurrency } from '@/contexts/CurrencyContext'
import { useAuth } from '@/contexts/AuthContext'
import { CurrencySelector } from '@/components/CurrencySelector'
import {
  User,
  Menu,
  Heart,
  LogOut,
  UserCircle,
  DollarSign,
  Calendar,
  Edit,
  MessageSquare,
} from 'lucide-react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import '/node_modules/flag-icons/css/flag-icons.min.css'
import { NotificationCenter } from '@/components/notifications/NotificationCenter'
import { useNotifications } from '@/hooks/useNotifications'

export const HeaderRTL: React.FC = () => {
  const { language, setLanguage, t } = useLanguage()
  const { favoritesCount } = useFavorites()
  const { currency, setCurrency, currencies } = useCurrency()
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { notifications, markAsRead, markAllAsRead } = useNotifications()

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const navItems = [
    { to: '/', label: t('nav.home') },
    { to: '/search', label: t('nav.catalog') },
    { to: '/about', label: t('nav.propos') },
    { to: '/blog', label: t('nav.blog') },
    { to: '/contact', label: t('nav.contact') },
  ]

  return (
    <header className='bg-white shadow-sm border-b sticky top-0 z-50' dir='rtl'>
      <div className=' mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16'>
          {/* Logo (à droite) */}
          <Link to='/' className='flex items-center space-x-2 order-last'>
            <img
              src='/lovable-uploads/LOGO BRICOLA LTD VF.webp'
              alt='Bricola'
              className='h-8'
            />
          </Link>

          {/* Navigation (au centre, ordre visuel RTL) */}
          <nav className='hidden md:flex items-center space-x-8 space-x-reverse order-2'>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `${
                    isActive ? 'text-accent' : 'text-gray-700 hover:text-accent'
                  } font-medium transition-colors`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Actions (à gauche) */}
          <div className='hidden md:flex items-center flex-row-reverse space-x-6 space-x-reverse order-first'>
            {/* Devise */}
            <CurrencySelector showLabel={false} size='sm' className='w-40' />

            {/* Langue */}
            <Select
              value={language}
              onValueChange={(value: 'fr' | 'en' | 'ar') => setLanguage(value)}
            >
              <SelectTrigger className='w-28 border-none bg-transparent text-right'>
                <SelectValue placeholder={t('common.language')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='fr'>
                  <span className='fi fi-fr'></span> Français
                </SelectItem>
                <SelectItem value='en'>
                  <span className='fi fi-gb-eng'></span> English
                </SelectItem>
                <SelectItem value='ar'>
                  <span className='fi fi-sa'></span> العربية
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Favoris (auth) */}
            {isAuthenticated && (
              <Link to='/favorites' className='relative'>
                <Button variant='ghost' size='sm'>
                  <Heart className='h-5 w-5' />
                  {favoritesCount > 0 && (
                    <span className='absolute -top-1 -right-1 text-black text-xs rounded-full h-5 w-5 flex items-center justify-center'>
                      {favoritesCount}
                    </span>
                  )}
                </Button>
              </Link>
            )}

            {/* Proposer un outil (auth) */}
            {isAuthenticated && (
              <Link to='/add-tool'>
                <Button variant='outline'>{t('nav.list')}</Button>
              </Link>
            )}

            {/* Notifications (auth) */}
            {isAuthenticated && (
              <NotificationCenter
                notifications={notifications}
                onMarkAsRead={markAsRead}
                onMarkAllAsRead={markAllAsRead}
                onNotificationClick={(notification) => {
                  if (notification.link) {
                    navigate(notification.link)
                  }
                }}
              />
            )}

            {/* Menu utilisateur / Connexion / Inscription */}
            <div className='flex items-center gap-2'>
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='ghost' size='sm' className='p-2'>
                      <User className='h-5 w-5' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end' className='w-56'>
                    <div className='px-2 py-1.5 text-sm font-medium'>
                      {user?.firstName} {user?.lastName}
                    </div>
                    <div className='px-2 py-1.5 text-xs text-gray-500'>
                      {user?.email}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to='/profile' className='flex items-center'>
                        <UserCircle className='mr-2 h-4 w-4' />
                        {t('nav.profile')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        to='/profile?tab=wallet'
                        className='flex items-center'
                      >
                        <DollarSign className='mr-2 h-4 w-4' />
                        {t('nav.wallet')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to='/profile?tab=ads' className='flex items-center'>
                        <Edit className='mr-2 h-4 w-4' />
                        {t('nav.my_listings')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        to='/profile?tab=requests'
                        className='flex items-center'
                      >
                        <MessageSquare className='mr-2 h-4 w-4' />
                        {t('nav.requests')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        to='/profile?tab=reservations'
                        className='flex items-center'
                      >
                        <Calendar className='mr-2 h-4 w-4' />
                        {t('nav.bookings')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className='text-red-600'
                    >
                      <LogOut className='mr-2 h-4 w-4' />
                      {t('nav.logout')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Link to='/login'>
                    <Button variant='outline' size='sm' className='px-3 py-2'>
                      {t('nav.login')}
                    </Button>
                  </Link>
                  <Link to='/register'>
                    <Button size='sm' className='px-3 py-2'>
                      {t('nav.signup')}
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile */}
          <div className='md:hidden flex items-center flex-row-reverse space-x-2 space-x-reverse'>
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='ghost' size='sm'>
                    <User className='h-5 w-5' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end' className='w-56'>
                  <div className='px-2 py-1.5 text-sm font-medium'>
                    {user?.firstName} {user?.lastName}
                  </div>
                  <div className='px-2 py-1.5 text-xs text-gray-500'>
                    {user?.email}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to='/profile' className='flex items-center'>
                      <UserCircle className='mr-2 h-4 w-4' />
                      {t('nav.profile')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className='text-red-600'
                  >
                    <LogOut className='mr-2 h-4 w-4' />
                    {t('nav.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to='/login'>
                <Button variant='ghost' size='sm'>
                  <User className='h-5 w-5' />
                </Button>
              </Link>
            )}

            {/* Menu mobile */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant='ghost' size='sm'>
                  <Menu className='h-5 w-5' />
                </Button>
              </SheetTrigger>
              <SheetContent
                side='left'
                className='w-80 p-0 flex !flex-col rtl text-right'
              >
                {/* En-tête fixe */}
                <div className='flex items-center justify-between p-6 border-b flex-shrink-0 flex-row-reverse'>
                  <Link to='/' className='flex items-center space-x-2'>
                    <img
                      src='/lovable-uploads/LOGO BRICOLA LTD VF.webp'
                      alt='Bricola'
                      className='h-8'
                    />
                  </Link>
                </div>

                {/* Contenu défilant */}
                <div className='flex-1 overflow-y-auto'>
                  <div className='p-6 space-y-6'>
                    {/* Auth */}
                    <div className='space-y-4'>
                      {isAuthenticated ? (
                        <Button
                          variant='outline'
                          className='w-full h-12 text-sm text-red-600 border-red-200 hover:bg-red-50'
                          onClick={() => {
                            handleLogout()
                            setIsMenuOpen(false)
                          }}
                        >
                          <LogOut className='mr-2 h-4 w-4' />
                          {t('nav.logout')}
                        </Button>
                      ) : (
                        <>
                          <Link
                            to='/login'
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <Button
                              variant='outline'
                              className='w-full h-12 text-sm'
                            >
                              {t('nav.login')}
                            </Button>
                          </Link>
                          <Link
                            to='/register'
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <Button className='w-full h-12 my-4 text-sm'>
                              {t('nav.signup')}
                            </Button>
                          </Link>
                        </>
                      )}
                    </div>

                    {/* Liens de navigation */}
                    <div className='space-y-4 border-t pt-6'>
                      <h3 className='font-semibold text-lg'>
                        {t('nav.navigation')}
                      </h3>
                      <div className='space-y-2'>
                        {navItems.map((item) => (
                          <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end as any}
                            className={({ isActive }) =>
                              `${
                                isActive
                                  ? 'text-accent'
                                  : 'text-gray-700 hover:text-accent'
                              } block py-3 transition-colors`
                            }
                            onClick={() => setIsMenuOpen(false)}
                          >
                            {item.label}
                          </NavLink>
                        ))}
                      </div>
                    </div>

                    {/* Sélecteur de langue */}
                    <div className='space-y-3 border-t pt-6'>
                      <h3 className='font-semibold text-lg text-right'>
                        اللغة
                      </h3>
                      <Select
                        value={language}
                        onValueChange={(value: 'fr' | 'en' | 'ar') =>
                          setLanguage(value)
                        }
                      >
                        <SelectTrigger className='w-full text-right'>
                          <SelectValue placeholder={t('common.language')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='fr'>
                            <span className='fi fi-fr'></span> Français
                          </SelectItem>
                          <SelectItem value='en'>
                            <span className='fi fi-gb-eng'></span> English
                          </SelectItem>
                          <SelectItem value='ar'>
                            <span className='fi fi-sa'></span> العربية
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Sélecteur de devise */}
                    <div className='space-y-3 border-t pt-6'>
                      <h3 className='font-semibold text-lg text-right'>
                        Devise
                      </h3>
                      <Select
                        value={currency.code}
                        onValueChange={(value) => {
                          const selectedCurrency = currencies.find(
                            (c) => c.code === value
                          )
                          if (selectedCurrency) setCurrency(selectedCurrency)
                        }}
                      >
                        <SelectTrigger className='w-full text-right'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {currencies.map((curr) => (
                            <SelectItem key={curr.code} value={curr.code}>
                              <span className={`${curr.flagClass} mx-2`}></span>{' '}
                              {curr.code}
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
  )
}
