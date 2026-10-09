"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import PaginationControls from "@/modules/components/catalog/pagination-controls";

interface ServerPagination {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  /* When provided, `data` is treated as already being just the current page (as /api/admin/products returns it) - TanStack Table's own pagination feature is disabled, since having it slice an already-server-paginated array would make Previous/Next silently useless (there's nothing left locally to page into). The shared PaginationControls (same component the customer catalog page uses) renders instead of the built-in Prev/Next buttons. Omit this prop to keep the original fully-client-side behaviour for any other table using this component. */
  pagination?: ServerPagination;
}

export const DataTable = <TData, TValue>({
  columns,
  data,
  pagination,
}: DataTableProps<TData, TValue>) => {
  const isManual = Boolean(pagination);

  const table = useReactTable({
    data: data,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    ...(isManual
      ? { manualPagination: true, pageCount: pagination!.totalPages }
      : {
          getPaginationRowModel: getPaginationRowModel(),
          initialState: { pagination: { pageSize: 10 } },
        }),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => {
              return (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                return (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => {
                      return (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {isManual ? (
        <PaginationControls
          page={pagination!.page}
          totalPages={pagination!.totalPages}
          onPageChange={pagination!.onPageChange}
        />
      ) : (
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            className="w-20"
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            className="w-20"
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};
