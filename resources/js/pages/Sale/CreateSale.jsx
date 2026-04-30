import RadioGroupField from '@/components/custom-component/RadioGroupField';
import TextAreaField from '@/components/custom-component/TextAreaField';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { ServerSearchSelect } from '@/components/ui/advanced-select';
import { Button } from '@/components/ui/button';
import { SmartDatePicker } from '@/components/ui/date-picker/DatePicker';
import useAxiosFetch from '@/hooks/useAxiosFetch';
import useDebounce from '@/hooks/useDebounce';
import { useLanguage } from '@/hooks/useLanguage';
import { formatDateToYMD, parseLocalDate } from '@/lib/helper';
import { saleTypeFormOptions } from '@/lib/options';
import { debounceInterval, formSubmitErrorMessage } from '@/lib/utils';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Barcode,
    Loader2,
    Package,
    Pencil,
    Plus,
    ScanLine,
    Trash2,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

const today = new Date();

export default function CreateSale({ sale }) {
    const { t } = useLanguage();
    const barcodeInputRef = useRef(null);

    const isEditMode = !!sale?.data?.id;
    const saleData = sale?.data;

    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});

    // Form data
    const [formData, setFormData] = useState({
        customer_id: saleData?.customer_id || '',
        sale_type: String(saleData?.sale_type || '2'),
        sale_date: saleData?.sale_date || formatDateToYMD(today),
        discount: saleData?.discount || '',
        payment: '',
        notes: saleData?.notes || '',
    });

    // Line items: { type: 'stock'|'glot', ... }
    // In edit mode, initialize from existing sale items using source_type and line_number
    const [lineItems, setLineItems] = useState(() => {
        if (saleData?.items?.length > 0) {
            const items = saleData.items;
            const result = [];

            // Group items by line_number, preserving original order
            const lineGroups = {};

            items.forEach((item) => {
                const key = item.line_number;
                if (!lineGroups[key]) {
                    lineGroups[key] = {
                        source_type: item.source_type || 'stock',
                        batch_number: item.batch_number,
                        stock_purchase_id: item.stock_purchase_id,
                        items: [],
                    };
                }
                lineGroups[key].items.push(item);
            });

            // Sort by line_number and build result in original order
            Object.keys(lineGroups)
                .sort((a, b) => Number(a) - Number(b))
                .forEach((key) => {
                    const group = lineGroups[key];

                    if (group.source_type === 'glot') {
                        result.push({
                            type: 'glot',
                            batch_id: group.stock_purchase_id,
                            batch_number: group.batch_number,
                            stocks: group.items.map((s) => ({
                                stock_id: s.stock_id,
                                imei: s.imei,
                                sale_price: s.sale_price || 0,
                                purchase_price: 0,
                            })),
                            unit_price: group.items[0]?.sale_price || 0,
                        });
                    } else {
                        // Individual stock (should be a single item per line)
                        const item = group.items[0];
                        result.push({
                            type: 'stock',
                            stock_id: item.stock_id,
                            imei: item.imei,
                            label: `${item.imei || 'N/A'} - ${item.product_brand || ''} ${item.product_model || ''}`.trim(),
                            sale_price: item.sale_price || 0,
                            purchase_price: 0,
                        });
                    }
                });

            return result;
        }
        return [];
    });

    // Customer search
    const [customerOptions, setCustomerOptions] = useState([]);
    const [customerSearch, setCustomerSearch] = useState('');
    const [customerChange, setCustomerChange] = useState(
        saleData?.customer_id && saleData?.customer_name
            ? { value: saleData.customer_id, label: saleData.customer_name }
            : null,
    );

    // Unified search
    const [saleItemOptions, setSaleItemOptions] = useState([]);
    const [saleItemSearch, setSaleItemSearch] = useState('');
    const [saleItemChange, setSaleItemChange] = useState(null);

    const { data: customersData, loading: isLoadingCustomers } = useAxiosFetch({
        url: `/search/customers?search=${customerSearch}`,
    });

    const { data: saleItemsData, loading: isLoadingSaleItems } = useAxiosFetch({
        url: `/search/sale-items?search=${saleItemSearch}`,
        skip: !saleItemSearch,
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
        if (saleItemsData) {
            const options = (saleItemsData?.data || []).map((item) => ({
                ...item,
                label:
                    item.type === 'glot'
                        ? `[GLOT] ${item.label} (${item.available_count} available)`
                        : item.label,
            }));
            setSaleItemOptions(options);
        }
    }, [saleItemsData]);

    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            toast.error(formSubmitErrorMessage);
        }
    }, [JSON.stringify(errors)]);

    // Auto-focus barcode input on mount
    useEffect(() => {
        barcodeInputRef.current?.focus();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Check if stock already exists in line items
    const isStockAlreadyAdded = (stockId) => {
        return lineItems.some((item) => {
            if (item.type === 'stock') {
                return item.stock_id === stockId;
            }
            if (item.type === 'glot') {
                return item.stocks.some((s) => s.stock_id === stockId);
            }
            return false;
        });
    };

    // Add individual stock line item
    const addStockItem = (stockData) => {
        if (isStockAlreadyAdded(stockData.value)) {
            toast.error(t('This stock item is already added.'));
            return;
        }
        setLineItems((prev) => [
            ...prev,
            {
                type: 'stock',
                stock_id: stockData.value,
                imei: stockData.imei,
                label: stockData.label,
                sale_price: stockData.sale_price || 0,
                purchase_price: stockData.purchase_price || 0,
            },
        ]);
    };

    // Add GLOT batch line item
    const addGlotItem = (glotOption) => {
        fetch(
            `/search/stocks?stock_purchase_id=${glotOption.value}&limit=500`,
            {
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            },
        )
            .then((res) => res.json())
            .then((res) => {
                const stocks = res.data || [];
                const existingStockIds = new Set();
                lineItems.forEach((item) => {
                    if (item.type === 'stock') {
                        existingStockIds.add(item.stock_id);
                    }
                    if (item.type === 'glot') {
                        item.stocks.forEach((s) =>
                            existingStockIds.add(s.stock_id),
                        );
                    }
                });

                const newStocks = stocks
                    .filter((s) => !existingStockIds.has(s.value))
                    .map((s) => ({
                        stock_id: s.value,
                        imei: s.imei,
                        sale_price: s.sale_price || 0,
                        purchase_price: s.purchase_price || 0,
                    }));

                if (newStocks.length === 0) {
                    toast.info(
                        t('All items from this GLOT are already added.'),
                    );
                    return;
                }

                // Use the first stock's sale_price as default unit price
                const unitPrice = newStocks[0]?.sale_price || 0;

                setLineItems((prev) => [
                    ...prev,
                    {
                        type: 'glot',
                        batch_id: glotOption.value,
                        batch_number:
                            glotOption.label
                                ?.replace('[GLOT] ', '')
                                ?.replace(/ \(\d+ available\)/, '') ||
                            glotOption.label,
                        stocks: newStocks,
                        unit_price: unitPrice,
                    },
                ]);

                toast.success(
                    t(':count items added from GLOT.', {
                        count: newStocks.length,
                    }),
                );
            });
    };

    // Handle unified search selection
    const handleSaleItemSelect = (option) => {
        if (!option) return;
        setSaleItemChange(null);

        if (option.type === 'stock') {
            addStockItem(option);
        } else if (option.type === 'glot') {
            addGlotItem(option);
        }
    };

    // Barcode scan handler
    const handleBarcodeScan = (e) => {
        if (e.key !== 'Enter') return;
        if (e.key == 'Enter') {
            e.stopPropagation();
            e.preventDefault();
        }
        const value = e.target.value.trim();
        if (!value) return;

        fetch(`/search/stocks?imei_exact=${encodeURIComponent(value)}`, {
            headers: {
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
        })
            .then((res) => res.json())
            .then((res) => {
                const stocks = res.data || [];
                if (stocks.length > 0) {
                    const stock = stocks[0];
                    if (isStockAlreadyAdded(stock.value)) {
                        toast.error(t('This stock item is already added.'));
                    } else {
                        addStockItem(stock);
                        toast.success(t('Stock item added.'));
                    }
                } else {
                    toast.error(t('Stock not found.'));
                }
                e.target.value = '';
                barcodeInputRef.current?.focus();
            })
            .catch(() => {
                toast.error(t('Error searching stock.'));
                e.target.value = '';
                barcodeInputRef.current?.focus();
            });
    };

    // Remove line item
    const handleRemoveItem = (index) => {
        setLineItems((prev) => prev.filter((_, i) => i !== index));
    };

    // Update individual stock price
    const handleStockPriceChange = (index, value) => {
        setLineItems((prev) =>
            prev.map((item, i) =>
                i === index ? { ...item, sale_price: value } : item,
            ),
        );
    };

    // Update GLOT unit price (applies to all stocks in batch)
    const handleGlotPriceChange = (index, value) => {
        setLineItems((prev) =>
            prev.map((item, i) =>
                i === index
                    ? {
                          ...item,
                          unit_price: value,
                          stocks: item.stocks.map((s) => ({
                              ...s,
                              sale_price: value,
                          })),
                      }
                    : item,
            ),
        );
    };

    // Calculate totals
    const getItemTotal = (item) => {
        if (item.type === 'stock') {
            return parseFloat(item.sale_price) || 0;
        }
        if (item.type === 'glot') {
            return (parseFloat(item.unit_price) || 0) * item.stocks.length;
        }
        return 0;
    };

    const subtotal = lineItems.reduce(
        (sum, item) => sum + getItemTotal(item),
        0,
    );
    const discount = parseFloat(formData.discount) || 0;
    const grandTotal = subtotal - discount;

    const totalItemCount = lineItems.reduce((sum, item) => {
        if (item.type === 'stock') return sum + 1;
        if (item.type === 'glot') return sum + item.stocks.length;
        return sum;
    }, 0);

    // Submit
    const handleSubmit = (e) => {
        e.preventDefault();
        setErrors({});
        setProcessing(true);

        // Flatten all items with source_type, line_number, stock_purchase_id
        const items = [];
        let lineNumber = 1;
        lineItems.forEach((item) => {
            if (item.type === 'stock') {
                items.push({
                    stock_id: item.stock_id,
                    sale_price: item.sale_price,
                    source_type: 'stock',
                    line_number: lineNumber,
                    stock_purchase_id: null,
                });
                lineNumber++;
            } else if (item.type === 'glot') {
                const currentLine = lineNumber;
                item.stocks.forEach((s) => {
                    items.push({
                        stock_id: s.stock_id,
                        sale_price: s.sale_price,
                        source_type: 'glot',
                        line_number: currentLine,
                        stock_purchase_id: item.batch_id || null,
                    });
                });
                lineNumber++;
            }
        });

        const payload = {
            ...formData,
            items,
        };

        if (isEditMode) {
            router.put(`/sales/${saleData.id}`, payload, {
                preserveScroll: true,
                preserveState: true,
                onSuccess: (response) => {
                    setProcessing(false);
                    if (response?.props?.flash?.success) {
                        toast.success(response.props.flash.success);
                        router.visit('/sales');
                    }
                },
                onError: (responseErrors) => {
                    setProcessing(false);
                    setErrors(responseErrors);
                },
            });
        } else {
            router.post('/sales', payload, {
                preserveScroll: true,
                preserveState: true,
                onSuccess: (response) => {
                    setProcessing(false);
                    if (response?.props?.flash?.success) {
                        toast.success(response.props.flash.success);
                        if (response?.props?.flash?.redirect_url) {
                            window.open(
                                response?.props?.flash?.redirect_url,
                                '_blank',
                            );
                        }
                        router.visit('/sales');
                    }
                },
                onError: (responseErrors) => {
                    setProcessing(false);
                    setErrors(responseErrors);
                },
            });
        }
    };

    const backUrl = isEditMode ? `/sales/${saleData.id}` : '/sales';

    return (
        <DashboardLayout>
            <Head title={isEditMode ? t('Edit Sale') : t('New Sale')} />
            <div className="mx-auto max-w-5xl">
                {/* Header */}
                <div className="mb-6 flex items-center gap-4">
                    <Link
                        href={backUrl}
                        className="rounded-lg border border-border p-2 transition-colors hover:bg-muted"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            {isEditMode ? t('Edit Sale') : t('New Sale')}
                        </h1>
                        {isEditMode && saleData?.sale_number && (
                            <p className="text-sm text-muted-foreground">
                                {saleData.sale_number}
                            </p>
                        )}
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Invoice Header */}
                    <div className="mb-6 rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                                clearable
                            />

                            <SmartDatePicker
                                label={t('Sale Date')}
                                isRequired={true}
                                value={parseLocalDate(formData.sale_date)}
                                onChange={(val) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        sale_date: val ? formatDateToYMD(val) : '',
                                    }))
                                }
                                error={errors?.sale_date}
                            />

                            <RadioGroupField
                                label={t('Sale Type')}
                                name="sale_type"
                                options={saleTypeFormOptions}
                                value={formData.sale_type}
                                onChange={handleChange}
                                error={errors?.sale_type}
                            />
                        </div>

                        <div className="mt-4">
                            <TextAreaField
                                label={t('Notes')}
                                className="min-h-16"
                                name="notes"
                                placeholder={t('Enter notes')}
                                value={formData.notes}
                                onChange={handleChange}
                                error={errors?.notes}
                            />
                        </div>
                    </div>

                    {/* Barcode Scan + Unified Search */}
                    <div className="mb-6 rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {/* Barcode Scanner */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">
                                    {t('Barcode Scanner')}
                                </label>
                                <div className="relative">
                                    <ScanLine className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                                    <input
                                        ref={barcodeInputRef}
                                        type="text"
                                        placeholder={t(
                                            'Scan barcode / IMEI...',
                                        )}
                                        onKeyDown={handleBarcodeScan}
                                        className="flex h-11 w-full rounded-lg border border-border bg-background pr-4 pl-10 text-sm transition-colors focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                                    />
                                </div>
                            </div>

                            {/* Unified Search */}
                            <ServerSearchSelect
                                label={t('Search Items')}
                                value={saleItemChange}
                                onInputChange={(value) =>
                                    debounceSelectInputChange(
                                        value,
                                        setSaleItemSearch,
                                    )
                                }
                                isLoading={isLoadingSaleItems}
                                options={saleItemOptions}
                                onChange={(value) => {
                                    setSaleItemChange(value);
                                    handleSaleItemSelect(value);
                                }}
                                placeholder={t(
                                    'Search IMEI, product, or GLOT batch...',
                                )}
                            />
                        </div>
                    </div>

                    {/* Line Items */}
                    <div className="mb-6 rounded-xl border border-border bg-card shadow-sm">
                        <div className="border-b border-border px-4 py-3 sm:px-6">
                            <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                                <Package className="h-5 w-5" />
                                {t('Line Items')}
                                {totalItemCount > 0 && (
                                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-sm font-medium text-primary">
                                        {totalItemCount}
                                    </span>
                                )}
                            </h3>
                        </div>

                        {errors?.items && (
                            <div className="px-4 pt-3 sm:px-6">
                                <p className="text-sm text-destructive">
                                    {errors.items}
                                </p>
                            </div>
                        )}

                        {lineItems.length === 0 && (
                            <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
                                <Barcode className="mb-3 h-12 w-12 text-muted-foreground/30" />
                                <p className="text-sm text-muted-foreground">
                                    {t(
                                        'Scan a barcode or search for items to add them here.',
                                    )}
                                </p>
                            </div>
                        )}

                        {lineItems.length > 0 && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/50">
                                        <tr>
                                            <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">
                                                #
                                            </th>
                                            <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">
                                                {t('Item')}
                                            </th>
                                            <th className="px-3 py-2.5 text-center font-medium text-muted-foreground">
                                                {t('Qty')}
                                            </th>
                                            <th className="px-3 py-2.5 text-right font-medium text-muted-foreground">
                                                {t('Unit Price')}
                                            </th>
                                            <th className="px-3 py-2.5 text-right font-medium text-muted-foreground">
                                                {t('Total')}
                                            </th>
                                            <th className="px-3 py-2.5 text-center font-medium text-muted-foreground">
                                                {t('Action')}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {lineItems.map((item, index) =>
                                            item.type === 'stock' ? (
                                                <tr
                                                    key={`stock-${item.stock_id}`}
                                                    className="border-t border-border"
                                                >
                                                    <td className="px-3 py-2 text-muted-foreground">
                                                        {index + 1}
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <div className="font-medium">
                                                            {item.imei || 'N/A'}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {item.label}
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-2 text-center">
                                                        <span className="inline-flex h-8 w-12 items-center justify-center rounded border border-border bg-muted/30 text-sm text-muted-foreground">
                                                            1
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-2 text-right">
                                                        <input
                                                            type="number"
                                                            value={
                                                                item.sale_price
                                                            }
                                                            onChange={(e) =>
                                                                handleStockPriceChange(
                                                                    index,
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className="w-28 rounded border border-border bg-background px-2 py-1 text-right text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                                                            min="0"
                                                            step="0.01"
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2 text-right font-medium">
                                                        {getItemTotal(
                                                            item,
                                                        ).toLocaleString()}
                                                    </td>
                                                    <td className="px-3 py-2 text-center">
                                                        <Button
                                                            type="button"
                                                            variant="delete"
                                                            size="icon-sm"
                                                            onClick={() =>
                                                                handleRemoveItem(
                                                                    index,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ) : (
                                                <tr
                                                    key={`glot-${item.batch_id}`}
                                                    className="border-t border-border bg-blue-50/50 dark:bg-blue-950/20"
                                                >
                                                    <td className="px-3 py-2 text-muted-foreground">
                                                        {index + 1}
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                                                                GLOT
                                                            </span>
                                                            <span className="font-medium">
                                                                {
                                                                    item.batch_number
                                                                }
                                                            </span>
                                                        </div>
                                                        <div className="mt-1 max-h-16 overflow-y-auto text-xs text-muted-foreground">
                                                            {item.stocks
                                                                .map(
                                                                    (s) =>
                                                                        s.imei ||
                                                                        'N/A',
                                                                )
                                                                .join(', ')}
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-2 text-center">
                                                        <span className="inline-flex h-8 w-12 items-center justify-center rounded border border-border bg-muted/30 text-sm text-muted-foreground">
                                                            {item.stocks.length}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-2 text-right">
                                                        <input
                                                            type="number"
                                                            value={
                                                                item.unit_price
                                                            }
                                                            onChange={(e) =>
                                                                handleGlotPriceChange(
                                                                    index,
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className="w-28 rounded border border-border bg-background px-2 py-1 text-right text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                                                            min="0"
                                                            step="0.01"
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2 text-right font-medium">
                                                        {getItemTotal(
                                                            item,
                                                        ).toLocaleString()}
                                                    </td>
                                                    <td className="px-3 py-2 text-center">
                                                        <Button
                                                            type="button"
                                                            variant="delete"
                                                            size="icon-sm"
                                                            onClick={() =>
                                                                handleRemoveItem(
                                                                    index,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ),
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Totals Footer */}
                        {lineItems.length > 0 && (
                            <div className="border-t border-border bg-muted/30 px-4 py-4 sm:px-6">
                                <div className="flex flex-col items-end gap-2">
                                    <div className="flex w-full max-w-xs items-center justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            {t('Subtotal')} ({totalItemCount}{' '}
                                            {t('items')}):
                                        </span>
                                        <span className="font-medium">
                                            {subtotal.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex w-full max-w-xs items-center justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            {t('Discount')}:
                                        </span>
                                        <input
                                            type="number"
                                            name="discount"
                                            value={formData.discount}
                                            onChange={handleChange}
                                            className="w-28 rounded border border-border bg-background px-2 py-1 text-right text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                    {errors?.discount && (
                                        <div className="w-full max-w-xs text-right text-xs text-destructive">
                                            {errors.discount}
                                        </div>
                                    )}
                                    <div className="flex w-full max-w-xs items-center justify-between border-t border-border pt-2">
                                        <span className="text-base font-semibold">
                                            {t('Grand Total')}:
                                        </span>
                                        <span className="text-xl font-bold text-primary">
                                            {grandTotal.toLocaleString()}
                                        </span>
                                    </div>
                                    {!isEditMode && (
                                        <>
                                            <div className="flex w-full max-w-xs items-center justify-between text-sm">
                                                <span className="text-muted-foreground">
                                                    {t('Payment')}:
                                                </span>
                                                <input
                                                    type="number"
                                                    name="payment"
                                                    value={formData.payment}
                                                    onChange={(e) => {
                                                        const val = parseFloat(
                                                            e.target.value,
                                                        );
                                                        const clamped =
                                                            !isNaN(val) &&
                                                            val > grandTotal
                                                                ? grandTotal
                                                                : e.target
                                                                      .value;
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            payment: clamped,
                                                        }));
                                                    }}
                                                    className="w-28 rounded border border-border bg-background px-2 py-1 text-right text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                                                    min="0"
                                                    max={grandTotal}
                                                    step="0.01"
                                                    placeholder="0"
                                                />
                                            </div>
                                            {errors?.payment && (
                                                <div className="w-full max-w-xs text-right text-xs text-destructive">
                                                    {errors.payment}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center justify-end gap-3">
                        <Link href={backUrl}>
                            <Button variant="accent" type="button">
                                {t('Cancel')}
                            </Button>
                        </Link>
                        <Button
                            variant="gradient"
                            type="submit"
                            disabled={processing}
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {isEditMode
                                        ? t('Updating...')
                                        : t('Creating...')}
                                </>
                            ) : (
                                <>
                                    {isEditMode ? (
                                        <Pencil className="mr-1 h-4 w-4" />
                                    ) : (
                                        <Plus className="mr-1 h-4 w-4" />
                                    )}
                                    {isEditMode
                                        ? t('Update Sale')
                                        : t('Create Sale')}
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
