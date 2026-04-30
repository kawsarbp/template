import { cn } from '@/lib/utils';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertCircle,
    Check,
    File,
    FileAudio,
    FileCode,
    FileText,
    FileVideo,
    Image as ImageIcon,
    UploadCloud,
    X,
} from 'lucide-react';
import { useCallback, useRef, useState } from 'react';

function formatBytes(bytes, decimals = 2) {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

const isValidFileType = (file, accept) => {
    if (!accept || accept === '*') return true;
    const acceptedTypes = accept.split(',').map((t) => t.trim());

    return acceptedTypes.some((type) => {
        if (type.endsWith('/*')) {
            const mainType = type.replace('/*', '');
            return file.type.startsWith(mainType);
        }
        return (
            file.type === type ||
            file.name.toLowerCase().endsWith(type.toLowerCase())
        );
    });
};

const getFileIcon = (type) => {
    if (type.includes('image'))
        return <ImageIcon className="h-8 w-8 text-primary" />;
    if (type.includes('pdf'))
        return <FileText className="h-8 w-8 text-destructive" />;
    if (type.includes('video'))
        return <FileVideo className="h-8 w-8 text-warning" />;
    if (type.includes('audio'))
        return <FileAudio className="h-8 w-8 text-info" />;
    if (type.includes('text') || type.includes('code'))
        return <FileCode className="h-8 w-8 text-secondary-foreground" />;
    return <File className="h-8 w-8 text-muted-foreground" />;
};

const FileCard = ({ file, onRemove, onRetry }) => {
    const isImage = file.type.startsWith('image/') && file.preview;
    const isPdf = file.type === 'application/pdf' && file.preview;
    const isError = file.status === 'error';

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            onClick={(e) => e.stopPropagation()}
            className={cn(
                'group relative flex h-40 w-full flex-col justify-between overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-md',
                isError
                    ? 'border-destructive/50 bg-destructive/5'
                    : 'border-border bg-card',
            )}
        >
            <div className="absolute inset-0 z-0 flex items-center justify-center bg-muted/30">
                {isImage ? (
                    <img
                        src={file.preview}
                        alt={file.name}
                        className="h-full w-full object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                    />
                ) : isPdf ? (
                    <div className="relative z-20 h-full w-full bg-white">
                        <embed
                            src={`${file.preview}#toolbar=0&navpanes=0&view=FitH`}
                            type="application/pdf"
                            className="h-full w-full rounded-lg"
                        />
                    </div>
                ) : (
                    <div className="rounded-full border border-border bg-muted p-4">
                        {getFileIcon(file.type)}
                    </div>
                )}

                {isError && (
                    <div className="absolute inset-0 z-30 flex items-center justify-center bg-destructive/10 backdrop-blur-[1px]">
                        <span className="rounded border border-destructive/20 bg-card px-2 py-1 text-xs font-bold text-destructive shadow-sm">
                            Upload Failed
                        </span>
                    </div>
                )}
            </div>

            <div className="pointer-events-none relative z-30 flex justify-end p-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove(file.id);
                    }}
                    type="button"
                    className="pointer-events-auto cursor-pointer rounded-full border border-border bg-card/90 p-1.5 text-destructive shadow-sm backdrop-blur-sm transition-all hover:scale-110 hover:bg-destructive/10"
                    title="Remove file"
                >
                    <X size={14} />
                </button>
            </div>

            <div
                className={cn(
                    'pointer-events-none relative z-30 border-t p-3 backdrop-blur-md',
                    isError
                        ? 'border-destructive/20 bg-destructive/10'
                        : 'border-border bg-card/90',
                )}
            >
                <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                        <p
                            className={cn(
                                'truncate text-xs font-bold',
                                isError
                                    ? 'text-destructive'
                                    : 'text-foreground',
                            )}
                            title={file.name}
                        >
                            {file.name}
                        </p>
                        <p className="mr-3.5 text-[10px] font-medium text-muted-foreground">
                            {formatBytes(file.size)}
                        </p>
                    </div>

                    <div className="pointer-events-auto shrink-0">
                        {file.status === 'uploading' && (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        )}
                        {file.status === 'success' && (
                            <div className="rounded-full border border-success/20 bg-success/20 p-1 text-success">
                                <Check size={10} strokeWidth={4} />
                            </div>
                        )}
                        {file.status === 'error' && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRetry(file);
                                }}
                                type="button"
                                className="cursor-pointer rounded-full border border-destructive/20 bg-destructive/20 p-1 text-destructive hover:bg-destructive/30"
                                title="Retry upload"
                            >
                                <AlertCircle size={12} strokeWidth={3} />
                            </button>
                        )}
                    </div>
                </div>

                {file.status === 'uploading' && (
                    <div className="absolute bottom-0 left-0 h-0.5 w-full bg-muted">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${file.progress}%` }}
                            className="h-full bg-primary"
                        />
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export const FileUpload = ({
    onFilesSelected,
    accept = '*',
    allowMultiple = true,
    className,
    files = [],
    fileName = 'attachment',
    setFiles = () => {},
    endpoint,
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [dragError, setDragError] = useState(null);
    const inputRef = useRef(null);

    const handleFiles = useCallback(
        (newFiles) => {
            if (!newFiles) return;
            setDragError(null);

            const validFiles = [];
            const currentCount = files.length;

            Array.from(newFiles).forEach((file, index) => {
                if (!allowMultiple && currentCount + index >= 1) return;

                if (!isValidFileType(file, accept)) {
                    setDragError(`Invalid file type: ${file.name}`);
                    return;
                }

                const isImage = file.type.startsWith('image/');
                const isPdf = file.type === 'application/pdf';

                const extendedFile = {
                    fileObject: file,
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    id: Math.random().toString(36).substring(7),
                    preview:
                        isImage || isPdf
                            ? URL.createObjectURL(file)
                            : undefined,
                    status: 'pending',
                    progress: 0,
                };
                validFiles.push(extendedFile);
            });

            if (validFiles.length > 0) {
                setFiles((prev) => {
                    const updated = allowMultiple
                        ? [...prev, ...validFiles]
                        : validFiles;
                    if (onFilesSelected) onFilesSelected(updated);
                    return updated;
                });
                validFiles.forEach(uploadFile);
            }
        },
        [files, accept, allowMultiple, onFilesSelected],
    );

    const uploadFile = async (file) => {
        if (!endpoint) {
            console.error('No upload endpoint provided');
            setFiles((prev) =>
                prev.map((f) =>
                    f.id === file.id
                        ? {
                              ...f,
                              status: 'error',
                              errorMessage: 'No upload endpoint configured',
                          }
                        : f,
                ),
            );
            return;
        }

        setFiles((prev) =>
            prev.map((f) =>
                f.id === file.id ? { ...f, status: 'uploading' } : f,
            ),
        );

        const formData = new FormData();
        formData.append(fileName, file.fileObject);

        try {
            const response = await axios.post(endpoint, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total,
                    );
                    setFiles((prev) =>
                        prev.map((f) =>
                            f.id === file.id ? { ...f, progress } : f,
                        ),
                    );
                },
            });

            if (response.data.success) {
                setFiles((prev) =>
                    prev.map((f) =>
                        f.id === file.id
                            ? {
                                  ...f,
                                  status: 'success',
                                  progress: 100,
                                  serverUrl: response.data.url, // Store the server URL
                              }
                            : f,
                    ),
                );
                // Trigger callback with updated files including the new serverUrl
                // We need to do this carefully as setFiles is async.
                // Actually, the useEffect or the parent component should observe 'files' state,
                // but here we are inside the upload function.
                // The parent's 'files' state is being updated via setFiles (which is passed from parent).
                // So the parent will see the new state.
            } else {
                throw new Error(response.data.message || 'Upload failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            setFiles((prev) =>
                prev.map((f) =>
                    f.id === file.id
                        ? {
                              ...f,
                              status: 'error',
                              progress: 0,
                              errorMessage:
                                  error.response?.data?.message ||
                                  error.message ||
                                  'Upload failed',
                          }
                        : f,
                ),
            );
        }
    };

    const removeFile = (id) => {
        setFiles((prev) => {
            const updated = prev.filter((f) => f.id !== id);
            if (onFilesSelected) onFilesSelected(updated);
            return updated;
        });
    };

    const retryUpload = (file) => {
        setFiles((prev) =>
            prev.map((f) =>
                f.id === file.id ? { ...f, status: 'pending', progress: 0 } : f,
            ),
        );
        uploadFile(file);
    };

    return (
        <div className={cn('w-full space-y-6', className)}>
            <motion.div
                layout
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                }}
                onDragLeave={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                }}
                onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    handleFiles(e.dataTransfer.files);
                }}
                whileHover={{ scale: 1.002 }}
                whileTap={{ scale: 0.99 }}
                animate={{
                    borderColor: dragError
                        ? 'var(--destructive)'
                        : isDragging
                          ? 'var(--primary)'
                          : 'var(--border)',
                    backgroundColor: dragError
                        ? 'rgba(var(--destructive), 0.05)'
                        : isDragging
                          ? 'rgba(var(--primary), 0.05)'
                          : 'var(--card)',
                }}
                className={cn(
                    'group relative flex w-full cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed py-4 transition-all duration-300',
                    'bg-card hover:border-primary/50 hover:bg-muted/30',
                )}
            >
                <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    multiple={allowMultiple}
                    accept={accept}
                    onChange={(e) => handleFiles(e.target.files)}
                />

                <div className="flex flex-col items-center gap-4 p-6 text-center">
                    <div className="relative">
                        <div className="absolute -inset-4 rounded-full bg-primary/20 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />

                        <div
                            className={cn(
                                'relative rounded-2xl p-4 shadow-sm transition-transform duration-300 group-hover:scale-110',
                                dragError ? 'bg-destructive/10' : 'bg-muted',
                            )}
                        >
                            {dragError ? (
                                <AlertCircle className="h-10 w-10 text-destructive" />
                            ) : (
                                <UploadCloud className="h-10 w-10 text-primary" />
                            )}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <p
                            className={cn(
                                'text-base font-bold transition-colors',
                                dragError
                                    ? 'text-destructive'
                                    : 'text-foreground',
                            )}
                        >
                            {dragError
                                ? 'Invalid File Detected'
                                : 'Click or Drag files here'}
                        </p>
                        <p className="mx-auto max-w-xs text-xs font-medium text-muted-foreground">
                            {dragError
                                ? dragError
                                : `Supports: ${accept === '*' ? 'All files' : accept.replace(/,/g, ', ')}`}
                        </p>
                    </div>
                    <AnimatePresence>
                        {files.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4"
                            >
                                {files.map((file) => (
                                    <FileCard
                                        key={file.id}
                                        file={file}
                                        onRemove={removeFile}
                                        onRetry={retryUpload}
                                    />
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};
