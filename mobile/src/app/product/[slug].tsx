import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useProductDetails } from "@/hooks/use-product-details";
import { ApiError } from "@/lib/api";
import ImageCarousel from "@/components/image-carousel";
import { formatPrice } from "@/lib/format";

const BackButton = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <Pressable
      onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))}
      hitSlop={8}
      style={{
        position: "absolute",
        top: insets.top + 8,
        left: 12,
        zIndex: 10,
      }}
      className="size-11 items-center justify-center rounded-full bg-black/40 active:bg-black/60"
    >
      <Ionicons name="chevron-back" size={26} color="#FFFFFF" />
    </Pressable>
  );
};

const ProductDetails = () => {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const insets = useSafeAreaInsets();
  const { product, isLoading, error } = useProductDetails(slug);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <BackButton />
        <ActivityIndicator />
      </View>
    );
  }

  if (error || !product) {
    const notFound = error instanceof ApiError && error.status === 404;
    return (
      <View className="flex-1 items-center justify-center bg-background p-6">
        <BackButton />
        <Text className="text-center text-muted-foreground">
          {notFound
            ? "Product not found"
            : (error?.message ?? "Something went wrong")}
        </Text>
      </View>
    );
  }

  const soldOut = product.stock === 0;
  const lowStock = product.stock > 0 && product.stock <= 5;

  return (
    <View
      className="flex-1 bg-background"
      style={{
        paddingTop: insets.top,
        paddingBottom: Math.max(insets.bottom, 12),
      }}
    >
      <ScrollView>
        <ImageCarousel images={product.images} />
        <View className="gap-3 p-4">
          {product.brand && (
            <Text className="text-sm text-muted-foreground">
              {product.brand}
            </Text>
          )}
          <Text className="text-3xl font-bold text-foreground">
            {product.name}
          </Text>
          <Text className="text-3xl font-bold text-foreground">
            {formatPrice(product.priceCents, product.currency)}
          </Text>
          <Text
            className={
              soldOut
                ? "text-sm font-medium text-destructive"
                : lowStock
                  ? "text-sm font-medium text-primary"
                  : "text-sm font-medium text-green-700"
            }
          >
            {soldOut
              ? "Out of stock"
              : lowStock
                ? `Only ${product.stock} left`
                : "In stock"}
          </Text>

          <View className="mt-2 gap-2">
            <Text className="text-base font-semibold text-foreground">
              About this item
            </Text>
            <Text className="text-base leading-6 text-foreground">
              {product.description}
            </Text>
            {product.longDescription !== "" && (
              <Text className="text-base leading-6 text-muted-foreground">
                {product.longDescription}
              </Text>
            )}
          </View>
        </View>
      </ScrollView>

      <BackButton />

      {/* fixed call-to-action bar, not wired yet: "Add to cart" comes with the cart phase, "But it now" with sign-in and checkout */}

      <View
        className="flex-row gap-3 border-t border-border bg-background px-4 pt-4"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        <Pressable
          disabled={soldOut}
          className={
            soldOut
              ? "flex-1 items-center rounded-full border border-primary py-3 opacity-40"
              : "flex-1 items-center rounded-full border border-primary py-3 active:opacity-80"
          }
        >
          <Text className="text-base font-semibold text-primary">
            Add to cart
          </Text>
        </Pressable>
        <Pressable
          disabled={soldOut}
          className={
            soldOut
              ? "flex-1 items-center rounded-full bg-primary py-3.5 opacity-40"
              : "flex-1 items-center rounded-full bg-primary py-3.5 active:opacity-80"
          }
        >
          <Text className="text-base font-semibold text-primary-foreground">
            Buy it now
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

export default ProductDetails;
