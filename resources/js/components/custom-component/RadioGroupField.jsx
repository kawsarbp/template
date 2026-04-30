import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

const RadioGroupField = ({
    label,
    name,
    options = [],
    value,
    onChange,
    error,
    className,
    isBoolean = false,
}) => {
    return (
        <div className={cn('space-y-2', className)}>
            <Label className="text-sm font-semibold text-muted-foreground">
                {label}
            </Label>

            <RadioGroup
                name={name}
                value={value?.toString()}
                onValueChange={(val) =>
                    onChange({
                        target: {
                            name: name,
                            value: val,
                        },
                    })
                }
                className="flex items-center gap-6"
            >
                {options.map((option) => (
                    <div
                        key={option.id}
                        className="flex items-center space-x-2"
                    >
                        <RadioGroupItem
                            value={
                                isBoolean
                                    ? option?.value
                                    : option?.value?.toString()
                            }
                            id={`${name}-${option.id}`}
                        />
                        <Label
                            htmlFor={`${name}-${option.id}`}
                            className="cursor-pointer text-sm font-medium"
                        >
                            {option.label}
                        </Label>
                    </div>
                ))}
            </RadioGroup>

            {error && (
                <p className="text-sm font-medium text-destructive">{error}</p>
            )}
        </div>
    );
};

export default RadioGroupField;
