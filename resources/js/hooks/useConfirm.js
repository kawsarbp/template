
import { ConfirmationDialog } from '@/components/custom-component/ConfirmationDialog';
import React, { useState } from 'react';

export const useConfirm = () => {
    const [promise, setPromise] = useState(null);

    const confirm = (data) => new Promise((resolve) => {
        setPromise({ resolve, ...data });
    });

    const handleClose = () => setPromise(null);

    const handleConfirm = () => {
        promise?.resolve(true);
        handleClose();
    };

    const handleCancel = () => {
        promise?.resolve(false);
        handleClose();
    };

    const ConfirmationComponent = () => React.createElement(ConfirmationDialog, {
        open: promise !== null,
        onOpenChange: handleCancel,
        onConfirm: handleConfirm,
        onCancel: handleCancel,
        ...promise
    });

    return [ConfirmationComponent, confirm];
};
