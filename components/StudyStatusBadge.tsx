import React from 'react';
import { StudyStatus } from '../types';
import { cn } from '../lib/utils';
import { Circle, Clock, CheckCircle2, CircleDashed } from 'lucide-react';

interface StudyStatusBadgeProps {
    status: StudyStatus | 'not-started';
    className?: string;
}

export const StudyStatusBadge: React.FC<StudyStatusBadgeProps> = ({ status, className }) => {
    switch (status) {
        case 'review':
            return (
                <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-[10px] uppercase font-bold tracking-wider rounded-full border border-green-100 dark:border-green-800/50", className)}>
                    <CheckCircle2 className="w-3 h-3" />
                    Review
                </span>
            );
        case 'learning':
            return (
                <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-[10px] uppercase font-bold tracking-wider rounded-full border border-blue-100 dark:border-blue-800/50", className)}>
                    <Clock className="w-3 h-3" />
                    Learning
                </span>
            );
        case 'new':
            return (
                <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 text-[10px] uppercase font-bold tracking-wider rounded-full border border-yellow-100 dark:border-yellow-800/50", className)}>
                    <Circle className="w-3 h-3 fill-current" />
                    New
                </span>
            );
        default:
            return (
                <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 bg-muted text-muted-foreground text-[10px] uppercase font-bold tracking-wider rounded-full border border-border", className)}>
                    <CircleDashed className="w-3 h-3" />
                    Not Started
                </span>
            );
    }
};
