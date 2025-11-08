import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Star } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ReviewDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (rating: number, comment: string, bookingId?: string, toolId?: string, revieweeId?: string, reviewerId?: string) => void;
  bookingId?: string;
  toolId?: string;
  revieweeId?: string;
  reviewerId?: string;
  titleKey?: string; // optional custom title translation key
}

const ReviewDialog: React.FC<ReviewDialogProps> = ({
  isOpen,
  onOpenChange,
  onSubmit,
  bookingId,
  toolId,
  revieweeId,
  reviewerId,
  titleKey
}) => {
  const [rating, setRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');

  const handleSubmit = () => {
    onSubmit(rating, reviewComment, bookingId, toolId, revieweeId, reviewerId);
    setRating(0);
    setReviewComment('');
  };
  const { t,language } = useLanguage();
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className={language === 'ar' ? '[direction:ltr]' : ''}>
          <DialogTitle>{t(titleKey || 'review.modaltitle')}</DialogTitle>
        </DialogHeader>
        <div className={"space-y-4"}>
          <div>
            <label className="block text-sm font-medium mb-2">{t('review.rate')}</label>
            <div className={"flex gap-1 "+ (language === 'ar' ? '[direction:ltr]' : '')}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`p-1 ${star <= rating ? 'text-yellow-500' : 'text-gray-300'}`}
                >
                  <Star className="h-6 w-6 fill-current" />
                </button>
              ))}
            </div>
          </div> 
          <div>
            <label className="block text-sm font-medium mb-2">{t('review.comment')}</label>
            <Textarea
              placeholder={t('review.placeholdercomm')}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
            />
          </div>
          <Button onClick={handleSubmit} className="w-full">
            {t('review.submitbtn')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewDialog;