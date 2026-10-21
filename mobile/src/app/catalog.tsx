import { useEffect, useRef, useState } from "react";
import { Product, ProductSort } from "@/types/api";
import { useLocalSearchParams, useRouter } from "expo-router";
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
  const router = useRouter();
  const params = useLocalSearchParams<{ category?: string; focus?: string }>();

  const [input, setInput] = useState("");
  const [category, setCategory] = useState(params.category ?? "");
  const [sortChoice, setSortChoice] = useState<ProductSort | null>(null);
  const [sortOpen, setSortOpen] = useState(false);
  const listRef = useRef<FlatList<Product>>(null);

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
    isLoading,
    isPlaceholderData,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useProductsCatalog({ q, category, sort });

  /* New search, category or sort: jump back to the top of the list */
  useEffect(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [q, category, sort]);

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      {/* SEARCH BAR */}
      <View className="flex-row items-center gap-2 px-3 pb-2 pt-2">
        <Pressable
          onPress={() => {
            return router.canGoBack() ? router.back() : router.replace("/");
          }}
          hitSlop={8}
          className="size-11 items-center justify-center"
        >
          <Ionicons name="chevron-back" size={26} color="#090B0C" />
        </Pressable>
        <View className="h-11 flex-1 flex-row items-center gap-2 rounded-full bg-muted px-4">
          <Ionicons name="search" size={18} color="#67787C" />
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Search products"
            placeholderTextColor="#67787C"
            autoFocus={params.focus === "1"}
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
          onPress={() => setCategory("")}
        />
        {categories.map((item) => {
          return (
            <Chip
              key={item.id}
              label={item.name}
              active={category === item.slug}
              onPress={() => setCategory(item.slug)}
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
          isFetchingNextPage ? <ActivityIndicator className="py-6" /> : null
        }
      />
      <SortSheet
        visible={sortOpen}
        value={sort}
        hasSearch={hasQuery}
        onSelect={setSortChoice}
        onClose={() => setSortOpen(false)}
      />
    </SafeAreaView>
  );
};

export default Catalog;
