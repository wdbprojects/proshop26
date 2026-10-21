import { SORT_OPTIONS } from "@/lib/sort-options";
import { ProductSort } from "@/types/api";
import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type SortSheetProps = {
  visible: boolean;
  value: ProductSort;
  hasSearch: boolean;
  onSelect: (value: ProductSort) => void;
  onClose: () => void;
};

export const SortSheet = ({
  visible,
  value,
  hasSearch,
  onSelect,
  onClose,
}: SortSheetProps) => {
  const insets = useSafeAreaInsets();
  /* "Most relevant" only makes sense when there is a search term */
  const options = SORT_OPTIONS.filter((option) => {
    return option.value !== "relevance" || hasSearch;
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 justify-end bg-black/40" onPress={onClose}>
        {/* this inner Pressable swallows taps so touching the sheet itself doesn't close it */}
        <Pressable
          className="rounded-t-3xl bg-background px-4 pt-4"
          style={{ paddingBottom: insets.bottom + 12 }}
        >
          <Text className="mb-2 text-lg font-semibold text-foreground">
            Sort by
          </Text>
          {options.map((option) => {
            return (
              <Pressable
                key={option.value}
                onPress={() => {
                  onSelect(option.value);
                  onClose();
                }}
                className="flex-row items-center justify-between py-3.5"
              >
                <Text
                  className={
                    option.value === value
                      ? "text-base font-semibold text-primary"
                      : "text-base text-foreground"
                  }
                >
                  {option.label}
                </Text>
                {option.value === value && (
                  <Ionicons name="checkmark" size={20} color="#ca3500" />
                )}
              </Pressable>
            );
          })}
        </Pressable>
      </Pressable>
    </Modal>
  );
};
