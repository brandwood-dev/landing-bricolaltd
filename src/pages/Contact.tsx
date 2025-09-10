
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { contactService, CreateContactData } from '@/services/contactService';

const Contact = () => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.subject || !formData.message) {
      toast({
        title: t('contact.error_title') || 'Erreur',
        description: t('contact.required_fields') || 'Veuillez remplir tous les champs obligatoires.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const contactData: CreateContactData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone || undefined,
        subject: formData.subject,
        message: formData.message
      };

      await contactService.createContact(contactData);
      
      toast({
        title: t('contact.success_title') || 'Message envoyé !',
        description: t('contact.success_message') || 'Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.',
        variant: 'default',
      });

      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    } catch (error: any) {
      console.error('Error sending contact message:', error);
      toast({
        title: t('contact.error_title') || 'Erreur',
        description: error.message || t('contact.error_message') || 'Une erreur est survenue lors de l\'envoi de votre message. Veuillez réessayer.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{t('contact.title')}</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('contact.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle>{t('contact.form_title')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">{t('contact.first_name')} *</label>
                      <Input 
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder={t('general.first_name_placeholder')} 
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">{t('contact.last_name')} *</label>
                      <Input 
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder={t('general.last_name_placeholder')} 
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('login.email')} *</label>
                    <Input 
                      name="email"
                      type="email" 
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="email@exemple.com" 
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('contact.phone')}</label>
                    <Input 
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder={t('contact.phone_placeholder')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('contact.subject')} *</label>
                    <Input 
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder={t('general.subject_placeholder')} 
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('contact.message')} *</label>
                    <Textarea 
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder={t('general.message_placeholder')} 
                      className="min-h-[120px]"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? t('contact.sending') || 'Envoi en cours...' : t('contact.send')}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <div className="space-y-8">
              <Card>
                <CardContent className={`p-6 ${language == "ar" ? "[direction:ltr]": ''}`}>
                  <div className="flex items-start space-x-4">
                    <Mail className="h-6 w-6 text-accent mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold mb-2">{t('contact.email_title')}</h3>
                      <p className="text-gray-600 mb-1">contact@bricolaltd.com</p>
                      <p className="text-gray-600">support@bricolaltd.com</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent  className={`p-6 ${language == "ar" ? "[direction:ltr]": ''}`}>
                  <div className="flex items-start space-x-4">
                    <Phone className="h-6 w-6 text-accent mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold mb-2">{t('contact.phone_title')}</h3>
                      <p className="text-gray-600 mb-1">+44 203 996 0821</p>
                      <p className="text-sm text-gray-500">{t('contact.hours_weekdays')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent  className={`p-6 ${language == "ar" ? "[direction:ltr]": ''}`}>
                  <div className="flex items-start space-x-4">
                    <MapPin className="h-6 w-6 text-accent mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold mb-2">BRICOLA LTD</h3>
                      <p className="text-gray-600 mb-1">{t('general.registered_under')}</p>
                    </div>
                  </div>
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

export default Contact;
