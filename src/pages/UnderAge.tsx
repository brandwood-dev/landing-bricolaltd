import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

const UnderAge = () => {
  const {t, language} = useLanguage();
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader className="items-center justify-center">
          <CardTitle className="text-2xl font-bold text-primary ">
            {t('underAge.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground leading-relaxed">
            {t('underAge.message')}
            <br /><br />
            {t('underAge.message2')}
          </p>
          <Button asChild variant="outline" className="w-full">
            <Link to="/cgu">
              {t('underAge.cguButton')}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnderAge;