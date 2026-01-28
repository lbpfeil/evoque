import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

interface EmptyDeckPopoverProps {
  onClose: () => void;
}

export const EmptyDeckPopover: React.FC<EmptyDeckPopoverProps> = ({ onClose }) => {
  const { t } = useTranslation('study');

  return (
    <AlertDialog open={true} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <AlertDialogContent className="max-w-xs">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-sm text-body">
            <AlertCircle className="w-4 h-4 text-learning" />
            {t('emptyDeck.title')}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-caption">
            {t('emptyDeck.message')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onClose} className="text-caption">
            {t('common:buttons.confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
