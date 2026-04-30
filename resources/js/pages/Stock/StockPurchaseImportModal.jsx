import InputField from '@/components/custom-component/InputField';
import TextAreaField from '@/components/custom-component/TextAreaField';
import { ServerSearchSelect } from '@/components/ui/advanced-select';
import { Button } from '@/components/ui/button';
import { SmartDatePicker } from '@/components/ui/date-picker/DatePicker';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import useAxiosFetch from '@/hooks/useAxiosFetch';
import useDebounce from '@/hooks/useDebounce';
import { useLanguage } from '@/hooks/useLanguage';
import { formatDateToYMD } from '@/lib/helper';
import { debounceInterval, formSubmitErrorMessage } from '@/lib/utils';
import { router } from '@inertiajs/react';
import { Download, Loader2, Upload } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

const today = new Date();

const StockPurchaseImportModal = ({ isOpen, onClose, handleSubmitted }) => {
    const { t } = useLanguage();
    const fileInputRef = useRef(null);

    const [supplierOptions, setSupplierOptions] = useState([]);
    const [supplierSearch, setSupplierSearch] = useState('');
    const [supplierChange, setSupplierChange] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        batch_number: '',
        supplier_id: '',
        purchase_date: formatDateToYMD(today),
        discount: 0,
        notes: '',
        file: null,
    });

    const { data: suppliersData, loading: isLoadingSuppliers } = useAxiosFetch({
        url: `/search/suppliers?search=${supplierSearch}`,
    });

    const debounceSelectInputChange = useDebounce((value, stateFunction) => {
        stateFunction(value);
    }, debounceInterval);

    useEffect(() => {
        if (suppliersData) {
            setSupplierOptions(suppliersData?.data);
        }
    }, [suppliersData]);

    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            toast.error(formSubmitErrorMessage);
        }
    }, [JSON.stringify(errors)]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0] || null;
        setFormData((prev) => ({ ...prev, file }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrors({});
        setProcessing(true);

        const data = new FormData();
        data.append('batch_number', formData.batch_number);
        data.append('supplier_id', formData.supplier_id);
        data.append('purchase_date', formData.purchase_date);
        if (formData.discount) {
            data.append('discount', formData.discount);
        }
        if (formData.notes) {
            data.append('notes', formData.notes);
        }
        if (formData.file) {
            data.append('file', formData.file);
        }

        router.post('/stock-purchases/import-csv', data, {
            forceFormData: true,
            preserveScroll: true,
            preserveState: true,
            onSuccess: (response) => {
                setProcessing(false);
                handleSubmitted({ responseFlashMessage: response });
            },
            onError: (responseErrors) => {
                setProcessing(false);
                setErrors(responseErrors);
            },
        });
    };

    // Collect row-level import errors
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
            <DialogContent className="custom-scrollbar max-h-[calc(100vh-5rem)] overflow-y-auto rounded-xl border-border shadow-lg sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold tracking-tight text-foreground">
                        {t('Import Stock Purchases')}
                        <hr className="mt-2.5 border-border" />
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <InputField
                            label={t('GLOT')}
                            isRequired={true}
                            name="batch_number"
                            value={formData.batch_number}
                            onChange={handleChange}
                            error={errors?.batch_number}
                            placeholder={t('Enter GLOT number')}
                        />

                        <ServerSearchSelect
                            label={t('Supplier')}
                            isRequired={true}
                            value={supplierChange}
                            onInputChange={(value) =>
                                debounceSelectInputChange(
                                    value,
                                    setSupplierSearch,
                                )
                            }
                            isLoading={isLoadingSuppliers}
                            options={supplierOptions}
                            onChange={(value) => {
                                setSupplierChange(value);
                                setFormData((prev) => ({
                                    ...prev,
                                    supplier_id: value?.value || '',
                                }));
                            }}
                            placeholder={t('Select Supplier')}
                            error={errors?.supplier_id}
                        />

                        <SmartDatePicker
                            label={t('Purchase Date')}
                            isRequired={true}
                            value={formData.purchase_date}
                            onChange={(val) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    purchase_date: val,
                                }))
                            }
                            error={errors?.purchase_date}
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <InputField
                            label={t('Discount')}
                            type="number"
                            name="discount"
                            value={formData.discount}
                            onChange={handleChange}
                            error={errors?.discount}
                        />

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
                        </div>
                    </div>

                    <TextAreaField
                        label={t('Notes')}
                        className="min-h-16"
                        name="notes"
                        placeholder={t('Enter notes')}
                        value={formData.notes}
                        onChange={handleChange}
                        error={errors?.notes}
                    />

                    <a
                        href="/samples/stock-purchase-import-sample.csv"
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

export default StockPurchaseImportModal;
