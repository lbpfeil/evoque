import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

interface DeleteCardPopoverProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteCardPopover: React.FC<DeleteCardPopoverProps> = ({ onConfirm, onCancel }) => {
  const { t } = useTranslation('session');

  return (
    <AlertDialog open={true} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <AlertDialogContent className="max-w-xs">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-sm text-body">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            {t('deleteCard.title')}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-caption">
            {t('deleteCard.message')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="text-caption">{t('common:buttons.cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-caption"
          >
            {t('common:buttons.delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
