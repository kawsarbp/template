import InputField from '@/components/custom-component/InputField';
import TextAreaField from '@/components/custom-component/TextAreaField';
import { FileUpload } from '@/components/FileUpload';
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
import { useForm } from '@inertiajs/react';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

const today = new Date();

const emptyItem = {
    product_id: '',
    quantity: 1,
    unit_price: '',
    sale_price: '',
    condition_id: '',
    imeis: '',
};

const initialInputField = {
    batch_number: '',
    supplier_id: '',
    exchange_rate: '',
    purchase_date: formatDateToYMD(today),
    discount: 0,
    notes: '',
    items: [{ ...emptyItem }],
    attachment: [],
};

const StockPurchaseModal = ({
    isOpen,
    onClose,
    handleSubmitted,
    editData = {},
}) => {
    const { t } = useLanguage();
    const isEditMode = !!editData?.id;
    const [files, setFiles] = useState([]);

    // Supplier search
    const [supplierOptions, setSupplierOptions] = useState([]);
    const [supplierSearch, setSupplierSearch] = useState('');
    const [supplierChange, setSupplierChange] = useState(null);
    const [supplierCurrency, setSupplierCurrency] = useState('AED');

    // Product search per item row
    const [productOptionsMap, setProductOptionsMap] = useState({});
    const [productSearchMap, setProductSearchMap] = useState({});
    const [productChangeMap, setProductChangeMap] = useState({});

    // Condition search per item row
    const [conditionOptionsMap, setConditionOptionsMap] = useState({});
    const [conditionSearchMap, setConditionSearchMap] = useState({});
    const [conditionChangeMap, setConditionChangeMap] = useState({});

    const { data: suppliersData, loading: isLoadingSuppliers } = useAxiosFetch({
        url: `/search/suppliers?search=${supplierSearch}`,
    });

    const { loading: isLoading, data: purchaseData } = useAxiosFetch({
        url: `/stock-purchases/${editData?.id}`,
        skip: !isEditMode,
    });

    const debounceSelectInputChange = useDebounce((value, stateFunction) => {
        stateFunction(value);
    }, debounceInterval);

    useEffect(() => {
        if (suppliersData) {
            setSupplierOptions(suppliersData?.data);
        }
    }, [suppliersData]);

    const {
        data: initialData,
        setData: setInitialData,
        put,
        post,
        processing,
        errors,
        clearErrors,
    } = useForm(initialInputField);

    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            toast.error(formSubmitErrorMessage);
        }
    }, [JSON.stringify(errors)]);

    useEffect(() => {
        if (purchaseData && isEditMode) {
            const pd = purchaseData?.data;
            setInitialData({
                batch_number: pd?.batch_number || '',
                supplier_id: pd?.supplier_id || '',
                exchange_rate: pd?.exchange_rate || '',
                purchase_date: pd?.purchase_date || formatDateToYMD(today),
                discount: pd?.discount || 0,
                notes: pd?.notes || '',
                items: [{ ...emptyItem }],
            });
            setSupplierCurrency(pd?.supplier_currency || pd?.currency || 'AED');
            if (pd?.supplier_id && pd?.supplier_name) {
                setSupplierChange({
                    value: pd.supplier_id,
                    label: pd.supplier_name,
                });
            }
            if (
                purchaseData?.data?.attachment &&
                Array.isArray(purchaseData?.data?.attachment)
            ) {
                const existingFiles = purchaseData.data.attachment.map(
                    (url) => ({
                        id: url,
                        name: url.split('/').pop(),
                        preview: url,
                        status: 'success',
                        serverUrl: url,
                        size: 0,
                        type: url.includes('.pdf')
                            ? 'application/pdf'
                            : 'image/jpeg',
                    }),
                );
                setFiles(existingFiles);
            }
        }
    }, [purchaseData]);

    // Sync files to initialData.photos
    useEffect(() => {
        const uploadedUrls = files
            .filter((f) => f.status === 'success' && f.serverUrl)
            .map((f) => f.serverUrl);
        setInitialData((prev) => ({ ...prev, attachment: uploadedUrls }));
    }, [files]);

    const handleChange = (e) => {
        const name = e.target.name;
        const value = e.target.value;
        setInitialData({ ...initialData, [name]: value });
    };

    const handleItemChange = (index, field, value) => {
        const updatedItems = [...initialData.items];
        updatedItems[index] = { ...updatedItems[index], [field]: value };
        setInitialData({ ...initialData, items: updatedItems });
    };

    const addItem = () => {
        setInitialData({
            ...initialData,
            items: [...initialData.items, { ...emptyItem }],
        });
    };

    const removeItem = (index) => {
        if (initialData.items.length <= 1) return;
        const updatedItems = initialData.items.filter((_, i) => i !== index);
        setInitialData({ ...initialData, items: updatedItems });
    };

    const totalUnits = initialData.items.reduce(
        (sum, item) => sum + (parseInt(item.quantity) || 0),
        0,
    );
    const totalAmount = initialData.items.reduce(
        (sum, item) =>
            sum +
            (parseInt(item.quantity) || 0) * (parseFloat(item.unit_price) || 0),
        0,
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        clearErrors();

        const submitData = {
            ...initialData,
            items: initialData.items.map((item) => ({
                ...item,
                imeis: item.imeis
                    ? item.imeis
                          .split('\n')
                          .map((s) => s.trim())
                          .filter(Boolean)
                    : [],
            })),
        };

        if (isEditMode) {
            put(`/stock-purchases/${editData?.id}`, {
                data: {
                    batch_number: submitData.batch_number,
                    supplier_id: submitData.supplier_id,
                    exchange_rate: submitData.exchange_rate,
                    purchase_date: submitData.purchase_date,
                    discount: submitData.discount,
                    notes: submitData.notes,
                },
                onSuccess: (response) => {
                    handleSubmitted({
                        responseFlashMessage: response,
                        updateData: submitData,
                    });
                },
                preserveScroll: true,
                preserveState: true,
            });
        } else {
            post('/stock-purchases', {
                data: submitData,
                onSuccess: (response) => {
                    handleSubmitted({ responseFlashMessage: response });
                },
                preserveScroll: true,
                preserveState: true,
            });
        }
    };

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(_, event) => {
                if (event.reason === 'outside-press') return;
                onClose();
            }}
        >
            <DialogContent className="custom-scrollbar max-h-[calc(100vh-5rem)] overflow-y-auto rounded-xl border-border shadow-lg sm:max-w-[1000px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold tracking-tight text-foreground">
                        {isEditMode
                            ? t('Update Stock Purchase')
                            : t('Create Stock Purchase')}
                        <hr className="mt-2.5 border-border" />
                    </DialogTitle>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex items-center justify-center">
                        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6 py-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <InputField
                                label={t('GLOT')}
                                isRequired={true}
                                name="batch_number"
                                value={initialData?.batch_number}
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
                                    setSupplierCurrency(value?.currency || 'AED');
                                    setInitialData((prev) => ({
                                        ...prev,
                                        supplier_id: value?.value || '',
                                        exchange_rate: '',
                                    }));
                                }}
                                placeholder={t('Select Supplier')}
                                error={errors?.supplier_id}
                            />

                            {supplierCurrency === 'HKD' && (
                                <InputField
                                    label={t('Exchange Rate (HKD → AED)')}
                                    isRequired={true}
                                    type="number"
                                    step="0.000001"
                                    name="exchange_rate"
                                    value={initialData?.exchange_rate}
                                    onChange={handleChange}
                                    error={errors?.exchange_rate}
                                    placeholder={t('e.g. 0.48')}
                                />
                            )}

                            <SmartDatePicker
                                label={t('Purchase Date')}
                                isRequired={true}
                                value={initialData?.purchase_date}
                                onChange={(val) =>
                                    setInitialData({
                                        ...initialData,
                                        purchase_date: formatDateToYMD(val),
                                    })
                                }
                                error={errors?.purchase_date}
                            />

                            <InputField
                                label={t('Discount')}
                                type="number"
                                name="discount"
                                value={initialData?.discount}
                                onChange={handleChange}
                                error={errors?.discount}
                            />
                        </div>

                        <TextAreaField
                            label={t('Notes')}
                            className="min-h-16"
                            name="notes"
                            placeholder={t('Enter notes')}
                            value={initialData?.notes}
                            onChange={handleChange}
                            error={errors?.notes}
                        />

                        <div>
                            <h1 className="mb-1">Attachment</h1>
                            <FileUpload
                                files={files}
                                setFiles={setFiles}
                                accept="image/*,application/pdf"
                                endpoint="/stocks/upload-attachment"
                                fileName="attachment"
                            />
                        </div>

                        {/* Items Section */}
                        {isEditMode ? (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-foreground">
                                    {t('Items')}
                                </h3>
                                {purchaseData?.data?.items?.length > 0 ? (
                                    <div className="overflow-x-auto rounded-lg border border-border">
                                        <table className="w-full text-sm">
                                            <thead className="bg-muted/50">
                                                <tr>
                                                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                                                        {t('Product')}
                                                    </th>
                                                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                                                        {t('Qty')}
                                                    </th>
                                                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                                                        {t('Unit Price')}
                                                    </th>
                                                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                                                        {t('Condition')}
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {purchaseData.data.items.map(
                                                    (item) => (
                                                        <tr
                                                            key={item.id}
                                                            className="border-t border-border"
                                                        >
                                                            <td className="px-3 py-2 text-foreground">
                                                                {[
                                                                    item.product_brand,
                                                                    item.product_model,
                                                                    item.product_title,
                                                                ]
                                                                    .filter(
                                                                        Boolean,
                                                                    )
                                                                    .join(
                                                                        ' - ',
                                                                    )}
                                                            </td>
                                                            <td className="px-3 py-2 text-foreground">
                                                                {item.quantity}
                                                            </td>
                                                            <td className="px-3 py-2 text-foreground">
                                                                {
                                                                    item.unit_price
                                                                }
                                                            </td>
                                                            <td className="px-3 py-2 text-foreground">
                                                                {
                                                                    item.condition_name
                                                                }
                                                            </td>
                                                        </tr>
                                                    ),
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        {t('No items found.')}
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-foreground">
                                        {t('Items')}
                                    </h3>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={addItem}
                                    >
                                        <Plus className="mr-1 h-4 w-4" />
                                        {t('Add Item')}
                                    </Button>
                                </div>

                                {initialData.items.map((item, index) => (
                                    <ItemRow
                                        key={index}
                                        index={index}
                                        item={item}
                                        errors={errors}
                                        onItemChange={handleItemChange}
                                        onRemove={removeItem}
                                        canRemove={initialData.items.length > 1}
                                        productOptionsMap={productOptionsMap}
                                        setProductOptionsMap={
                                            setProductOptionsMap
                                        }
                                        productSearchMap={productSearchMap}
                                        setProductSearchMap={
                                            setProductSearchMap
                                        }
                                        productChangeMap={productChangeMap}
                                        setProductChangeMap={
                                            setProductChangeMap
                                        }
                                        conditionOptionsMap={
                                            conditionOptionsMap
                                        }
                                        setConditionOptionsMap={
                                            setConditionOptionsMap
                                        }
                                        conditionSearchMap={conditionSearchMap}
                                        setConditionSearchMap={
                                            setConditionSearchMap
                                        }
                                        conditionChangeMap={conditionChangeMap}
                                        setConditionChangeMap={
                                            setConditionChangeMap
                                        }
                                        debounceSelectInputChange={
                                            debounceSelectInputChange
                                        }
                                        t={t}
                                    />
                                ))}

                                <div className="flex flex-wrap justify-end gap-6 rounded-lg bg-muted/50 p-3">
                                    <span className="text-sm font-medium text-muted-foreground">
                                        {t('Total Units')}:{' '}
                                        <span className="font-bold text-foreground">
                                            {totalUnits}
                                        </span>
                                    </span>
                                    <span className="text-sm font-medium text-muted-foreground">
                                        {t('Total Amount')}:{' '}
                                        <span className="font-bold text-foreground">
                                            {totalAmount.toLocaleString()}
                                        </span>
                                    </span>
                                    {parseFloat(initialData.discount) > 0 && (
                                        <>
                                            <span className="text-sm font-medium text-muted-foreground">
                                                {t('Discount')}:{' '}
                                                <span className="font-bold text-destructive">
                                                    -
                                                    {parseFloat(
                                                        initialData.discount,
                                                    ).toLocaleString()}
                                                </span>
                                            </span>
                                            <span className="text-sm font-medium text-muted-foreground">
                                                {t('Net Amount')}:{' '}
                                                <span className="font-bold text-foreground">
                                                    {(
                                                        totalAmount -
                                                        parseFloat(
                                                            initialData.discount ||
                                                                0,
                                                        )
                                                    ).toLocaleString()}
                                                </span>
                                            </span>
                                        </>
                                    )}
                                </div>
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
                                        {t('Submitting...')}
                                    </>
                                ) : (
                                    t('Submit')
                                )}
                            </Button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
};

const ItemRow = ({
    index,
    item,
    errors,
    onItemChange,
    onRemove,
    canRemove,
    productOptionsMap,
    setProductOptionsMap,
    productSearchMap,
    setProductSearchMap,
    productChangeMap,
    setProductChangeMap,
    conditionOptionsMap,
    setConditionOptionsMap,
    conditionSearchMap,
    setConditionSearchMap,
    conditionChangeMap,
    setConditionChangeMap,
    debounceSelectInputChange,
    t,
}) => {
    const searchKey = productSearchMap[index] || '';
    const conditionSearchKey = conditionSearchMap[index] || '';
    const { data: productsData, loading: isLoadingProducts } = useAxiosFetch({
        url: `/search/products?search=${searchKey}`,
    });
    const { data: conditionsData, loading: isLoadingConditions } =
        useAxiosFetch({
            url: `/search/conditions?search=${conditionSearchKey}`,
        });

    useEffect(() => {
        if (productsData) {
            setProductOptionsMap((prev) => ({
                ...prev,
                [index]: productsData?.data,
            }));
        }
    }, [productsData]);

    useEffect(() => {
        if (conditionsData) {
            setConditionOptionsMap((prev) => ({
                ...prev,
                [index]: conditionsData?.data,
            }));
        }
    }, [conditionsData]);

    return (
        <div className="rounded-lg border border-border p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-6">
                <div className="sm:col-span-2">
                    <ServerSearchSelect
                        isRequired={true}
                        label={t('Product')}
                        value={productChangeMap[index] || null}
                        onInputChange={(value) =>
                            debounceSelectInputChange(value, (val) =>
                                setProductSearchMap((prev) => ({
                                    ...prev,
                                    [index]: val,
                                })),
                            )
                        }
                        isLoading={isLoadingProducts}
                        options={productOptionsMap[index] || []}
                        onChange={(value) => {
                            setProductChangeMap((prev) => ({
                                ...prev,
                                [index]: value,
                            }));
                            onItemChange(
                                index,
                                'product_id',
                                value?.value || '',
                            );
                        }}
                        placeholder={t('Select Product')}
                        error={errors?.[`items.${index}.product_id`]}
                    />
                </div>

                <InputField
                    label={t('Qty')}
                    type="number"
                    isRequired={true}
                    value={item.quantity}
                    onChange={(e) =>
                        onItemChange(index, 'quantity', e.target.value)
                    }
                    error={errors?.[`items.${index}.quantity`]}
                />

                <InputField
                    label={t('Unit Price')}
                    type="number"
                    isRequired={true}
                    value={item.unit_price}
                    onChange={(e) =>
                        onItemChange(index, 'unit_price', e.target.value)
                    }
                    error={errors?.[`items.${index}.unit_price`]}
                />

                <InputField
                    label={t('Sale Price')}
                    type="number"
                    value={item.sale_price}
                    onChange={(e) =>
                        onItemChange(index, 'sale_price', e.target.value)
                    }
                    error={errors?.[`items.${index}.sale_price`]}
                />

                <ServerSearchSelect
                    label={t('Condition')}
                    isRequired={true}
                    value={conditionChangeMap[index] || null}
                    onInputChange={(value) =>
                        debounceSelectInputChange(value, (val) =>
                            setConditionSearchMap((prev) => ({
                                ...prev,
                                [index]: val,
                            })),
                        )
                    }
                    isLoading={isLoadingConditions}
                    options={conditionOptionsMap[index] || []}
                    onChange={(value) => {
                        setConditionChangeMap((prev) => ({
                            ...prev,
                            [index]: value,
                        }));
                        onItemChange(index, 'condition_id', value?.value);
                    }}
                    error={errors?.[`items.${index}.condition_id`]}
                />
            </div>

            <div className="mt-3 flex items-end gap-3">
                <div className="flex-1">
                    <ImeiTextarea
                        index={index}
                        value={item.imeis}
                        quantity={parseInt(item.quantity) || 0}
                        onChange={(val) => onItemChange(index, 'imeis', val)}
                        error={[
                                errors?.[`items.${index}.imeis`],
                                ...Object.entries(errors || {})
                                    .filter(([key]) => key.startsWith(`items.${index}.imeis.`))
                                    .map(([, msg]) => msg),
                            ].filter(Boolean)}
                        t={t}
                    />
                </div>
                {canRemove && (
                    <Button
                        type="button"
                        variant="delete"
                        size="icon-sm"
                        onClick={() => onRemove(index)}
                        className="mb-1"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    );
};

/**
 * IMEI Textarea with barcode scanner support.
 * - Auto-appends newline after each scan (barcode scanners send Enter/Tab after scan)
 * - Shows count of scanned IMEIs vs required quantity
 */
const ImeiTextarea = ({ index, value, quantity, onChange, error, t }) => {
    const textareaRef = useRef(null);

    const imeiList = value
        ? value
              .split('\n')
              .map((s) => s.trim())
              .filter(Boolean)
        : [];
    const imeiCount = imeiList.length;

    const handleKeyDown = useCallback(
        (e) => {
            // Barcode scanners typically send Enter or Tab after scanning
            if (e.key === 'Enter' || e.key === 'Tab') {
                e.preventDefault();
                const currentValue = value || '';
                const trimmed = currentValue.replace(/\n+$/, '').trim();
                if (trimmed) {
                    onChange(trimmed + '\n');
                }
                // Keep focus for next scan
                textareaRef.current?.focus();
            }
        },
        [value, onChange],
    );

    const countColor =
        imeiCount === quantity
            ? 'text-green-600'
            : imeiCount > quantity
              ? 'text-destructive'
              : 'text-muted-foreground';

    // Collect all IMEI-related errors for this item
    const imeiErrors = [];
    if (error) {
        imeiErrors.push(
            typeof error === 'string' ? error : Object.values(error).flat(),
        );
    }
    // Check for individual IMEI errors like items.0.imeis.0, items.0.imeis.1, etc.
    const flatErrors = imeiErrors.flat();

    return (
        <div>
            <div className="mb-1 flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">
                    {t('IMEIs')} <span className="text-destructive">*</span>
                </label>
                <span className={`text-xs font-medium ${countColor}`}>
                    {imeiCount} / {quantity} {t('scanned')}
                </span>
            </div>
            <textarea
                ref={textareaRef}
                className="flex min-h-20 w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('Scan barcode or type IMEIs (one per line)')}
                rows={3}
            />
            {flatErrors.length > 0 && (
                <p className="mt-1 text-xs text-destructive">{flatErrors[0]}</p>
            )}
        </div>
    );
};

export default StockPurchaseModal;
