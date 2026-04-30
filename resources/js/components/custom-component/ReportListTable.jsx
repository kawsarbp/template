import { useLanguage } from '@/hooks/useLanguage';

export default function ReportListTable({ columns, data, loading, tfoot }) {
    const { t } = useLanguage();

    return (
        <div className="overflow-hidden rounded-xl border border-border shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                        <tr>
                            <th className="w-12 px-4 py-3 text-left font-medium text-muted-foreground">
                                #
                            </th>
                            {columns.map((col, idx) => (
                                <th
                                    key={idx}
                                    className={`px-4 py-3 font-medium text-muted-foreground ${col.className || ''} ${
                                        col.align === 'right'
                                            ? 'text-right'
                                            : col.align === 'center'
                                              ? 'text-center'
                                              : 'text-left'
                                    }`}
                                >
                                    {t(col.header)}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td
                                    colSpan={columns.length + 1}
                                    className="px-4 py-12 text-center text-muted-foreground"
                                >
                                    {t('Loading...')}
                                </td>
                            </tr>
                        ) : data && data.length > 0 ? (
                            data.map((row, index) => (
                                <tr
                                    key={index}
                                    className="border-t border-border transition-colors hover:bg-muted/30"
                                >
                                    <td className="px-4 py-2.5 text-muted-foreground">
                                        {index + 1}
                                    </td>
                                    {columns.map((col, idx) => (
                                        <td
                                            key={idx}
                                            className={`px-4 py-2.5 ${col.className || ''} ${
                                                col.align === 'right'
                                                    ? 'text-right'
                                                    : col.align === 'center'
                                                      ? 'text-center'
                                                      : ''
                                            }`}
                                        >
                                            {col.cell
                                                ? col.cell({ original: row })
                                                : row[col.accessorKey] || 'N/A'}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={columns.length + 1}
                                    className="px-4 py-12 text-center text-muted-foreground"
                                >
                                    {t(
                                        'No data found for the selected period.',
                                    )}
                                </td>
                            </tr>
                        )}
                    </tbody>
                    {tfoot && <tfoot className="bg-muted/50">{tfoot}</tfoot>}
                </table>
            </div>
        </div>
    );
}
