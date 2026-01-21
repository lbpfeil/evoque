import React from 'react';
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
  return (
    <AlertDialog open={true} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <AlertDialogContent className="max-w-xs">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-sm">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            No cards available
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs">
            All reviews for this deck are completed today. Come back tomorrow for more!
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onClose} className="text-xs">
            Got it
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
