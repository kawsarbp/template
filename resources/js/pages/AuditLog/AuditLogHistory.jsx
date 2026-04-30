import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { logConfig } from '@/configs/logConfig';
import { Head, usePage } from '@inertiajs/react';
import {
    Calendar,
    ChevronRight,
    FileText,
    Image as ImageIcon,
    Layers,
    User,
} from 'lucide-react';

const breadcrumbs = [
    { label: 'Audit Logs', href: '/activity-logs' },
    { label: 'Audit Log History' },
];

const getNestedValue = (obj, path) => {
    if (!obj || !path) return undefined;

    // 1. Try direct access first (for keys that literally contain dots like "city.name")
    if (Object.prototype.hasOwnProperty.call(obj, path)) {
        return obj[path];
    }

    // 2. Try nested access for path-like strings (e.g., "service_provider.name")
    const parts = path.split('.').filter(Boolean); // Filter out empty parts from trailing dots
    let current = obj;
    for (const part of parts) {
        if (current && typeof current === 'object' && part in current) {
            current = current[part];
        } else {
            return undefined;
        }
    }
    return current;
};

const FieldValue = ({ value, callback }) => {
    const displayValue =
        callback && typeof value !== 'object' ? callback(value) : value;

    if (
        displayValue === null ||
        displayValue === undefined ||
        displayValue === ''
    ) {
        return (
            <span className="text-xs text-muted-foreground italic">N/A</span>
        );
    }

    // Handle Arrays
    if (Array.isArray(displayValue)) {
        if (displayValue.length === 0)
            return (
                <span className="text-xs text-muted-foreground italic">
                    Empty
                </span>
            );

        // If it's an array of objects (like container_vehicle_log)
        if (typeof displayValue[0] === 'object') {
            // Respect custom field filtering if provided in callback/options
            // We use the 'arrayFields' property from the config if available
            const configKeys =
                callback?.arrayFields || Object.keys(displayValue[0]);
            const labels = callback?.labels || {};

            return (
                <div className="mt-4 overflow-hidden rounded-xl border border-border/60 bg-background/50 shadow-(--shadow-sm)">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-[10px]">
                            <thead>
                                <tr className="border-b border-border/60 bg-secondary/30">
                                    {configKeys.map((k) => (
                                        <th
                                            key={k}
                                            className="px-3 py-2 font-black tracking-tight text-muted-foreground uppercase"
                                        >
                                            {labels[k] || k.replace(/_/g, ' ')}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40">
                                {displayValue.map((item, i) => (
                                    <tr
                                        key={i}
                                        className="transition-colors hover:bg-primary/5"
                                    >
                                        {configKeys.map((k) => (
                                            <td
                                                key={k}
                                                className="px-3 py-2 font-medium text-foreground/80"
                                            >
                                                {typeof item[k] === 'object'
                                                    ? JSON.stringify(item[k])
                                                    : String(item[k] ?? '—')}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        }

        return (
            <div className="mt-1 flex flex-wrap gap-1">
                {displayValue.map((v, i) => (
                    <Badge
                        key={i}
                        variant="outline"
                        className="bg-background/50 text-[10px]"
                    >
                        {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                    </Badge>
                ))}
            </div>
        );
    }

    // Handle Objects
    if (typeof displayValue === 'object') {
        return (
            <div className="mt-2 space-y-1.5 rounded-lg border border-border/30 bg-secondary/20 p-3 text-[10px]">
                {Object.entries(displayValue).map(([k, v]) => (
                    <div
                        key={k}
                        className="flex items-start gap-2 border-b border-border/20 pb-1 last:border-0 last:pb-0"
                    >
                        <span className="w-20 shrink-0 font-bold uppercase opacity-60">
                            {k.replace(/_/g, ' ')}:
                        </span>
                        <span className="break-all text-foreground/80">
                            {typeof v === 'object'
                                ? JSON.stringify(v)
                                : String(v)}
                        </span>
                    </div>
                ))}
            </div>
        );
    }

    return <span className="text-xs font-medium">{String(displayValue)}</span>;
};

const SectionView = ({ section, oldData, newData, media_url }) => {
    const isPhotoSection =
        section.isPhoto ||
        section.sectionName?.toLowerCase().includes('photo') ||
        section.photoSectionName;
    const isAttachmentSection =
        section.isAttachment ||
        section.sectionName?.toLowerCase().includes('attachment');

    // Helper to normalize data to array
    const toArray = (val) => {
        if (!val) return [];
        return Array.isArray(val) ? val : [val];
    };

    const renderPhotoGallery = (
        newData,
        oldData,
        photoKeys,
        layout = 'sections',
    ) => {
        const availableKeys =
            photoKeys ||
            [
                ...new Set([
                    ...Object.keys(newData || {}),
                    ...Object.keys(oldData || {}),
                ]),
            ].filter(
                (k) =>
                    k.toLowerCase().includes('photo') ||
                    k.toLowerCase().includes('picture'),
            );

        // Filter keys that have any data in either new or old
        const keyMap = availableKeys.filter((k) => {
            const hasNew = newData?.[k] && toArray(newData[k]).length > 0;
            const hasOld = oldData?.[k] && toArray(oldData[k]).length > 0;
            return hasNew || hasOld;
        });

        if (keyMap.length === 0) return null;

        const PhotoGrid = ({ current, previous }) => {
            const currentList = toArray(current);
            const previousList = toArray(previous);

            // Diff Logic
            const added = currentList.filter((p) => !previousList.includes(p));
            const removed = previousList.filter(
                (p) => !currentList.includes(p),
            );
            const existing = currentList.filter((p) =>
                previousList.includes(p),
            );

            const displayItems = [
                ...added.map((url) => ({ url, status: 'added' })),
                ...removed.map((url) => ({ url, status: 'removed' })),
                ...existing.map((url) => ({ url, status: 'unchanged' })),
            ];

            return (
                <div className="grid grid-cols-2 gap-4 py-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                    {displayItems.map((item, i) => (
                        <div
                            key={`${item.url}-${i}`}
                            className={`group relative aspect-square overflow-hidden rounded-2xl border bg-secondary/20 transition-all hover:scale-105 hover:shadow-(--shadow-xl) ${item.status === 'added' ? 'border-4 border-success/50 ring-2 ring-success/20' : ''} ${item.status === 'removed' ? 'border-4 border-destructive/50 opacity-60 ring-2 ring-destructive/20 grayscale' : ''} ${item.status === 'unchanged' ? 'border-transparent' : ''}`}
                        >
                            <img
                                src={
                                    item.url.startsWith('http')
                                        ? item.url
                                        : `${media_url}/${item.url}`
                                }
                                alt="Log"
                                className="h-full w-full object-cover"
                            />

                            {item.status === 'added' && (
                                <div className="absolute top-2 right-2">
                                    <Badge className="text-success-foreground border-none bg-success px-2 py-0.5 text-[10px] uppercase shadow-lg">
                                        New
                                    </Badge>
                                </div>
                            )}

                            {item.status === 'removed' && (
                                <div className="absolute top-2 right-2">
                                    <Badge className="border-none bg-destructive px-2 py-0.5 text-[10px] text-destructive-foreground uppercase shadow-lg">
                                        Deleted
                                    </Badge>
                                </div>
                            )}

                            <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
                        </div>
                    ))}
                </div>
            );
        };

        if (layout === 'tabs' && keyMap.length > 1) {
            return (
                <Tabs defaultValue={keyMap[0]} className="mt-6 w-full">
                    <TabsList className="custom-scrollbar mb-6 flex w-full justify-start overflow-x-auto rounded-xl bg-secondary/40 p-1">
                        {keyMap.map((key) => (
                            <TabsTrigger
                                key={key}
                                value={key}
                                className="shrink-0 rounded-lg px-6 text-[10px] font-bold tracking-widest uppercase data-[state=active]:bg-card data-[state=active]:shadow-(--shadow-sm)"
                            >
                                {key.replace(/_/g, ' ')}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    {keyMap.map((key) => (
                        <TabsContent key={key} value={key} className="mt-0">
                            <PhotoGrid
                                current={newData?.[key]}
                                previous={oldData?.[key]}
                            />
                        </TabsContent>
                    ))}
                </Tabs>
            );
        }

        return (
            <div className="mt-6 space-y-8">
                {keyMap.map((key) => (
                    <div key={key}>
                        <h5 className="mb-4 flex items-center gap-3 text-[11px] font-bold tracking-[0.2em] text-muted-foreground uppercase opacity-70">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                            {key.replace(/_/g, ' ')}
                        </h5>
                        <PhotoGrid
                            current={newData?.[key]}
                            previous={oldData?.[key]}
                        />
                    </div>
                ))}
            </div>
        );
    };

    const renderAttachments = (newData, oldData, media_url) => {
        const attachKeys = [
            ...new Set([
                ...Object.keys(newData || {}),
                ...Object.keys(oldData || {}),
            ]),
        ].filter(
            (k) =>
                k.toLowerCase().includes('attachment') ||
                k.toLowerCase().includes('file'),
        );

        // Collect all attachments with keys
        const collectAttachments = (data, keys) => {
            if (!data) return [];
            return keys.reduce((acc, key) => {
                const val = data[key];
                if (Array.isArray(val)) val.forEach((v) => acc.push(v));
                else if (val) acc.push(val);
                return acc;
            }, []);
        };

        const currentFiles = collectAttachments(newData, attachKeys);
        const previousFiles = collectAttachments(oldData, attachKeys);

        const added = currentFiles.filter((f) => !previousFiles.includes(f));
        const removed = previousFiles.filter((f) => !currentFiles.includes(f));
        const existing = currentFiles.filter((f) => previousFiles.includes(f));

        const displayFiles = [
            ...added.map((file) => ({ file, status: 'added' })),
            ...removed.map((file) => ({ file, status: 'removed' })),
            ...existing.map((file) => ({ file, status: 'unchanged' })),
        ];

        if (displayFiles.length === 0) return null;

        return (
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {displayFiles.map(({ file, status }, i) => (
                    <a
                        key={`${file}-${i}`}
                        href={
                            status !== 'removed' ? `${media_url}/${file}` : '#'
                        }
                        target={status !== 'removed' ? '_blank' : undefined}
                        className={`group flex items-center gap-3 truncate rounded-2xl border p-3 shadow-(--shadow-sm) transition-all ${status === 'added' ? 'border-success/50 bg-success/5 hover:border-success' : ''} ${status === 'removed' ? 'cursor-not-allowed border-destructive/50 bg-destructive/5 opacity-60 grayscale hover:border-destructive' : ''} ${status === 'unchanged' ? 'border-border bg-card hover:border-primary/30 hover:bg-secondary/10' : ''} `}
                    >
                        <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${status === 'added' ? 'bg-success/10 text-success' : ''} ${status === 'removed' ? 'bg-destructive/10 text-destructive' : ''} ${status === 'unchanged' ? 'bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white' : ''} `}
                        >
                            <FileText className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col truncate">
                            <span className="truncate text-xs font-bold text-foreground/80">
                                {file.split('/').pop()}
                            </span>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-medium text-muted-foreground uppercase">
                                    Document
                                </span>
                                {status === 'added' && (
                                    <span className="text-[9px] font-black tracking-wider text-success uppercase">
                                        New
                                    </span>
                                )}
                                {status === 'removed' && (
                                    <span className="text-[9px] font-black tracking-wider text-destructive uppercase">
                                        Deleted
                                    </span>
                                )}
                            </div>
                        </div>
                    </a>
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-6 pt-10 first:pt-0">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm">
                        {isPhotoSection ? (
                            <ImageIcon className="h-5 w-5" />
                        ) : isAttachmentSection ? (
                            <FileText className="h-5 w-5" />
                        ) : (
                            <Layers className="h-5 w-5" />
                        )}
                    </div>
                    <h4 className="text-xl leading-none font-black tracking-tight text-foreground uppercase italic">
                        {section.sectionName ||
                            section.photoSectionName ||
                            (isPhotoSection
                                ? 'Photos'
                                : isAttachmentSection
                                  ? 'Attachments'
                                  : 'Information')}
                    </h4>
                </div>
                <div className="mx-6 h-px flex-1 bg-linear-to-r from-primary/30 via-transparent to-transparent" />
            </div>

            {section.fields?.length > 0 && (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {section.fields.map((field, idx) => {
                        const oldValue = getNestedValue(oldData, field.field);
                        const newValue = getNestedValue(newData, field.field);
                        const isChanged =
                            JSON.stringify(oldValue) !==
                            JSON.stringify(newValue);

                        // Check if value is an array of objects to make it full-width
                        const isObjectArray =
                            Array.isArray(newValue) &&
                            newValue.length > 0 &&
                            typeof newValue[0] === 'object';
                        const colSpan = isObjectArray
                            ? 'md:col-span-2 lg:col-span-3'
                            : '';

                        return (
                            <div
                                key={idx}
                                className={`group relative rounded-3xl border border-border/40 bg-card p-6 shadow-(--shadow-card) transition-all duration-300 hover:border-primary/15 hover:shadow-(--shadow-lg) ${isChanged ? 'border-warning/20 ring-1 ring-warning/5' : ''} ${colSpan}`}
                            >
                                {isChanged && (
                                    <div className="absolute top-4 right-4 animate-bounce">
                                        <Badge className="text-warning-foreground rounded-full border-none bg-warning px-2 py-0 text-[10px] font-black uppercase hover:bg-warning/80">
                                            Updated
                                        </Badge>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-black tracking-[0.15em] text-muted-foreground/60 uppercase">
                                            {field.label ||
                                                field.field
                                                    .split('.')
                                                    .pop()
                                                    .replace(/_/g, ' ')}
                                        </span>
                                        {!isChanged && (
                                            <div className="text-sm font-bold text-foreground/90">
                                                <FieldValue
                                                    value={newValue}
                                                    callback={field.callback}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {isChanged && (
                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="space-y-1.5 rounded-2xl border border-destructive/10 bg-destructive/5 p-3">
                                                <span className="text-[9px] font-black tracking-widest text-destructive/40 uppercase">
                                                    Previous
                                                </span>
                                                <div className="text-xs font-medium text-destructive/70 line-through decoration-2">
                                                    <FieldValue
                                                        value={oldValue}
                                                        callback={
                                                            field.callback
                                                        }
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5 rounded-2xl border border-success/15 bg-success/5 p-3 shadow-inner">
                                                <span className="text-[9px] font-black tracking-widest text-success/50 uppercase">
                                                    Current
                                                </span>
                                                <div className="text-sm font-black text-success">
                                                    <FieldValue
                                                        value={newValue}
                                                        callback={
                                                            field.callback
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {isPhotoSection &&
                renderPhotoGallery(
                    newData,
                    oldData,
                    section.photoKeys,
                    section.layout || 'sections',
                )}
            {isAttachmentSection &&
                renderAttachments(newData, oldData, media_url)}
        </div>
    );
};

const SimpleFieldsView = ({ fields, oldData, newData }) => {
    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {fields.map((field, idx) => {
                const oldValue = getNestedValue(oldData, field.field);
                const newValue = getNestedValue(newData, field.field);
                const isChanged =
                    JSON.stringify(oldValue) !== JSON.stringify(newValue);

                return (
                    <div
                        key={idx}
                        className={`rounded-2xl border p-4 ${isChanged ? 'border-warning/30 bg-warning/5' : 'border-border/40 bg-secondary/20'} flex flex-col gap-1.5`}
                    >
                        <span className="text-[10px] font-bold tracking-tight text-muted-foreground uppercase">
                            {field.label ||
                                field.field.split('.').pop().replace(/_/g, ' ')}
                        </span>
                        <div className="flex flex-col">
                            {isChanged ? (
                                <div className="space-y-1">
                                    <div className="text-[10px] text-muted-foreground/60 line-through">
                                        <FieldValue
                                            value={oldValue}
                                            callback={field.callback}
                                        />
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <ChevronRight className="h-3 w-3 text-primary" />
                                        <span className="text-xs font-bold text-primary">
                                            <FieldValue
                                                value={newValue}
                                                callback={field.callback}
                                            />
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <FieldValue
                                    value={newValue}
                                    callback={field.callback}
                                />
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default function AuditLogHistory() {
    const { auditLogs, type, media_url } = usePage().props;
    const { url } = usePage();
    const queryParams = new URLSearchParams(url.split('?')[1]);
    const defaultOpenId =
        queryParams.get('id') ||
        (auditLogs.length > 0 ? String(auditLogs[0].id) : undefined);

    console.log(defaultOpenId);

    const config = logConfig[type] || null;

    const getEventColor = (event) => {
        switch (event.toLowerCase()) {
            case 'created':
                return 'bg-success/10 text-success border-success/30 shadow-(--shadow-glow)';
            case 'updated':
                return 'bg-warning/10 text-warning border-warning/30 shadow-(--shadow-glow)';
            case 'deleted':
                return 'bg-destructive/10 text-destructive border-destructive/30 shadow-(--shadow-glow)';
            default:
                return 'bg-secondary text-secondary-foreground';
        }
    };

    return (
        <DashboardLayout breadcrumbs={breadcrumbs}>
            <Head
                title={`Audit Logs - ${type.replace(/_/g, ' ').toUpperCase()}`}
            />

            <div className="mx-auto max-w-7xl space-y-10 px-6 py-10">
                {!config && (
                    <div className="space-y-6 rounded-[3rem] border-4 border-dashed border-secondary bg-secondary/5 p-20 text-center">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-secondary/20">
                            <Layers className="h-10 w-10 text-muted-foreground/40" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-black uppercase italic">
                                Layout Undefined
                            </h2>
                            <p className="text-muted-foreground">
                                Configuration missing for{' '}
                                <code className="rounded bg-primary/10 px-2 py-0.5 font-bold text-primary">
                                    {type}
                                </code>{' '}
                                in logConfig.js
                            </p>
                        </div>
                    </div>
                )}

                <Accordion
                    key={defaultOpenId}
                    multiple
                    collapsible
                    defaultValue={defaultOpenId ? [defaultOpenId] : []}
                    className="space-y-6"
                >
                    {auditLogs.map((log) => (
                        <AccordionItem
                            key={log.id}
                            value={String(log.id)}
                            className="border-none"
                        >
                            <AccordionTrigger className="p-0 hover:no-underline [&[data-state=open]>div]:border-primary/30 [&[data-state=open]>div]:ring-4 [&[data-state=open]>div]:ring-primary/5">
                                <div className="relative flex w-full flex-col items-center gap-6 overflow-hidden rounded-3xl border border-border/60 bg-card px-8 py-5 text-left shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] transition-all duration-300 hover:border-primary/20 hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] active:scale-[0.99] md:flex-row">
                                    <div
                                        className={`absolute top-0 bottom-0 left-0 w-1 ${
                                            log.event === 'created'
                                                ? 'bg-success/80'
                                                : log.event === 'updated'
                                                  ? 'bg-warning/80'
                                                  : 'bg-destructive/80'
                                        }`}
                                    />
                                    <div className="flex flex-1 items-center gap-6">
                                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary/50 shadow-inner transition-colors group-hover:bg-primary/10">
                                            <User className="h-8 w-8 text-muted-foreground transition-transform duration-500 group-hover:rotate-12 group-hover:text-primary" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-lg font-black tracking-tight text-foreground uppercase">
                                                {log.causer_name ||
                                                    'System Auto-Log'}
                                            </p>
                                            <div className="flex items-center gap-4">
                                                <span className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground/80 uppercase">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    {log.created_at}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex shrink-0 items-center gap-6">
                                        <Badge
                                            className={`border-2 px-6 py-2.5 text-xs font-black tracking-widest uppercase transition-all group-hover:tracking-[0.2em] ${getEventColor(log.event)}`}
                                        >
                                            {log.event}
                                        </Badge>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-4 pt-0 pb-10">
                                <div className="relative -mt-3 space-y-12 rounded-4xl border border-t-0 border-border/30 bg-linear-to-b from-card/60 to-secondary/10 p-10 pt-14 shadow-(--shadow-xl)">
                                    <div className="pointer-events-none absolute top-0 right-0 -mt-32 -mr-32 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
                                    <div className="pointer-events-none absolute bottom-0 left-0 -mb-32 -ml-32 h-64 w-64 rounded-full bg-secondary/40 blur-3xl" />

                                    {config &&
                                        (Array.isArray(config) &&
                                        config[0].sectionName ? (
                                            config.map((section, idx) => (
                                                <SectionView
                                                    key={idx}
                                                    section={section}
                                                    oldData={log.old}
                                                    newData={log.attributes}
                                                    media_url={media_url}
                                                />
                                            ))
                                        ) : (
                                            <SimpleFieldsView
                                                fields={config}
                                                oldData={log.old}
                                                newData={log.attributes}
                                            />
                                        ))}

                                    {/* Smart Auto-Detection for unconfigured photos */}
                                    {(!config ||
                                        (Array.isArray(config) &&
                                            !config.some(
                                                (s) =>
                                                    s.isPhoto ||
                                                    s.sectionName
                                                        ?.toLowerCase()
                                                        .includes('photo'),
                                            ))) &&
                                        Object.keys(log.attributes || {}).some(
                                            (k) =>
                                                k
                                                    .toLowerCase()
                                                    .includes('photo') ||
                                                k
                                                    .toLowerCase()
                                                    .includes('picture'),
                                        ) && (
                                            <SectionView
                                                media_url={media_url}
                                                section={{
                                                    sectionName:
                                                        'Auto-Detected Media',
                                                    isPhoto: true,
                                                    layout: 'sections',
                                                }}
                                                newData={log.attributes}
                                            />
                                        )}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>

                {auditLogs.length === 0 && (
                    <div className="py-40 text-center opacity-40">
                        <p className="text-2xl font-black tracking-widest uppercase italic">
                            No activity history recorded for this entry.
                        </p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
