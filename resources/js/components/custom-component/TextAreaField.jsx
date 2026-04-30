import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Textarea } from '../ui/textarea';

const TextAreaField = ({
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
    rows = 3,
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

            <Textarea
                id={inputId}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                rows={`${rows}`}
                placeholder={placeholder}
                className={cn(
                    'min-h-0 bg-background transition-all focus-visible:ring-1',
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

export default TextAreaField;
