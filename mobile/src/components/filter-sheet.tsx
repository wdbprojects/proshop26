import { useEffect, useState } from "react";
import {
  centsToDollars,
  dollarsToCents,
  EMPTY_FILTERS,
  ProductFilters,
} from "@/lib/filters";
import { ProductFacets } from "@/types/api";
import {
  View,
  Text,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { formatPrice } from "@/lib/format";

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
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <Pressable className="flex-1 justify-end bg-black/40" onPress={onClose}>
          <Pressable
            className="max-h-[85%] rounded-t-3xl bg-background px-4 pt-4"
            style={{ paddingBottom: insets.bottom + 12 }}
          >
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-foreground">
                Filters
              </Text>
              <Pressable onPress={clearAll} hitSlop={8}>
                <Text className="text-sm font-medium text-primary">
                  Clear all
                </Text>
              </Pressable>
            </View>
            <ScrollView keyboardShouldPersistTaps="handled">
              {/* BRAND */}
              <Text className="mb-1 mt-2 text-base font-semibold text-foreground">
                Brand
              </Text>
              {brandOptions.length === 0 ? (
                <Text className="py-2 text-sm text-muted-foreground">
                  No brand options for this view
                </Text>
              ) : (
                brandOptions.map((option) => {
                  const selected = brands.includes(option.brand);
                  return (
                    <Pressable
                      key={option.brand}
                      onPress={() => toggleBrand(option.brand)}
                      className="flex-row items-center justify-between py-2.5"
                    >
                      <View className="flex-row items-center gap-3">
                        <Ionicons
                          size={22}
                          color={selected ? "#CA3500" : "#67787C"}
                          name={selected ? "checkbox" : "square-outline"}
                        />
                        <Text className="text-base text-foreground">
                          {option.brand}
                        </Text>
                      </View>
                      <Text className="text-sm text-muted-foreground">
                        {option.count}
                      </Text>
                    </Pressable>
                  );
                })
              )}
              {/* PRICE */}
              <Text className="mb-2 mt-5 text-base font-semibold text-foreground">
                Price
              </Text>
              <View className="flex-row items-center gap-3">
                <View className="h-11 flex-1 flex-row items-center rounded-xl bg-muted px-3">
                  <Text className="text-muted-foreground text-base">$</Text>
                  <TextInput
                    value={minText}
                    onChangeText={setMinText}
                    keyboardType="decimal-pad"
                    placeholder={
                      facets ? centsToDollars(facets.price.min) : "Min"
                    }
                    placeholderTextColor="#67787C"
                    className="ml-1 flex-1 text-base text-foreground h-full py-0"
                    style={{ lineHeight: undefined }}
                  />
                </View>
                <Text className="text-muted-foreground">to</Text>
                <View className="h-11 flex-1 flex-row items-center rounded-xl bg-muted px-3">
                  <Text className="text-muted-foreground text-base">$</Text>
                  <TextInput
                    value={maxText}
                    onChangeText={setMaxText}
                    keyboardType="decimal-pad"
                    placeholder={
                      facets ? centsToDollars(facets.price.max) : "Max"
                    }
                    placeholderTextColor="#67787C"
                    className="ml-1 flex-1 text-base text-foreground h-full py-0"
                    style={{ lineHeight: undefined }}
                  />
                </View>
              </View>
              {facets && (
                <Text className="mt-2 text-xs text-muted-foreground">
                  Prices here range from {formatPrice(facets.price.min, "usd")}{" "}
                  to {formatPrice(facets.price.max, "usd")}
                </Text>
              )}
            </ScrollView>
            <Pressable
              onPress={apply}
              className="mt-4 items-center rounded-full bg-primary py-3.5"
            >
              <Text className="text-base font-semibold text-primary-foreground">
                Show results
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default FilterSheet;
