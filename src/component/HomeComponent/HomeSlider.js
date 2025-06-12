import React from 'react';
import { View, StyleSheet, Image, Dimensions, TouchableOpacity, I18nManager, Text } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { ASSETS_DIR } from '@env';
import Carousel from 'react-native-reanimated-carousel';

const { width: screenWidth } = Dimensions.get('window');
const width = Dimensions.get('window').width;

function Slider(props) {
    console.log('Slider props:', props.data);
    
    // Early return if props.data is not available or doesn't have images
    if (!props.data || !props.data.images || !Array.isArray(props.data.images) || props.data.images.length === 0) {
        console.log('No images available in slider props');
        return (
            <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>No images available</Text>
            </View>
        );
    }

    let images = [];
    let snapDirection = 'left';
    const viewCount = 5;
    
    // Safely map through images with additional validation
    try {
        props.data.images.forEach(function (item, index) {
            if (item && item.image) {
                images.push(ASSETS_DIR + 'banner/' + item.image);
            } else {
                console.warn(`Invalid image item at index ${index}:`, item);
            }
        });
    } catch (error) {
        console.error('Error processing images:', error);
        return (
            <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>Error loading images</Text>
            </View>
        );
    }

    // If no valid images were found after processing
    if (images.length === 0) {
        return (
            <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>No valid images found</Text>
            </View>
        );
    }

    const navToPage = (data) => {
        try {
            // Validate data and link before processing
            if (!data || !data.link) {
                console.warn('Invalid navigation data:', data);
                return;
            }

            let linkText = data.link;
            linkText = linkText.split('-');
            
            if (linkText.length < 2) {
                console.warn('Invalid link format:', data.link);
                return;
            }

            let type = linkText[0];
            let id = linkText[1];

            // Validate navigation prop
            if (!props.navigation) {
                console.warn('Navigation prop not available');
                return;
            }

            if (type === 'category') {
                props.navigation.navigate('ProductListScreen', { 
                    type: 'categorybanner', 
                    id: id, 
                    childerns: [], 
                    title: null 
                });
            }
            else if (type === 'brand') {
                props.navigation.navigate('ProductListScreen', { 
                    type: 'brandbanner', 
                    id: id, 
                    childerns: [], 
                    title: null 
                });
            }
            else if (type === 'product') {
                props.navigation.navigate('ProductDetailScreen', { id: id });
            }
            else {
                console.warn('Unknown navigation type:', type);
            }
        } catch (error) {
            console.error('Error in navigation:', error);
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <Carousel
                loop
                style={{
                    width: '100%',
                    height: 180,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
                width={width}
                height={width / 2}
                pagingEnabled={true}
                snapEnabled={true}
                mode={"horizontal-stack"}
                autoPlay={true}
                autoPlayReverse={I18nManager.isRTL === true ? true : false}
                modeConfig={{
                    snapDirection,
                    stackInterval: 2000,
                }}
                customConfig={() => ({ type: 'positive', viewCount })}
                data={props.data.images}
                scrollAnimationDuration={2000}
                renderItem={({ item, index }) => {
                    // Additional validation for each item
                    if (!item || !item.image) {
                        return (
                            <View style={styles.errorImageContainer}>
                                <Text style={styles.errorImageText}>Image not available</Text>
                            </View>
                        );
                    }

                    return (
                        <TouchableOpacity
                            key={index}
                            onPress={() => navToPage(item)}
                            style={{
                                flex: 1,
                                justifyContent: 'center',
                            }}
                        >
                            <Image 
                                source={{ uri: ASSETS_DIR + 'banner/' + item.image }} 
                                resizeMode="contain" 
                                style={{ height: hp('100%'), width: '100%' }}
                                onError={(error) => {
                                    console.warn('Image loading error:', error);
                                }}
                                // defaultSource={require('./path/to/your/default/image.png')} // Add a default image
                            />
                        </TouchableOpacity>
                    );
                }}
            />
        </View>
    );
}

export default HomeSlider = React.memo(Slider);

const styles = StyleSheet.create({
    item: {
        width: screenWidth - 55,
        height: screenWidth - 220,
        right: wp('3.5%'),
    },
    imageContainer: {
        flex: 1,
        marginBottom: Platform.select({ ios: 0, android: 1 }),
        backgroundColor: 'white',
        borderRadius: 8,
        marginHorizontal: wp('1.5%')
    },
    image: {
        ...StyleSheet.absoluteFillObject,
        resizeMode: 'cover',
    },
    noDataContainer: {
        height: 180,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        marginHorizontal: wp('2%'),
    },
    noDataText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    errorImageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
    },
    errorImageText: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
    },
});