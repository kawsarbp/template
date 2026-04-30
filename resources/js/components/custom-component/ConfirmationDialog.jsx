import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button'; // Apnar custom button import korun
import { cn } from '@/lib/utils';
import { AlertOctagon, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

const variantConfigs = {
    destructive: {
        iconColor: 'text-destructive',
        bgColor: 'bg-destructive/10',
        gradient: 'from-destructive/20 to-transparent',
        buttonVariant: 'destructive', // Apnar custom button variant
        defaultIcon: AlertOctagon,
    },
    warning: {
        iconColor: 'text-warning',
        bgColor: 'bg-warning/10',
        gradient: 'from-warning/20 to-transparent',
        buttonVariant: 'warning',
        defaultIcon: AlertTriangle,
    },
    success: {
        iconColor: 'text-success',
        bgColor: 'bg-success/10',
        gradient: 'from-success/20 to-transparent',
        buttonVariant: 'success',
        defaultIcon: CheckCircle2,
    },
    info: {
        iconColor: 'text-info',
        bgColor: 'bg-info/10',
        gradient: 'from-info/20 to-transparent',
        buttonVariant: 'info',
        defaultIcon: Info,
    },
};

export function ConfirmationDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    variant = 'info',
    loading = false,
}) {
    const config = variantConfigs[variant] || variantConfigs.info;
    const DisplayIcon = config.defaultIcon;

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="max-w-[380px] overflow-hidden rounded-[var(--radius)] border-none p-0 shadow-2xl">
                {/* Top Gradient Background */}
                <div
                    className={cn(
                        'absolute top-0 left-0 -z-10 h-24 w-full bg-gradient-to-b',
                        config.gradient,
                    )}
                />

                <div className="flex flex-col items-center p-6 pt-8">
                    {/* Icon Container */}
                    <div
                        className={cn(
                            'mb-4 flex h-16 w-16 items-center justify-center rounded-2xl shadow-sm ring-4 ring-background',
                            config.bgColor,
                        )}
                    >
                        <DisplayIcon
                            className={cn('h-8 w-8', config.iconColor)}
                        />
                    </div>

                    <AlertDialogHeader className="space-y-2">
                        <AlertDialogTitle className="text-center text-xl font-bold text-foreground">
                            {title}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-center leading-relaxed text-muted-foreground">
                            {typeof description === 'string' ? (
                                <span
                                    dangerouslySetInnerHTML={{
                                        __html: description,
                                    }}
                                />
                            ) : (
                                description
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    {/* Footer with your Custom Buttons */}
                    <AlertDialogFooter className="mt-8 flex w-full flex-row items-center gap-3">
                        <Button
                            variant="secondary"
                            onClick={() => {
                                onCancel();
                                onOpenChange(false);
                            }}
                            disabled={loading}
                            className="h-11 flex-1"
                            rounded="xl"
                        >
                            {cancelText}
                        </Button>

                        <Button
                            variant={config.buttonVariant}
                            loading={loading}
                            onClick={onConfirm}
                            className="h-11 flex-1"
                            rounded="xl"
                        >
                            {confirmText}
                        </Button>
                    </AlertDialogFooter>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    );
}
