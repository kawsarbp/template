import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export const usePortal = (containerId) => {
    const [container, setContainer] = useState(null);

    useEffect(() => {
        const portalContainer = document.createElement('div');
        portalContainer.id = containerId;
        document.body.appendChild(portalContainer);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setContainer(portalContainer);

        // Cleanup function to remove portal container from the DOM when component unmounts
        return () => {
            document.body.removeChild(portalContainer);
        };
    }, [containerId]);

    // Function to render children into the portal container
    const portal = (children) => {
        if (container) {
            return createPortal(children, container);
        } else {
            return null;
        }
    };

    return portal;
}