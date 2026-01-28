import React from 'react';
import { useTranslation } from 'react-i18next';
import { Book as BookType, Highlight, StudyStatus } from '../types';
import { TagSelector } from './TagSelector';
import { StudyStatusBadge } from './StudyStatusBadge';
import { Book, Tag as TagIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface HighlightTableRowProps {
    highlight: Highlight;
    book?: BookType;
    isSelected: boolean;
    onToggleSelection: (id: string) => void;
    onEdit: (id: string) => void;
    studyStatus: StudyStatus | 'not-started';
}

export const HighlightTableRow: React.FC<HighlightTableRowProps> = ({
    highlight,
    book,
    isSelected,
    onToggleSelection,
    onEdit,
    studyStatus
}) => {
    const { t } = useTranslation('highlights');
    const formatDateShort = (dateString?: string) => {
        if (!dateString) return '-';
        try {
            return new Date(dateString).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: '2-digit',
            });
        } catch (e) {
            return dateString;
        }
    };

    return (
        <tr
            className={cn(
                "group border-b border-border hover:bg-accent/50 transition-colors duration-200",
                isSelected && "bg-primary/5"
            )}
        >
            {/* Checkbox */}
            <td className="px-md py-sm align-top w-[40px]">
                <input
                    type="checkbox"
                    className="appearance-none w-4 h-4 rounded border border-input checked:bg-primary checked:border-primary transition-colors duration-200 cursor-pointer relative top-1"
                    checked={isSelected}
                    onChange={() => onToggleSelection(highlight.id)}
                />
                <style>{`
          input[type="checkbox"]:checked {
            background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e");
          }
          .dark input[type="checkbox"]:checked {
             background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='black' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e");
          }
        `}</style>
            </td>

            {/* Book */}
            <td className="px-md py-sm align-top w-[180px] max-w-[200px]">
                <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5 text-foreground font-medium text-caption">
                        <Book className="w-3 h-3 text-muted-foreground shrink-0" />
                        <span className="truncate" title={book?.title}>{book?.title || t('table.unknownBook')}</span>
                    </div>
                    <span className="text-overline text-muted-foreground pl-md truncate" title={book?.author}>
                        {book?.author}
                    </span>
                </div>
            </td>

            {/* Highlight Text */}
            <td className="px-md py-sm align-top min-w-[300px]">
                <div
                    className="text-body leading-relaxed text-foreground cursor-pointer hover:text-muted-foreground line-clamp-3 transition-colors duration-200"
                    onClick={() => onEdit(highlight.id)}
                    title={highlight.text}
                >
                    {highlight.text}
                </div>
            </td>

            {/* Note */}
            <td className="px-md py-sm align-top w-[280px]">
                {highlight.note ? (
                    <div
                        className="text-body leading-relaxed text-foreground cursor-pointer hover:text-muted-foreground line-clamp-3 transition-colors duration-200"
                        onClick={() => onEdit(highlight.id)}
                        title={highlight.note}
                    >
                        {highlight.note}
                    </div>
                ) : (
                    <button
                        onClick={() => onEdit(highlight.id)}
                        className="text-overline text-muted-foreground/50 hover:text-muted-foreground transition-colors duration-200 italic group-hover:block"
                    >
                        {t('table.addNote')}
                    </button>
                )}
            </td>

            {/* Tags */}
            <td className="px-md py-sm align-top w-[140px]">
                <div className="flex items-start">
                    <TagSelector highlightId={highlight.id} bookId={highlight.bookId} variant="minimal" />
                </div>
            </td>

            {/* Date */}
            <td className="px-md py-sm align-top whitespace-nowrap w-[80px] text-muted-foreground text-overline font-medium pt-md">
                {formatDateShort(highlight.dateAdded)}
            </td>

            {/* Status */}
            <td className="px-md py-sm align-top w-[90px] pt-sm">
                <StudyStatusBadge status={studyStatus} />
            </td>
        </tr>
    );
};
