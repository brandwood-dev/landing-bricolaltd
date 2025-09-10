import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Facebook, Twitter, Instagram, Mail } from 'lucide-react';
import { Link, Route, useNavigate, useNavigation, useRoutes } from 'react-router-dom';
import visaLogo from '@/assets/visa-logo.png';
import mastercardLogo from '@/assets/mastercard-logo.png';
import { FaTiktok } from "react-icons/fa6";

// WhatsApp Icon Component
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.489 3.488"/>
  </svg>
);

const Footer = () => {
  const { t, language } = useLanguage();
  const navigate =  useNavigate()
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className={`flex items-center space-x-2 mb-4 ${language === 'ar' ? 'justify-end' : 'ltr text-left'}`}>
              <img
                onClick={() => {
                  navigate('/')
                  window.scroll({top: 0, behavior: 'smooth'})

                }}
                src="/lovable-uploads/LOGO BRICOLA LTD VF Sombre.webp"
                alt="Bricola"
                className={`h-8 ${language === 'ar' ? 'rtl text-right' : 'ltr text-left'}`}
              />
            </div>
            <p className="text-gray-400 mb-4 max-w-md md:mb-10">
              {t('footer.description')}
            </p>
            <div className={ `flex space-x-4 ${language === 'ar' ? 'justify-end' : 'justify-start'}`}>
              <a href="https://www.facebook.com/profile.php?id=61579165954234" target="_blank" rel="noopener noreferrer">
                <Facebook className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              </a>
              <a href="https://www.instagram.com/bricola_ltd/" target="_blank" rel="noopener noreferrer">
                <Instagram className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              </a>
              <a href="https://www.tiktok.com/@bricola.ltd" target="_blank" rel="noopener noreferrer">
                <FaTiktok className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              </a>  
            </div>
          </div>

          {/* Useful Links */}
          <div>
            <h3 className="font-semibold mb-4">{t('footer.discover')}</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/" className="hover:text-white transition-colors">{t('nav.home')}</Link></li>
              <li><Link to="/search" className="hover:text-white transition-colors">{t('nav.catalog')}</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">{t('nav.propos')}</Link></li>
              <li><Link to="/blog" className="hover:text-white transition-colors">{t('nav.blog')}</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">{t('nav.contact')}</Link></li>
            </ul>
          </div>

          {/* Help Center */}
          <div>
            <h3 className="font-semibold mb-4">{t('footer.useful_links')}</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/guide-loueur" className="hover:text-white transition-colors">{t('faq.owners.title')}</Link></li>
              <li><Link to="/guide-locataire" className="hover:text-white transition-colors">{t('faq.renters.title')}</Link></li>
              <li><Link to="/faq" className="hover:text-white transition-colors">{t('footer.faq')}</Link></li>
              <li><Link to="/cgu" className="hover:text-white transition-colors">{t('footer.cgu')}</Link></li>
              <li><Link to="/contrat-location" className="hover:text-white transition-colors">{t('footer.contrat')}</Link></li>
              <li><Link to="/politique-confidentialite" className="hover:text-white transition-colors">{t('footer.privacy')}</Link></li>
              <li><Link to="/politique-annulation" className="hover:text-white transition-colors">{t('cancellationPolicy.title')}</Link></li>
              <li><Link to="/politique-remboursement" className="hover:text-white transition-colors">{t('refundPolicy.title')}</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div  >
            <h3 className="font-semibold mb-4">{t('footer.contact')}</h3>
            <ul className="space-y-2 text-gray-400  ">
              <li
                className={"flex items-center " + (language === 'ar' ? '[direction:ltr]' : '')}
              >
                <Mail className={"h-4 w-4 " + (language === 'ar' ? 'ml-2' : 'mr-2')} />
                contact@bricolaltd.com
              </li>
              <li className={"flex items-center " + (language === 'ar' ? '[direction:ltr]' : '')}>
                <WhatsAppIcon className={"h-4 w-4 " + (language === 'ar' ? 'ml-2' : 'mr-2')} />
                +442039960821
              </li>
            </ul>

            {/* Payment Methods */}
            <div className="mt-6">
              <h4 className="font-semibold mb-3 text-sm">{t('footer.payment')}</h4>
              <div className={"flex space-x-3" + (language === 'ar' ? ' justify-end' : ' justify-start')}>
                <img src={visaLogo} alt="Visa" className="h-6 object-contain" />
                <img src={mastercardLogo} alt="Mastercard" className="h-6 object-contain" />
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 mt-8">
          <div className="flex !flex-col items-center text-center text-gray-400 space-y-2">
            <p>&copy; 2025 Bricola LTD. {t('footer.rights')}.</p>
            <p className="text-sm">
              {'Designed By'}{' '}
              <a
                href="https://www.brandwoodandco.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:text-accent-foreground transition-colors"
              >
                Brandwood & co
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;