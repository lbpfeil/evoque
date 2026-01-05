import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface DeleteCardPopoverProps {
    onConfirm: () => void;
    onCancel: () => void;
}

export const DeleteCardPopover: React.FC<DeleteCardPopoverProps> = ({ onConfirm, onCancel }) => {
    return (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50" onClick={onCancel}>
            <div
                className="bg-white dark:bg-zinc-900 rounded-md shadow-lg border border-zinc-200 dark:border-zinc-800 p-4 max-w-xs mx-4"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                            Delete this card?
                        </h3>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            This will remove the card from your study system. This action cannot be undone.
                        </p>
                    </div>
                </div>
                <div className="mt-3 flex justify-end gap-2">
                    <button
                        onClick={onCancel}
                        className="px-3 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-3 py-1 text-xs font-medium text-white bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700 rounded transition-colors"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};
