import { useEffect, useRef } from 'react';
import Viewer from 'viewerjs';

const ThumbnailViewer = ({ imageUrl }) => {
    const viewerRef = useRef(null);

    useEffect(() => {
        const viewer = new Viewer(viewerRef.current);

        return () => {
            viewer.destroy();
        };
    }, [imageUrl]);

    return (
        <>
            <div
                ref={viewerRef}
                className="flex cursor-pointer flex-wrap justify-center gap-x-2 gap-y-2 lg:justify-start"
            >
                <img src={imageUrl} width="70" height="70" alt={'photo'} />
            </div>
        </>
    );
};

export default ThumbnailViewer;
