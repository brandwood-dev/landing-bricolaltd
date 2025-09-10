import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Eye } from 'lucide-react';
import { Request } from './types';

interface CancellationDetailsDialogProps {
  request: Request;
}

const CancellationDetailsDialog: React.FC<CancellationDetailsDialogProps> = ({ request }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="h-4 w-4 mr-1" />
          Voir détails de l'annulation
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Détails de l'annulation</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <strong>Raison :</strong> {request.cancellationReason}
          </div>
          {request.cancellationMessage && (
            <div>
              <strong>Message :</strong> {request.cancellationMessage}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CancellationDetailsDialog;