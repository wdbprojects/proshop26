import { Text, Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { Product } from "@/types/api";
import { formatPrice, imageUrl } from "@/lib/format";
import { Image } from "expo-image";

const ProductCard = ({ product }: { product: Product }) => {
  const router = useRouter();
  const image = product.images[0];

  return (
    <Pressable
      onPress={() => router.push(`/product/${product.slug}`)}
      className="overflow-hidden rounded-2xl border border-border bg-card active:opacity-80"
    >
      <Image
        source={image ? imageUrl(image.url, 400) : undefined}
        style={{ width: "100%", aspectRatio: 1 }}
        contentFit="cover"
        transition={150}
      />
      <View className="gap-1 p-3">
        <Text numberOfLines={2} className="text-sm font-medium text-foreground">
          {product.name}
        </Text>
        <Text className="text-base font-bold text-foreground">
          {formatPrice(product.priceCents, product.currency)}
        </Text>
        {product.stock === 0 && (
          <Text className="text-xs text-destructive">Out of stock</Text>
        )}
      </View>
    </Pressable>
  );
};

export default ProductCard;
