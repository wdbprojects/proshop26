import ProductCard from "@/components/product-card";
import { useHomeCatalog } from "@/hooks/use-home-catalog";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  Text,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const { categories, products, loadingProducts, error } = useHomeCatalog();
  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={({ item }) => {
          return (
            <View className="w-1/2 p-1.5">
              <ProductCard product={item}></ProductCard>
            </View>
          );
        }}
        contentContainerStyle={{ padding: 10 }}
        ListHeaderComponent={
          <View className="gap-4 px-1.5 pb-3">
            <Text className="text-2xl font-bold text-foreground">Proshop</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              {categories.map((category) => {
                return (
                  <View
                    key={category.id}
                    className="rounded-full bg-muted px-4 py-2"
                  >
                    <Text>{category.name}</Text>
                  </View>
                );
              })}
            </ScrollView>
            <Text className="text-lg font-semibold text-foreground">
              Featured products
            </Text>
          </View>
        }
        ListEmptyComponent={
          loadingProducts ? (
            <ActivityIndicator className="mt-10" />
          ) : error ? (
            <Text className="mt-10 text-center text-destructive">
              {error.message}
            </Text>
          ) : (
            <Text className="mt-10 text-center text-muted-foreground">
              No products yet
            </Text>
          )
        }
      />
    </SafeAreaView>
  );
}
