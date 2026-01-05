import React from 'react';
import { AlertCircle } from 'lucide-react';

interface EmptyDeckPopoverProps {
    onClose: () => void;
}

export const EmptyDeckPopover: React.FC<EmptyDeckPopoverProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50" onClick={onClose}>
            <div
                className="bg-white dark:bg-zinc-900 rounded-md shadow-lg border border-zinc-200 dark:border-zinc-800 p-4 max-w-xs mx-4"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                            No cards available
                        </h3>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            All reviews for this deck are completed today. Come back tomorrow for more!
                        </p>
                    </div>
                </div>
                <div className="mt-3 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-3 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
                    >
                        Got it
                    </button>
                </div>
            </div>
        </div>
    );
};
