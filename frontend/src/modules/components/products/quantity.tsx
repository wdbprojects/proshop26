import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Quantity = () => {
  return (
    <div>
      <Select>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Quantity" />
        </SelectTrigger>
        <SelectContent className="bg-background">
          <SelectGroup>
            <SelectItem>
              <span className="text-xs">QTY:</span>
              <span className="font-semibold">1</span>
            </SelectItem>
            <SelectItem>
              <span className="text-xs">QTY:</span>
              <span className="font-semibold">2</span>
            </SelectItem>
            <SelectItem>
              <span className="text-xs">QTY:</span>
              <span className="font-semibold">3</span>
            </SelectItem>
            <SelectItem>
              <span className="text-xs">QTY:</span>
              <span className="font-semibold">4</span>
            </SelectItem>
            <SelectItem>
              <span className="text-xs">QTY:</span>
              <span className="font-semibold">5</span>
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default Quantity;
