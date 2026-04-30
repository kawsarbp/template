import { useLanguage } from '@/hooks/useLanguage';
import { useEffect, useRef } from 'react';
import Viewer from 'viewerjs';

const GalleryViewer = ({ images = [], className = '' }) => {
    const { t } = useLanguage();
    const galleryRef = useRef(null);

    useEffect(() => {
        let viewer = null;
        if (galleryRef.current && images.length > 0) {
            viewer = new Viewer(galleryRef.current, {
                navbar: true,
                toolbar: true,
            });
        }
        return () => {
            if (viewer) {
                viewer.destroy();
            }
        };
    }, [images]);

    if (!images || images.length === 0) {
        return (
            <p className="py-4 text-center text-sm text-muted-foreground italic">
                {t('No photos available')}
            </p>
        );
    }

    return (
        <div ref={galleryRef} className={`flex flex-wrap gap-3 ${className}`}>
            {images.map((url, index) => (
                <div
                    key={index}
                    className="group relative cursor-pointer overflow-hidden rounded-lg border border-border transition-all hover:border-primary/50"
                >
                    <img
                        src={url}
                        alt={`Gallery Image ${index + 1}`}
                        className="h-20 w-20 object-cover"
                    />
                </div>
            ))}
        </div>
    );
};

export default GalleryViewer;
