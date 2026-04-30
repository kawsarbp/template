import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const InputField = ({
    label,
    name,
    value,
    onChange,
    placeholder,
    type = 'text',
    error,
    id,
    isRequired = false,
    className,
    labelClassName,
    containerClassName,
    ...props
}) => {
    const inputId = id || name;

    return (
        <div className={cn('space-y-2', containerClassName)}>
            {label && (
                <Label
                    htmlFor={inputId}
                    className={cn(
                        'text-sm font-semibold text-muted-foreground',
                        labelClassName,
                        isRequired && 'gap-0 after:content-["*"]',
                    )}
                >
                    {label}
                </Label>
            )}

            <Input
                id={inputId}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={cn(
                    'h-11 bg-background transition-all focus-visible:ring-1',
                    error ? 'border-destructive' : '',
                    className,
                )}
                {...props}
            />

            {error && (
                <p className="text-sm font-medium text-destructive">{error}</p>
            )}
        </div>
    );
};

export default InputField;
