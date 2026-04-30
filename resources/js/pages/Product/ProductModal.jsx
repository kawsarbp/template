import InputField from '@/components/custom-component/InputField';
import RadioGroupField from '@/components/custom-component/RadioGroupField';
import TextAreaField from '@/components/custom-component/TextAreaField';
import { FileUpload } from '@/components/FileUpload';
import {
    BasicSelect,
    ServerSearchSelect,
} from '@/components/ui/advanced-select';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import useAxiosFetch from '@/hooks/useAxiosFetch';
import useDebounce from '@/hooks/useDebounce';
import { useLanguage } from '@/hooks/useLanguage';
import {
    booleanStatusOptions,
    ramOptions,
    storageOptions,
} from '@/lib/options';
import { debounceInterval, formSubmitErrorMessage } from '@/lib/utils';
import { useForm } from '@inertiajs/react';
import axios from 'axios';
import { Loader2, Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const initialInputField = {
    title: '',
    sku: '',
    description: '',
    brand_id: '',
    model: '',
    color: '',
    storage_capacity: '',
    ram: '',
    condition_id: '',
    operating_system: '',
    status: '',
    photos: [],
    is_active: 1,
};

const ProductModal = ({ isOpen, onClose, handleSubmitted, editData = {} }) => {
    const { t } = useLanguage();
    const [files, setFiles] = useState([]);

    // Brand state
    const [brandOptions, setBrandOptions] = useState([]);
    const [brandSearch, setBrandSearch] = useState('');
    const [brandChange, setBrandChange] = useState(null);

    // color state
    const [colorOptions, setColorOptions] = useState([]);
    const [colorSearch, setColorSearch] = useState('');
    const [colorChange, setColorChange] = useState(null);

    // condition state
    const [conditionOptions, setConditionOptions] = useState([]);
    const [conditionSearch, setConditionSearch] = useState('');
    const [conditionChange, setConditionChange] = useState(null);

    // new condition state
    const [isAddingCondition, setIsAddingCondition] = useState(false);
    const [newConditionName, setNewConditionName] = useState('');
    const [isSubmittingCondition, setIsSubmittingCondition] = useState(false);

    const { data: brandsData, loading: isLoadingBrands } = useAxiosFetch({
        url: `/search/brands?search=${brandSearch}`,
    });

    const { data: colorsData, loading: isLoadingColors } = useAxiosFetch({
        url: `/search/colors?search=${colorSearch}`,
    });

    const { data: conditionsData, loading: isLoadingConditions } =
        useAxiosFetch({
            url: `/search/conditions?search=${conditionSearch}`,
        });

    const debounceSelectInputChange = useDebounce((value, stateFunction) => {
        stateFunction(value);
    }, debounceInterval);

    // brand options set
    useEffect(() => {
        if (brandsData) {
            setBrandOptions(brandsData?.data);
        }
    }, [brandsData]);

    // color options set
    useEffect(() => {
        if (colorsData) {
            setColorOptions(colorsData?.data);
        }
    }, [colorsData]);

    // condition options set
    useEffect(() => {
        if (conditionsData) {
            setConditionOptions(conditionsData?.data);
        }
    }, [conditionsData]);

    const { loading: isLoading, data: productData } = useAxiosFetch({
        url: `/products/${editData?.id}`,
        skip: editData?.id ? false : true,
    });

    const {
        data: initialData,
        setData: setInitialData,
        put,
        post,
        processing,
        errors,
        clearErrors,
    } = useForm(initialInputField);

    // error message show
    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            toast.error(formSubmitErrorMessage);
        }
    }, [JSON.stringify(errors)]);

    // set update data fetching
    useEffect(() => {
        if (productData) {
            const merged = { ...initialInputField };
            for (const [key, value] of Object.entries(
                productData?.data || {},
            )) {
                merged[key] = value ?? initialInputField[key] ?? '';
            }
            setInitialData(merged);
            if (productData?.data?.brand_id && productData?.data?.brand) {
                setBrandChange({
                    value: productData.data.brand_id,
                    label: productData.data.brand,
                });
            }
            if (productData?.data?.color_id && productData?.data?.color) {
                setColorChange({
                    value: productData.data.color_id,
                    label: productData.data.color,
                });
            }
            if (
                productData?.data?.condition &&
                productData?.data?.condition_name
            ) {
                setConditionChange({
                    value: productData.data.condition,
                    label: productData.data.condition_name,
                });
            }
            if (
                productData?.data?.photos &&
                Array.isArray(productData?.data?.photos)
            ) {
                const existingFiles = productData.data.photos.map((url) => ({
                    id: url,
                    name: url.split('/').pop(),
                    preview: url,
                    status: 'success',
                    serverUrl: url,
                    size: 0,
                    type: 'image/jpeg',
                }));
                setFiles(existingFiles);
            }
        }
    }, [productData]);

    // handle input field change
    const handleChange = (e) => {
        const name = e.target.name;
        const value = e.target.value;
        setInitialData({ ...initialData, [name]: value });
    };

    // handle select change
    const handleSelectChange = (key, value) => {
        setInitialData((prev) => ({ ...prev, [key]: value }));
    };

    // Sync files to initialData.photos
    useEffect(() => {
        const uploadedUrls = files
            .filter((f) => f.status === 'success' && f.serverUrl)
            .map((f) => f.serverUrl);
        setInitialData((prev) => ({ ...prev, photos: uploadedUrls }));
    }, [files]);

    const handleCreateCondition = async () => {
        if (!newConditionName.trim()) {
            toast.error(t('Condition name is required'));
            return;
        }

        setIsSubmittingCondition(true);
        try {
            const response = await axios.post('/conditions', {
                name: newConditionName.trim(),
                status: 1,
            });

            const newCondition = response.data?.data || response.data;
            const newOption = {
                value: newCondition.id,
                label: newCondition.name || newConditionName.trim(),
            };

            setConditionOptions((prev) => [newOption, ...prev]);
            setConditionChange(newOption);
            handleSelectChange('condition_id', newCondition.id);

            setIsAddingCondition(false);
            setNewConditionName('');
            toast.success(t('Condition created successfully'));
        } catch (error) {
            toast.error(
                error?.response?.data?.message ||
                    t('Failed to create condition'),
            );
        } finally {
            setIsSubmittingCondition(false);
        }
    };

    // handle edit and create submit forms
    const handleSubmit = (e) => {
        e.preventDefault();
        clearErrors();
        if (editData?.id) {
            put(`/products/${editData?.id}`, {
                data: initialData,
                onSuccess: (response) => {
                    handleSubmitted({
                        responseFlashMessage: response,
                        updateData: initialData,
                    });
                },
                preserveScroll: true,
                preserveState: true,
            });
        } else {
            post('/products', {
                data: initialData,
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
            <DialogContent className="custom-scrollbar max-h-[calc(100vh-5rem)] overflow-y-auto rounded-xl border-border shadow-lg sm:max-w-[800px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold tracking-tight text-foreground">
                        {editData?.id
                            ? t('Update Product')
                            : t('Create Product')}
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
                            {/* Title */}
                            <InputField
                                label={t('Title')}
                                name="title"
                                isRequired={true}
                                placeholder={t('Enter title')}
                                value={initialData?.title}
                                onChange={handleChange}
                                error={errors?.title}
                            />

                            {/* SKU */}
                            <InputField
                                label={t('SKU')}
                                name="sku"
                                isRequired={true}
                                placeholder={t('Enter SKU')}
                                value={initialData?.sku}
                                onChange={handleChange}
                                error={errors?.sku}
                            />

                            {/* Brand */}
                            <ServerSearchSelect
                                label={t('Brand')}
                                isRequired={true}
                                value={brandChange}
                                onInputChange={(value) =>
                                    debounceSelectInputChange(
                                        value,
                                        setBrandSearch,
                                    )
                                }
                                isLoading={isLoadingBrands}
                                options={brandOptions}
                                onChange={(value) => {
                                    setBrandChange(value);
                                    setInitialData((prev) => ({
                                        ...prev,
                                        brand_id: value?.value || '',
                                    }));
                                }}
                                placeholder={t('Select Brand')}
                                error={errors?.brand_id}
                            />

                            {/* Model */}
                            <InputField
                                label={t('Model')}
                                name="model"
                                isRequired={true}
                                placeholder={t('Enter model')}
                                value={initialData?.model}
                                onChange={handleChange}
                                error={errors?.model}
                            />

                            {/* Color */}
                            <ServerSearchSelect
                                label={t('Color')}
                                value={colorChange}
                                onInputChange={(value) =>
                                    debounceSelectInputChange(
                                        value,
                                        setColorSearch,
                                    )
                                }
                                isLoading={isLoadingColors}
                                options={colorOptions}
                                onChange={(value) => {
                                    setColorChange(value);
                                    setInitialData((prev) => ({
                                        ...prev,
                                        color_id: value?.value || '',
                                    }));
                                }}
                                placeholder={t('Select Color')}
                                error={errors?.color_id}
                            />

                            {/* Storage Capacity */}
                            <BasicSelect
                                label={t('Storage Capacity')}
                                options={storageOptions}
                                value={initialData?.storage_capacity}
                                onChange={(val) =>
                                    handleSelectChange('storage_capacity', val)
                                }
                                placeholder={t('Select Storage Capacity')}
                                error={errors?.storage_capacity}
                            />

                            {/* RAM */}
                            <BasicSelect
                                label={t('RAM')}
                                options={ramOptions}
                                value={initialData?.ram}
                                onChange={(val) =>
                                    handleSelectChange('ram', val)
                                }
                                placeholder={t('Select RAM')}
                                error={errors?.ram}
                            />

                            {/* Condition */}
                            <div>
                                <div className="mb-2 flex items-center justify-between">
                                    <label className="gap-0 text-sm font-medium text-muted-foreground after:content-['*']">
                                        {t('Condition')}
                                    </label>
                                    {!isAddingCondition && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setIsAddingCondition(true)
                                            }
                                            className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                                        >
                                            <Plus className="h-3 w-3" />
                                            {t('Add New')}
                                        </button>
                                    )}
                                </div>
                                {isAddingCondition ? (
                                    <div className="flex items-center gap-2">
                                        <div className="relative flex-1">
                                            <input
                                                type="text"
                                                className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                                placeholder={t(
                                                    'Enter new condition',
                                                )}
                                                value={newConditionName}
                                                onChange={(e) =>
                                                    setNewConditionName(
                                                        e.target.value,
                                                    )
                                                }
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        handleCreateCondition();
                                                    }
                                                }}
                                                autoFocus
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="secondary"
                                            onClick={handleCreateCondition}
                                            disabled={
                                                isSubmittingCondition ||
                                                !newConditionName.trim()
                                            }
                                            className="h-11"
                                        >
                                            {isSubmittingCondition ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                t('Add')
                                            )}
                                        </Button>
                                        <Button
                                            type="button"
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => {
                                                setIsAddingCondition(false);
                                                setNewConditionName('');
                                            }}
                                            className="h-11 w-11 shrink-0 bg-transparent text-muted-foreground hover:bg-muted"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <ServerSearchSelect
                                        value={conditionChange}
                                        onInputChange={(value) =>
                                            debounceSelectInputChange(
                                                value,
                                                setConditionSearch,
                                            )
                                        }
                                        isLoading={isLoadingConditions}
                                        options={conditionOptions}
                                        onChange={(value) => {
                                            setConditionChange(value);
                                            handleSelectChange(
                                                'condition_id',
                                                value?.value,
                                            );
                                        }}
                                        placeholder={t('Select Condition')}
                                        error={errors?.condition_id}
                                    />
                                )}
                            </div>

                            {/* Operating System */}
                            <InputField
                                label={t('Operating System')}
                                name="operating_system"
                                placeholder={t('Enter operating system')}
                                value={initialData?.operating_system}
                                onChange={handleChange}
                                error={errors?.operating_system}
                            />

                            {/* Is Active */}
                            <RadioGroupField
                                label={t('Active')}
                                name="is_active"
                                options={booleanStatusOptions}
                                value={initialData?.is_active}
                                onChange={handleChange}
                                error={errors?.is_active}
                            />
                        </div>

                        {/* Description */}
                        <TextAreaField
                            label={t('Description')}
                            name="description"
                            placeholder={t('Enter description')}
                            className="min-h-28"
                            value={initialData?.description}
                            onChange={handleChange}
                            error={errors?.description}
                        />

                        <div>
                            <FileUpload
                                files={files}
                                setFiles={setFiles}
                                accept="image/*"
                                endpoint="/products/upload-photo"
                                fileName="photo"
                            />
                        </div>

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

export default ProductModal;
