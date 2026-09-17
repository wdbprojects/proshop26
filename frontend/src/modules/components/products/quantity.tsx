import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface QuantityProps {
  value: number;
  onChange: (value: number) => void;
  max: number;
  disabled: boolean;
}

/* Cap the dropdown length even for high-stock items - nobody needs to scroll through 500 options to buy 2 of something */

const MAX_SELECTABLE = 10;

const Quantity = ({ value, onChange, max, disabled }: QuantityProps) => {
  const optionsCount = Math.max(0, Math.min(max, MAX_SELECTABLE));
  const options = Array.from({ length: optionsCount }, (_, i) => {
    return i + 1;
  });

  return (
    <div>
      <Select
        value={String(value)}
        onValueChange={(val) => onChange(Number(val))}
        disabled={disabled || optionsCount === 0}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Quantity">
            <span className="text-xs">QTY:</span>{" "}
            <span className="font-semibold">{value}</span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-background">
          <SelectGroup>
            {options.map((num) => {
              return (
                <SelectItem key={num} value={String(num)}>
                  <span className="text-xs">QTY:</span>&nbsp;
                  <span className="font-semibold">{num}</span>
                </SelectItem>
              );
            })}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default Quantity;
