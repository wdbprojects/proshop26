import { useState } from "react";
import { imageUrl } from "@/lib/format";
import { ProductImage } from "@/types/api";
import { Image } from "expo-image";
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  View,
  useWindowDimensions,
} from "react-native";

const ImageCarousel = ({ images }: { images: ProductImage[] }) => {
  const { width } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);

  /* When a swipe settles, the scroll offset divided by the screen width is the page number */
  const onScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setActiveIndex(Math.round(event.nativeEvent.contentOffset.x / width));
  };

  return (
    <View>
      <FlatList
        data={images}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        renderItem={({ item }) => {
          return (
            <Image
              source={imageUrl(item.url, 900)}
              style={{ width: width, height: width }}
              contentFit="contain"
            />
          );
        }}
      />
      {images.length > 1 && (
        <View className="flex-row justify-center gap-2 py-3">
          {images.map((image, index) => {
            return (
              <View
                key={image.id}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor:
                    index === activeIndex ? "#090B0C" : "#C5CDD0",
                }}
              />
            );
          })}
        </View>
      )}
    </View>
  );
};

export default ImageCarousel;
