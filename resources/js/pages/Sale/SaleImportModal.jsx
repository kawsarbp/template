import InputField from '@/components/custom-component/InputField';
import TextAreaField from '@/components/custom-component/TextAreaField';
import {
    BasicSelect,
    ServerSearchSelect,
} from '@/components/ui/advanced-select';
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
import { saleTypeFormOptions } from '@/lib/options';
import { debounceInterval, formSubmitErrorMessage } from '@/lib/utils';
import { router } from '@inertiajs/react';
import { Download, Loader2, Upload } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

const today = new Date();

const SaleImportModal = ({ isOpen, onClose, handleSubmitted }) => {
    const { t } = useLanguage();
    const fileInputRef = useRef(null);

    const [customerOptions, setCustomerOptions] = useState([]);
    const [customerSearch, setCustomerSearch] = useState('');
    const [customerChange, setCustomerChange] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        customer_id: '',
        sale_type: '',
        sale_date: formatDateToYMD(today),
        discount: '',
        payment: '',
        notes: '',
        file: null,
    });

    const { data: customersData, loading: isLoadingCustomers } = useAxiosFetch({
        url: `/search/customers?search=${customerSearch}`,
    });

    const debounceSelectInputChange = useDebounce((value, stateFunction) => {
        stateFunction(value);
    }, debounceInterval);

    useEffect(() => {
        if (customersData) {
            setCustomerOptions(customersData?.data);
        }
    }, [customersData]);

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
        if (formData.customer_id) {
            data.append('customer_id', formData.customer_id);
        }
        data.append('sale_type', formData.sale_type);
        data.append('sale_date', formData.sale_date);
        if (formData.discount) {
            data.append('discount', formData.discount);
        }
        if (formData.payment) {
            data.append('payment', formData.payment);
        }
        if (formData.notes) {
            data.append('notes', formData.notes);
        }
        if (formData.file) {
            data.append('file', formData.file);
        }

        router.post('/sales/import-csv', data, {
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
                        {t('Import Sales')}
                        <hr className="mt-2.5 border-border" />
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <ServerSearchSelect
                            label={t('Customer')}
                            value={customerChange}
                            onInputChange={(value) =>
                                debounceSelectInputChange(
                                    value,
                                    setCustomerSearch,
                                )
                            }
                            isLoading={isLoadingCustomers}
                            options={customerOptions}
                            onChange={(value) => {
                                setCustomerChange(value);
                                setFormData((prev) => ({
                                    ...prev,
                                    customer_id: value?.value || '',
                                }));
                            }}
                            placeholder={t('Select Customer (optional)')}
                            error={errors?.customer_id}
                        />

                        <BasicSelect
                            label={t('Sale Type')}
                            isRequired={true}
                            value={formData.sale_type}
                            onChange={(value) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    sale_type: value,
                                }))
                            }
                            options={saleTypeFormOptions}
                            placeholder={t('Select Sale Type')}
                            error={errors?.sale_type}
                        />

                        <SmartDatePicker
                            label={t('Sale Date')}
                            isRequired={true}
                            value={formData.sale_date}
                            onChange={(val) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    sale_date: val ? formatDateToYMD(val) : '',
                                }))
                            }
                            error={errors?.sale_date}
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

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <InputField
                            label={t('Discount')}
                            type="number"
                            name="discount"
                            value={formData.discount}
                            onChange={handleChange}
                            error={errors?.discount}
                        />

                        <InputField
                            label={t('Payment')}
                            type="number"
                            name="payment"
                            value={formData.payment}
                            onChange={handleChange}
                            error={errors?.payment}
                        />
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
                        href="/samples/sale-import-sample.csv"
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

export default SaleImportModal;
