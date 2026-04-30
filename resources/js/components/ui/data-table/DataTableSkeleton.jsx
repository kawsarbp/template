import { Skeleton } from "@/components/ui/skeleton";

export const DataTableSkeleton = ({ columns, rowCount = 10 }) => {
  return (
    <>
      {Array.from({ length: rowCount }).map((_, i) => (
        <tr key={i} className="border-b border-border/50">
          {columns.map((_col, j) => (
            <td key={j} className="p-4 align-middle">
              <div className="flex items-center space-x-4">
                {j === 0 ? (
                  <Skeleton className="h-4 w-4 rounded" />
                ) : (
                  <div className="space-y-2 w-full">
                    <Skeleton className="h-4 w-[80%]" />
                  </div>
                )}
              </div>
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};