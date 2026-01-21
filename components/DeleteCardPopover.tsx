import React from 'react';
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
  return (
    <AlertDialog open={true} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <AlertDialogContent className="max-w-xs">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-sm">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            Delete this card?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs">
            This will remove the card from your study system. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="text-xs">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
