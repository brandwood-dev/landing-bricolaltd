
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { contactService, CreateContactData } from '@/services/contactService';

const Contact = () => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    category: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field error when user starts typing
    if (fieldErrors[name as keyof typeof fieldErrors]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear field error when user selects a value
    if (fieldErrors[name as keyof typeof fieldErrors]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Fonction de validation d'un champ spécifique
  const validateField = (fieldName: string, value: string) => {
    switch (fieldName) {
      case 'firstName':
        if (!value.trim()) {
          return t('contact.validation.firstName_required') || 'Le prénom est obligatoire.';
        } else if (value.trim().length < 2) {
          return t('contact.validation.firstName_min_length') || 'Le prénom doit contenir au moins 2 caractères.';
        }
        break;
      case 'lastName':
        if (!value.trim()) {
          return t('contact.validation.lastName_required') || 'Le nom est obligatoire.';
        } else if (value.trim().length < 2) {
          return t('contact.validation.lastName_min_length') || 'Le nom doit contenir au moins 2 caractères.';
        }
        break;
      case 'email':
        if (!value.trim()) {
          return t('contact.validation.email_required') || 'L\'email est obligatoire.';
        } else {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value.trim())) {
            return t('contact.validation.email_invalid') || 'Le format de l\'email n\'est pas valide.';
          }
        }
        break;
      case 'category':
        if (!value.trim()) {
          return t('contact.validation.category_required') || 'La catégorie est obligatoire.';
        }
        break;
      case 'subject':
        if (!value.trim()) {
          return t('contact.validation.subject_required') || 'Le sujet est obligatoire.';
        } else if (value.trim().length < 5) {
          return t('contact.validation.subject_min_length') || 'Le sujet doit contenir au moins 5 caractères.';
        }
        break;
      case 'message':
        if (!value.trim()) {
          return t('contact.validation.message_required') || 'Le message est obligatoire.';
        } else if (value.trim().length < 10) {
          return t('contact.validation.message_min_length') || 'Le message doit contenir au moins 10 caractères.';
        }
        break;
      case 'phone':
        if (value.trim()) {
          const phoneRegex = /^[\+]?[1-9][\d\s\-\(\)]{7,15}$/;
          if (!phoneRegex.test(value.trim())) {
            return t('contact.validation.phone_invalid') || 'Le format du numéro de téléphone n\'est pas valide.';
          }
        }
        break;
    }
    return '';
  };

  // Fonction de validation complète
  const validateForm = () => {
    const errors = {
      firstName: validateField('firstName', formData.firstName),
      lastName: validateField('lastName', formData.lastName),
      email: validateField('email', formData.email),
      phone: validateField('phone', formData.phone),
      category: validateField('category', formData.category),
      subject: validateField('subject', formData.subject),
      message: validateField('message', formData.message)
    };
    
    setFieldErrors(errors);
    return !Object.values(errors).some(error => error !== '');
  };

  // Gestionnaire pour la validation en temps réel
  const handleFieldBlur = (fieldName: string, value: string) => {
    const error = validateField(fieldName, value);
    setFieldErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation du formulaire
    const isValid = validateForm();
    
    if (!isValid) {
      // Show first error found
      const firstError = Object.values(fieldErrors).find(error => error !== '');
      if (firstError) {
        toast({
          title: t('general.error'),
          description: firstError,
          variant: 'destructive',
        });
      }
      return;
    }

    setIsSubmitting(true);
    
    try {
      const contactData: CreateContactData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone || undefined,
      category: formData.category,
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
        category: '',
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
    <div className='min-h-screen bg-background'>
      <Header />
      <main className='py-20'>
        <div className='max-w-6xl mx-auto px-4'>
          {/* Hero Section */}
          <div className='text-center mb-16'>
            <h1 className='text-4xl md:text-5xl font-bold mb-6'>
              {t('contact.title')}
            </h1>
            <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
              {t('contact.subtitle')}
            </p>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-12'>
            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle>{t('contact.form_title')}</CardTitle>
              </CardHeader>
              <CardContent className='space-y-6'>
                <form onSubmit={handleSubmit} className='space-y-6'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-sm font-medium mb-2'>
                        {t('contact.first_name')} *
                      </label>
                      <Input
                        name='firstName'
                        value={formData.firstName}
                        onChange={handleInputChange}
                        onBlur={(e) => handleFieldBlur('firstName', e.target.value)}
                        placeholder={t('general.first_name_placeholder')}
                        className={fieldErrors.firstName ? 'border-red-500' : ''}
                        required
                      />
                      {fieldErrors.firstName && (
                        <p className="mt-1 text-sm text-red-600">{fieldErrors.firstName}</p>
                      )}
                    </div>
                    <div>
                      <label className='block text-sm font-medium mb-2'>
                        {t('contact.last_name')} *
                      </label>
                      <Input
                        name='lastName'
                        value={formData.lastName}
                        onChange={handleInputChange}
                        onBlur={(e) => handleFieldBlur('lastName', e.target.value)}
                        placeholder={t('general.last_name_placeholder')}
                        className={fieldErrors.lastName ? 'border-red-500' : ''}
                        required
                      />
                      {fieldErrors.lastName && (
                        <p className="mt-1 text-sm text-red-600">{fieldErrors.lastName}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className='block text-sm font-medium mb-2'>
                      {t('login.email')} *
                    </label>
                    <Input
                      name='email'
                      type='email'
                      value={formData.email}
                      onChange={handleInputChange}
                      onBlur={(e) => handleFieldBlur('email', e.target.value)}
                      placeholder='email@exemple.com'
                      className={fieldErrors.email ? 'border-red-500' : ''}
                      required
                    />
                    {fieldErrors.email && (
                      <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
                    )}
                  </div>
                  <div>
                    <label className='block text-sm font-medium mb-2'>
                      {t('contact.phone')}
                    </label>
                    <Input
                      name='phone'
                      type='tel'
                      value={formData.phone}
                      onChange={handleInputChange}
                      onBlur={(e) => handleFieldBlur('phone', e.target.value)}
                      placeholder={t('contact.phone_placeholder')}
                      className={fieldErrors.phone ? 'border-red-500' : ''}
                    />
                    {fieldErrors.phone && (
                      <p className="mt-1 text-sm text-red-600">{fieldErrors.phone}</p>
                    )}
                  </div>
                  <div>
                    <label className='block text-sm font-medium mb-2'>
                      {t('contact.category.label')} 
                    </label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => handleSelectChange('category', value)}
                    >
                      <SelectTrigger className={fieldErrors.category ? 'border-red-500' : ''}>
                        <SelectValue placeholder={t('contact.category.placeholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technical">{t('contact.category.technical')}</SelectItem>
                        <SelectItem value="payment">{t('contact.category.payment')}</SelectItem>
                        <SelectItem value="account">{t('contact.category.account')}</SelectItem>
                        <SelectItem value="dispute">{t('contact.category.dispute')}</SelectItem>
                        <SelectItem value="suggestion">{t('contact.category.suggestion')}</SelectItem>
                        <SelectItem value="other">{t('contact.category.other')}</SelectItem>
                      </SelectContent>
                    </Select>
                    {fieldErrors.category && (
                      <p className="mt-1 text-sm text-red-600">{fieldErrors.category}</p>
                    )}
                  </div>
                  <div>
                    <label className='block text-sm font-medium mb-2'>
                      {t('contact.subject')} *
                    </label>
                    <Input
                      name='subject'
                      value={formData.subject}
                      onChange={handleInputChange}
                      onBlur={(e) => handleFieldBlur('subject', e.target.value)}
                      placeholder={t('general.subject_placeholder')}
                      className={fieldErrors.subject ? 'border-red-500' : ''}
                      required
                    />
                    {fieldErrors.subject && (
                      <p className="mt-1 text-sm text-red-600">{fieldErrors.subject}</p>
                    )}
                  </div>
                  <div>
                    <label className='block text-sm font-medium mb-2'>
                      {t('contact.message')} *
                    </label>
                    <Textarea
                      name='message'
                      value={formData.message}
                      onChange={handleInputChange}
                      onBlur={(e) => handleFieldBlur('message', e.target.value)}
                      placeholder={t('general.message_placeholder')}
                      className={`min-h-[120px] ${fieldErrors.message ? 'border-red-500' : ''}`}
                      required
                    />
                    {fieldErrors.message && (
                      <p className="mt-1 text-sm text-red-600">{fieldErrors.message}</p>
                    )}
                  </div>
                  <Button
                    type='submit'
                    size='lg'
                    className='w-full'
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? t('contact.sending') || 'Envoi en cours...'
                      : t('contact.send')}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <div className='space-y-8'>
              <Card>
                <CardContent
                  className={`p-6 ${language == 'ar' ? '[direction:ltr]' : ''}`}
                >
                  <div className='flex items-start space-x-4'>
                    <Mail className='h-6 w-6 text-accent mt-1' />
                    <div>
                      <h3 className='text-lg font-semibold mb-2'>
                        {t('contact.email_title')}
                      </h3>
                      <p className='text-gray-600 mb-1'>
                        contact@bricolaltd.com
                      </p>
                      <p className='text-gray-600'>support@bricolaltd.com</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent
                  className={`p-6 ${language == 'ar' ? '[direction:ltr]' : ''}`}
                >
                  <div className='flex items-start space-x-4'>
                    <Phone className='h-6 w-6 text-accent mt-1' />
                    <div>
                      <h3 className='text-lg font-semibold mb-2'>
                        {t('contact.phone_title')}
                      </h3>
                      <p className='text-gray-600 mb-1'>+44 7782 333 879</p>
                      <p className='text-sm text-gray-500'>
                        {t('contact.hours_weekdays')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent
                  className={`p-6 ${language == 'ar' ? '[direction:ltr]' : ''}`}
                >
                  <div className='flex items-start space-x-4'>
                    <MapPin className='h-6 w-6 text-accent mt-1' />
                    <div>
                      <h3 className='text-lg font-semibold mb-2'>
                        BRICOLA LTD
                      </h3>
                      <p className='text-gray-600 mb-1'>
                        {t('general.registered_under')}
                      </p>
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
  )
};

export default Contact;
