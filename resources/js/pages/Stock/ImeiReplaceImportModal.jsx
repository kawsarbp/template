import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useLanguage } from '@/hooks/useLanguage';
import { formSubmitErrorMessage } from '@/lib/utils';
import { router } from '@inertiajs/react';
import { Download, Loader2, Upload } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

const ImeiReplaceImportModal = ({ isOpen, onClose, handleSubmitted }) => {
    const { t } = useLanguage();
    const fileInputRef = useRef(null);

    const [file, setFile] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            toast.error(formSubmitErrorMessage);
        }
    }, [JSON.stringify(errors)]);

    const handleFileChange = (e) => {
        setFile(e.target.files?.[0] || null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrors({});
        setProcessing(true);

        const data = new FormData();
        if (file) {
            data.append('file', file);
        }

        router.post('/stocks/import-imei-replace', data, {
            forceFormData: true,
            preserveScroll: true,
            preserveState: true,
            onSuccess: (response) => {
                setProcessing(false);
                setFile(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                handleSubmitted({ responseFlashMessage: response });
            },
            onError: (responseErrors) => {
                setProcessing(false);
                setErrors(responseErrors);
            },
        });
    };

    const rowErrors = Object.entries(errors)
        .filter(([key]) => key.startsWith('row_'))
        .map(([, message]) => message);

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(_, event) => {
                if (event.reason === 'outside-press') return;
                onClose();
            }}
        >
            <DialogContent className="custom-scrollbar max-h-[calc(100vh-5rem)] overflow-y-auto rounded-xl border-border shadow-lg sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold tracking-tight text-foreground">
                        {t('Replace IMEI Numbers')}
                        <hr className="mt-2.5 border-border" />
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-foreground">
                            {t('CSV File')}{' '}
                            <span className="text-destructive">*</span>
                        </label>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv,.txt"
                            onChange={handleFileChange}
                            className="flex h-9 w-full rounded-md border border-border bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        />
                        {errors?.file && (
                            <p className="mt-1 text-xs text-destructive">
                                {errors.file}
                            </p>
                        )}
                        <p className="mt-1.5 text-xs text-muted-foreground">
                            {t(
                                'CSV must have two columns: old_imei and new_imei. Old IMEI must be available; new IMEI must be unique.',
                            )}
                        </p>
                    </div>

                    <a
                        href="/samples/imei-replace-import-sample.csv"
                        download
                        className="inline-flex items-center gap-1.5 text-sm text-primary underline-offset-4 hover:underline"
                    >
                        <Download className="h-3.5 w-3.5" />
                        {t('Download Sample CSV')}
                    </a>

                    {rowErrors.length > 0 && (
                        <div className="max-h-40 overflow-y-auto rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                            <p className="mb-2 text-sm font-medium text-destructive">
                                {t('Import Errors:')}
                            </p>
                            <ul className="space-y-1">
                                {rowErrors.map((error, i) => (
                                    <li
                                        key={i}
                                        className="text-xs text-destructive"
                                    >
                                        {error}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="flex flex-wrap items-center justify-end gap-3 pt-4">
                        <Button
                            variant="accent"
                            type="button"
                            onClick={onClose}
                        >
                            {t('Cancel')}
                        </Button>
                        <Button
                            variant="gradient"
                            type="submit"
                            disabled={processing}
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {t('Importing...')}
                                </>
                            ) : (
                                <>
                                    <Upload className="mr-1 h-4 w-4" />
                                    {t('Import')}
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ImeiReplaceImportModal;
