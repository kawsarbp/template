import InputField from '@/components/custom-component/InputField';
import RadioGroupField from '@/components/custom-component/RadioGroupField';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import useAxiosFetch from '@/hooks/useAxiosFetch';
import { useLanguage } from '@/hooks/useLanguage';
import { statusOptions } from '@/lib/options';
import { formSubmitErrorMessage } from '@/lib/utils';
import { useForm } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';

const initialInputField = {
    name: '',
    status: 1,
};

const ConditionModal = ({ isOpen, onClose, handleSubmitted, editData = {} }) => {
    const { t } = useLanguage();
    const { loading: isLoading, data: conditionData } = useAxiosFetch({
        url: `/conditions/${editData?.id}`,
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
        if (conditionData) {
            setInitialData(conditionData?.data);
        }
    }, [conditionData]);

    // handle input field change
    const handleChange = (e) => {
        const name = e.target.name;
        const value = e.target.value;
        setInitialData({ ...initialData, [name]: value });
    };

    // handle edit and create submit forms
    const handleSubmit = (e) => {
        e.preventDefault();
        clearErrors();
        if (editData?.id) {
            put(`/conditions/${editData?.id}`, {
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
            post('/conditions', {
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
            <DialogContent className="custom-scrollbar max-h-[calc(100vh-5rem)] overflow-y-auto rounded-xl border-border shadow-lg sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold tracking-tight text-foreground">
                        {editData?.id ? t('Update Condition') : t('Create Condition')}
                        <hr className="mt-2.5 border-border" />
                    </DialogTitle>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex items-center justify-center">
                        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6 py-4">
                        <div className="grid grid-cols-1 gap-4">
                            {/* name */}
                            <InputField
                                label={t('Name')}
                                name="name"
                                isRequired={true}
                                placeholder={t('Enter condition name')}
                                value={initialData?.name}
                                onChange={handleChange}
                                error={errors?.name}
                            />
                            {/* status */}
                            <RadioGroupField
                                label={t('Status')}
                                name="status"
                                options={statusOptions}
                                value={initialData?.status}
                                onChange={handleChange}
                                error={errors?.status}
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

export default ConditionModal;
