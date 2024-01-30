import {
  View,
  StyleSheet,
  FlatList,
  Image,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Animated,
} from 'react-native';
import React, {FC, useRef} from 'react';

const {width, height} = Dimensions.get('screen');
const IMAGE_WIDTH = 50;
const IMAGE_HEIGHT = 60;
const SEPERATOR = 6;

const images = [
  'https://m.economictimes.com/thumb/height-450,width-600,imgsize-92902,msid-96559100/the-rimac-nevera-is-now-the-fastest-electric-car-in-the-world-image-rimac.jpg',
  'https://www.cadillac.com/content/dam/cadillac/na/us/english/ux/homepage-foundation/new-suvs-dic/24-cadillac-homepage-masthead-lyriq-test-target-l.jpg',
  'https://i.pinimg.com/736x/10/66/46/1066461b5705cbd2a4a074dfa7df12e9.jpg',
  'https://www.mitsubishicars.com/content/dam/mitsubishi-motors-us/images/siteimages/events/2022-year-end-sales/2022-mitsubishi-outlander-phev-white-desert-m.jpg',
  'https://www.autocar.co.uk/sites/autocar.co.uk/files/images/car-reviews/first-drives/legacy/10-porsche-718-cayman-gt4-rs-top-10.jpg',
  'https://hips.hearstapps.com/hmg-prod/images/honda-prelude-concept-front-three-quarters-653927960f1f4.jpg',
  'https://e0.pxfuel.com/wallpapers/1020/193/desktop-wallpaper-black-car-iphone-car-for-iphone.jpg',
  'https://www.bmwusa.com/content/dam/bmw/common/homepage/fmas/2023-01/mobile/BMW-Secondary-FMA-Homepage-Cookied-Tile-01-Mobile.jpg',
  'https://www.bentleymotors.com/content/dam/bentley/Master/homepage%20carousel/1024x512_icon_4.jpg/_jcr_content/renditions/original.image_file.700.350.file/1024x512_icon_4.jpg',
  'https://www.bmwusa.com/content/dam/bmw/common/homepage/fmas/2024-01/mobile/BMW-2023-Offers-January-Primary-FMA-i7-Mobile-V2.jpg',
];

type RenderSmallImage = {
  item: string;
  index: number;
  scrollX: Animated.Value;
};

const RenderSmallImage: FC<RenderSmallImage> = ({item, index, scrollX}) => {
  const leftPosition = (index - 1) * (IMAGE_WIDTH + SEPERATOR);
  const centerPosition = index * (IMAGE_WIDTH + SEPERATOR);
  const rigthPosition = (index + 1) * (IMAGE_WIDTH + SEPERATOR);

  const inputRange = [leftPosition, centerPosition, rigthPosition];
  const outputRange = [1, 1.3, 1];

  return (
    <Animated.Image
      style={[
        styles.smallImg,
        {
          transform: [
            {
              scale: scrollX.interpolate({
                inputRange,
                outputRange,
                extrapolate: 'clamp',
              }),
            },
          ],
        },
      ]}
      source={{uri: item}}
    />
  );
};

const Gallery = () => {
  const bigListRef = useRef<FlatList>(null);
  const smallListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0));
  const isSmallScroll = useRef(false);
  const isBigScroll = useRef(false);

  const onSmallScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isSmallScroll.current) {
      const index = Math.round(
        event.nativeEvent.contentOffset.x / (IMAGE_WIDTH + SEPERATOR),
      );
      bigListRef.current?.scrollToIndex({
        animated: false,
        index: Math.min(Math.max(index, 0), images.length - 1),
      });

      scrollX.current.setValue(event.nativeEvent.contentOffset.x);
    }
  };

  const onBigScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isBigScroll.current) {
      const index = Math.round(event.nativeEvent.contentOffset.x / width);

      smallListRef.current?.scrollToIndex({
        animated: true,
        index: Math.min(Math.max(index, 0), images.length - 1),
      });
    }
  };

  const renderImage = ({item}: {item: string}) => {
    return <Image style={styles.image} source={{uri: item}} />;
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={bigListRef}
        pagingEnabled
        horizontal
        data={images}
        renderItem={renderImage}
        onScroll={onBigScroll}
        onTouchStart={() => {
          isBigScroll.current = true;
        }}
        onMomentumScrollEnd={event => {
          isBigScroll.current = false;
          scrollX.current.setValue(
            (event.nativeEvent.contentOffset.x * (IMAGE_WIDTH + SEPERATOR)) /
              width,
          );
        }}
        showsHorizontalScrollIndicator={false}
      />
      <FlatList
        ref={smallListRef}
        pagingEnabled
        horizontal
        data={images}
        onTouchStart={() => {
          isSmallScroll.current = true;
        }}
        onMomentumScrollEnd={() => {
          isSmallScroll.current = false;
        }}
        onScroll={onSmallScroll}
        style={styles.smallList}
        snapToInterval={IMAGE_WIDTH + SEPERATOR}
        decelerationRate={'fast'}
        ItemSeparatorComponent={() => <View style={{width: SEPERATOR}} />}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        getItemLayout={(data, index) => {
          return {
            offset: (IMAGE_WIDTH + SEPERATOR) * index,
            index,
            length: IMAGE_WIDTH + SEPERATOR,
          };
        }}
        renderItem={({item, index}) => (
          <RenderSmallImage
            scrollX={scrollX.current}
            item={item}
            index={index}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  image: {
    width,
    height,
    resizeMode: 'contain',
  },
  smallImg: {
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
  },
  smallList: {
    position: 'absolute',
    zIndex: 1,
    bottom: 20,
  },
  listContainer: {
    paddingHorizontal: (width - IMAGE_WIDTH) / 2,
    paddingVertical: 15,
  },
});

export default Gallery;
