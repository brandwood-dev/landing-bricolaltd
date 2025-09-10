
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Shield, Award, Clock } from 'lucide-react';

const About = () => {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{t('about.title')}</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('about.subtitle')}
            </p>
          </div>

          {/* Mission Section */}
          <div className="mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">{t('about.mission_title')}</h2>
                <p className="text-gray-600 mb-4">
                  {t('about.mission_1')}
                </p>
                <p className="text-gray-600 mb-4">
                  {t('about.mission_2')}
                </p>
                <p className="text-gray-600 mb-4">
                  {t('about.mission_3')}
                </p>
                <p className="text-gray-600 mb-4">
                  {t('about.mission_4')}
                </p>
                <p className="text-gray-600 mb-1 font-bold ">
                  {t('about.advantages')}
                </p>
                <ul className="list-disc list-inside text-gray-600 mb-4">
                  <li>{t('about.advantages_1')}</li>
                  <li>{t('about.advantages_2')}</li>
                  <li>{t('about.advantages_3')}</li>
                  <li>{t('about.advantages_4')}</li>
                </ul>
                <p className="text-gray-600 mb-4 ">
                  {t('about.mission_5')}
                </p>
                <p className="text-gray-600 ">
                  {t('about.mission_6')}
                </p>
              </div>
              <img 
                src="/lovable-uploads/about.png"
                alt="Outils de bricolage"
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>

          {/* Values Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">{t('about.values_title')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="text-center">
                <CardContent className="p-6">
                  <Users className="h-12 w-12 text-accent mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{t('about.community')}</h3>
                  <p className="text-gray-600">{t('about.community_desc')}</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-6">
                  <Shield className="h-12 w-12 text-accent mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{t('about.security')}</h3>
                  <p className="text-gray-600">{t('about.security_desc')}</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-6">
                  <Award className="h-12 w-12 text-accent mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{t('about.quality')}</h3>
                  <p className="text-gray-600">{t('about.quality_desc')}</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-6">
                  <Clock className="h-12 w-12 text-accent mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{t('about.simplicity')}</h3>
                  <p className="text-gray-600">{t('about.simplicity_desc')}</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Stats Section */}
          <div className="bg-accent/10 rounded-2xl p-8 mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">{t('about.stats_title')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-accent mb-2">5000+</div>
                <div className="text-gray-600">{t('about.tools_available')}</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-accent mb-2">2000+</div>
                <div className="text-gray-600">{t('about.active_users')}</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-accent mb-2">50+</div>
                <div className="text-gray-600">{t('about.cities_covered')}</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-accent mb-2">98%</div>
                <div className="text-gray-600">{t('about.satisfaction')}</div>
              </div>
            </div>
          </div>

          {/* Team Section */}
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-12">{t('about.team_title')}</h2>
            <div className="flex justify-center items-center">
              
              <Card>
                <CardContent className="p-6 text-center">
                  <img 
                    src="/lovable-uploads/cto.jpeg"
                    alt="CTO"
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                  />
                  <h3 className="text-xl font-semibold mb-2">{t('about.founder.name')}</h3>
                  <p className="text-accent font-medium mb-2">{t('about.founder.role')}</p>
                  <p className="text-gray-600">{t('about.founder.bio')}</p>
                </CardContent>
              </Card>
              
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
