import React, { useEffect, useRef, ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface PortalProps {
    children: ReactNode;
}

export const Portal: React.FC<PortalProps> = ({ children }) => {
    const portalRoot = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        // Create portal container
        const div = document.createElement('div');
        div.id = 'modal-portal';
        document.body.appendChild(div);
        portalRoot.current = div;

        return () => {
            // Cleanup on unmount
            if (portalRoot.current && document.body.contains(portalRoot.current)) {
                document.body.removeChild(portalRoot.current);
            }
        };
    }, []);

    if (!portalRoot.current) return null;

    return createPortal(children, portalRoot.current);
};
