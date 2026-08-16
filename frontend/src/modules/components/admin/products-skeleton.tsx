import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const ProductsSkeleton = () => {
  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {[1, 2, 3, 4, 5, 6].map((item) => {
              return (
                <TableHead
                  key={item}
                  className={cn(item === 1 ? "w-24" : undefined, "h-16")}
                >
                  <Skeleton
                    className={`${item === 2 ? "h-6 w-42" : "h-6 w-16"}`}
                  />
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item) => {
            return (
              <TableRow key={item}>
                {[1, 2, 3, 4, 5, 6].map((subItem) => {
                  return (
                    <TableCell key={subItem} className="h-14">
                      <Skeleton
                        className={cn(subItem === 2 ? "h-4 w-42" : "h-4 w-16")}
                      />
                    </TableCell>
                  );
                })}
                <TableCell></TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProductsSkeleton;
