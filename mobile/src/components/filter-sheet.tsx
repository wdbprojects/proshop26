import { useEffect, useState } from "react";
import {
  centsToDollars,
  dollarsToCents,
  EMPTY_FILTERS,
  ProductFilters,
} from "@/lib/filters";
import { ProductFacets } from "@/types/api";
import { View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type FilterSheetProps = {
  visible: boolean;
  facets: ProductFacets | undefined;
  applied: ProductFilters;
  onApply: (filters: ProductFilters) => void;
  onClose: () => void;
};

const FilterSheet = ({
  visible,
  facets,
  applied,
  onApply,
  onClose,
}: FilterSheetProps) => {
  const insets = useSafeAreaInsets();

  /* The draft: edits stay here until the user presses "Show results" */
  const [brands, setBrands] = useState<string[]>(applied.brands);
  const [minText, setMinText] = useState(centsToDollars(applied.minPrice));
  const [maxText, setMaxText] = useState(centsToDollars(applied.maxPrice));

  /* Each time the sheet opens, start again from what is currently applied */
  useEffect(() => {
    if (!visible) return;
    setBrands(applied.brands);
    setMinText(centsToDollars(applied.minPrice));
    setMaxText(centsToDollars(applied.maxPrice));
  }, [visible]);

  const toggleBrand = (brand: string) => {
    setBrands((current) => {
      return current.includes(brand)
        ? current.filter((item) => {
            return item !== brand;
          })
        : [...current, brand];
    });
  };

  const apply = () => {
    onApply({
      brands: brands,
      minPrice: dollarsToCents(minText),
      maxPrice: dollarsToCents(maxText),
    });
    onClose();
  };

  const clearAll = () => {
    onApply(EMPTY_FILTERS);
    onClose();
  };

  const brandOptions = facets?.brands ?? [];

  return (
    <View>
      <Text>FilterSheet</Text>
    </View>
  );
};

export default FilterSheet;
