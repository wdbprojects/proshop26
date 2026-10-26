import { useEffect, useRef, useState, ComponentRef } from "react";
import { Product, ProductSort } from "@/types/api";
import { useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  FlatList,
  Pressable,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useProductsCatalog } from "@/hooks/use-products-catalog";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { SORT_OPTIONS } from "@/lib/sort-options";
import ProductCard from "@/components/product-card";
import { SortSheet } from "@/components/sort-sheet";
import FilterSheet from "@/components/filter-sheet";
import {
  countActiveFilters,
  EMPTY_FILTERS,
  ProductFilters,
} from "@/lib/filters";

const Chip = ({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) => {
  return (
    <Pressable
      onPress={onPress}
      className={
        active
          ? "rounded-full bg-primary px-4 py-2"
          : "rounded-full bg-muted px-4 py-2"
      }
    >
      <Text
        className={
          active
            ? "text-sm font-medium text-primary-foreground"
            : "text-sm text-foreground"
        }
      >
        {label}
      </Text>
    </Pressable>
  );
};

const Catalog = () => {
  // const params = useLocalSearchParams<{ category?: string; focus?: string }>();
  const params = useLocalSearchParams<{
    category?: string;
    focus?: string;
    ts?: string;
  }>();

  const [input, setInput] = useState("");
  const [category, setCategory] = useState("");
  const [sortChoice, setSortChoice] = useState<ProductSort | null>(null);
  const [sortOpen, setSortOpen] = useState(false);
  const [filters, setFilters] = useState<ProductFilters>(EMPTY_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const activeCount = countActiveFilters(filters);

  const listRef = useRef<FlatList<Product>>(null);

  const inputRef = useRef<ComponentRef<typeof TextInput>>(null);

  /* The query uses the debounced text, the input box shows what is typed right now */
  const q = useDebouncedValue(input.trim());
  const hasQuery = q !== "";

  /* Same rule as the web: relevance is the default with a search, newest without one  */
  const defaultSort: ProductSort = hasQuery ? "relevance" : "newest";
  const sort: ProductSort =
    sortChoice && (sortChoice !== "relevance" || hasQuery)
      ? sortChoice
      : defaultSort;
  const {
    categories,
    products,
    total,
    facets,
    isLoading,
    isPlaceholderData,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useProductsCatalog({ q, category, sort, filters });

  /* New search, category or sort: jump back to the top of the list */
  useEffect(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [q, category, sort, filters]);

  /* Home sent us here on purpose: start a fresh view for that intent */
  useEffect(() => {
    if (!params.ts) return;
    setCategory(params.category ?? "");
    setInput("");
    setSortChoice(null);
    setFilters(EMPTY_FILTERS);
    if (params.focus) inputRef.current?.focus();
  }, [params.ts]);

  const selectCategory = (slug: string) => {
    setCategory(slug);
    setFilters(EMPTY_FILTERS);
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      {/* SEARCH BAR */}
      <View className="flex-row items-center gap-2 px-3 pb-2 pt-2">
        <View className="h-11 flex-1 flex-row items-center gap-2 rounded-full bg-muted px-4">
          <Ionicons name="search" size={18} color="#67787C" />
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Search products"
            placeholderTextColor="#67787C"
            ref={inputRef}
            autoCorrect={false}
            returnKeyType="search"
            className="flex-1 text-base text-foreground"
          />
          {input.length > 0 && (
            <Pressable onPress={() => setInput("")} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color="#67787C" />
            </Pressable>
          )}
        </View>
      </View>
      {/* CATEGORY CHIPS. flexGrow: 0 matters: a horizontal ScrollView inside a column stretches to fill the height unless told not to. */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0, flexShrink: 0, height: 44 }}
        contentContainerStyle={{
          gap: 8,
          paddingHorizontal: 12,
          paddingVertical: 4,
          alignItems: "center",
        }}
      >
        <Chip
          label="All"
          active={category === ""}
          onPress={() => selectCategory("")}
        />
        {categories.map((item) => {
          return (
            <Chip
              key={item.id}
              label={item.name}
              active={category === item.slug}
              onPress={() => selectCategory(item.slug)}
            />
          );
        })}
      </ScrollView>
      {/* RESULT COUNT + SORT */}
      <View className="flex-row items-center justify-between px-4 py-2">
        <Text className="text-sm text-muted-foreground">
          {isLoading
            ? "Loading..."
            : `${total} ${total === 1 ? "result" : "results"}`}
        </Text>

        <View className="flex-row items-center gap-6">
          <View className="flex-row items-center gap-6">
            {activeCount > 0 && (
              <Pressable
                onPress={() => setFilters(EMPTY_FILTERS)}
                hitSlop={8}
                className="flex flex-row items-center gap-0.5"
              >
                {/* <Ionicons name="close" size={16} color="#ca3500" /> */}
                <Text className="text-sm font-medium text-primary">
                  Clear all
                </Text>
              </Pressable>
            )}
          </View>
          <Pressable
            onPress={() => setFiltersOpen(true)}
            hitSlop={8}
            className="flex-row items-center gap-1"
          >
            <Ionicons name="options-outline" size={16} color="#090B0C" />
            <Text className="text-sm font-medium text-foreground">
              {activeCount > 0 ? `Filters (${activeCount})` : "Filters"}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setSortOpen(true)}
            hitSlop={8}
            className="flex-row items-center gap-1"
          >
            <Ionicons name="swap-vertical" size={16} color="#090B0C" />
            <Text className="text-sm font-medium text-foreground">
              {
                SORT_OPTIONS.find((option) => {
                  return option.value === sort;
                })?.label
              }
            </Text>
          </Pressable>
        </View>
        {/* <Pressable
          onPress={() => setSortOpen(true)}
          hitSlop={8}
          className="flex-row items-center gap-1"
        >
          <Ionicons name="swap-vertical" size={16} color="#090B0C" />
          <Text className="text-sm font-medium text-foreground">
            {
              SORT_OPTIONS.find((option) => {
                return option.value === sort;
              })?.label
            }
          </Text>
        </Pressable> */}
      </View>
      {/* PRODUCT GRID */}
      <FlatList
        ref={listRef}
        data={products}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={({ item }) => {
          return (
            <View className="w-1/2 p-1.5">
              <ProductCard product={item} />
            </View>
          );
        }}
        contentContainerStyle={{ padding: 10 }}
        style={{ opacity: isPlaceholderData ? 0.5 : 1 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator className="mt-10" />
          ) : error ? (
            <Text className="mt-10 text-center text-destructive">
              {error.message}
            </Text>
          ) : (
            <Text className="mt-10 text-center text-muted-foreground">
              No products found
            </Text>
          )
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator className="py-6" />
          ) : undefined
        }
      />
      <SortSheet
        visible={sortOpen}
        value={sort}
        hasSearch={hasQuery}
        onSelect={setSortChoice}
        onClose={() => setSortOpen(false)}
      />
      <FilterSheet
        visible={filtersOpen}
        facets={facets}
        applied={filters}
        onApply={setFilters}
        onClose={() => setFiltersOpen(false)}
      />
    </SafeAreaView>
  );
};

export default Catalog;
