import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image, Dimensions } from 'react-native';
import { GlobalStyles, Colors } from '@helpers'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Fonts from '@helpers/Fonts';
import Stars from 'react-native-stars';
import Icon from 'react-native-vector-icons/FontAwesome';
import { ASSETS_DIR, CURRENCY } from '@env';
import { numberWithComma, calculateOffPercentage } from '@helpers/FunctionHelper';
import FastImage from 'react-native-fast-image'
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

function DealsProduct(props) {
    const data = props.data;
    console.log("data = props.data", props.data)
    const wishlistArr = props.wishlistArray ? props.wishlistArray : null;

    let off = null;
    let offPercentage = 0;
    let special = 0;
    if (data.special != null) {
        special = data.special.price;
        offPercentage = calculateOffPercentage(data.price, data.special.price);
        off = offPercentage + '% OFF';
    }

    const renderImage = () => {
        const imageUri = data.image ? `${ASSETS_DIR}product/${data.image}` : `${ASSETS_DIR}/assets/img/default.png`;
        
        return (
            <View style={styles.imageContainer}>
                <FastImage
                    style={styles.image}
                    source={{
                        uri: imageUri,
                        priority: FastImage.priority.high,
                    }}
                    resizeMode={FastImage.resizeMode.cover}
                    onError={() => console.log('Image failed to load')}
                />
                
                {/* Gradient overlay for better text visibility */}
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.3)']}
                    style={styles.imageGradient}
                />
                
                {/* Discount Badge */}
                {offPercentage > 0 && (
                    <View style={styles.discountBadge}>
                        <LinearGradient
                            colors={['#FF6B6B', '#FF8E53']}
                            style={styles.discountGradient}
                            start={{x: 0, y: 0}}
                            end={{x: 1, y: 1}}
                        >
                            <Text style={styles.discountText}>{Math.round(offPercentage)}%</Text>
                            <Text style={styles.discountLabel}>OFF</Text>
                        </LinearGradient>
                    </View>
                )}
                
                {/* New Badge */}
                {data.out_of_stock == false && data.new == true && (
                    <View style={styles.newBadge}>
                        <LinearGradient
                            colors={['#4ECDC4', '#44A08D']}
                            style={styles.newGradient}
                        >
                            <Text style={styles.newText}>NEW</Text>
                        </LinearGradient>
                    </View>
                )}
            </View>
        );
    };

    const renderWishlistButton = () => {
        const isInWishlist = wishlistArr && wishlistArr.length > 0 && wishlistArr.includes(data.product_id);
        
        return (
            <TouchableOpacity 
                style={[styles.wishlistButton, isInWishlist ? styles.wishlistActive : styles.wishlistInactive]} 
                onPress={() => props.userAuth ? props.addToWishlist(data.product_id) : props.navToLogin()}
            >
                <Icon 
                    name={isInWishlist ? "heart" : "heart-o"} 
                    size={16} 
                    color={isInWishlist ? "#FF6B6B" : "#999"} 
                />
            </TouchableOpacity>
        );
    };

    return (
        <TouchableOpacity style={styles.productCard} onPress={() => props.navToDetail(data)}>
            {/* Product Image Section */}
            {renderImage()}
            
            {/* Product Information Section */}
            <View style={styles.productInfo}>
                {/* Rating */}
                <View style={styles.ratingContainer}>
                    <Stars
                        default={data.review_avg ? parseFloat(data.review_avg) : 0}
                        count={5}
                        half={true}
                        starSize={45}
                        fullStar={<Icon name={'star'} size={12} style={styles.starFilled} />}
                        emptyStar={<Icon name={'star-o'} size={12} style={styles.starEmpty} />}
                        halfStar={<Icon name={'star-half-empty'} size={12} style={styles.starFilled} />}
                        disabled={true}
                    />
                    {data.review_avg && (
                        <Text style={styles.ratingText}>({parseFloat(data.review_avg).toFixed(1)})</Text>
                    )}
                </View>
                
                {/* Product Name */}
                <Text style={styles.productName} numberOfLines={2}>
                    {data.productDescription?.name || 'Product Name'}
                </Text>
                
                {/* Price Section */}
                <View style={styles.priceContainer}>
                    <View style={styles.priceRow}>
                        {special > 0 ? (
                            <>
                                <Text style={styles.specialPrice}>
                                    {CURRENCY}{numberWithComma(special)}
                                </Text>
                                <Text style={styles.originalPrice}>
                                    {CURRENCY}{numberWithComma(data.price)}
                                </Text>
                            </>
                        ) : (
                            <Text style={styles.regularPrice}>
                                {CURRENCY}{numberWithComma(data.price)}
                            </Text>
                        )}
                    </View>
                </View>
            </View>
            
            {/* Wishlist Button */}
            {renderWishlistButton()}
            
            {/* Out of Stock Overlay */}
            {data.out_of_stock && (
                <View style={styles.outOfStockOverlay}>
                    <View style={styles.outOfStockBadge}>
                        <Text style={styles.outOfStockText}>
                            {props.strings?.common?.label_out_of_stock || 'OUT OF STOCK'}
                        </Text>
                    </View>
                </View>
            )}
        </TouchableOpacity>
    );
}

export default DealsProductView = React.memo(DealsProduct);

const styles = StyleSheet.create({
    productCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginHorizontal: 8,
        marginVertical: 8,
       
        width: wp('45%'),
        overflow: 'hidden',
    },
    
    // Image Section
    imageContainer: {
        height: hp('20%'),
        width: '100%',
        position: 'relative',
        backgroundColor: '#F8F9FA',
    },
    image: {
        width: '100%',
        height: '100%',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
    imageGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '30%',
    },
    
    // Discount Badge
    discountBadge: {
        position: 'absolute',
        top: 12,
        left: 12,
        borderRadius: 8,
        overflow: 'hidden',
    },
    discountGradient: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 40,
    },
    discountText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
        lineHeight: 16,
    },
    discountLabel: {
        color: '#FFFFFF',
        fontSize: 8,
        fontWeight: '600',
        lineHeight: 10,
    },
    
    // New Badge
    newBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        borderRadius: 6,
        overflow: 'hidden',
    },
    newGradient: {
        paddingHorizontal: 6,
        paddingVertical: 3,
        alignItems: 'center',
        justifyContent: 'center',
    },
    newText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    
    // Product Info Section
    productInfo: {
        padding: 12,
        flex: 1,
    },
    
    // Rating
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    starFilled: {
        color: '#FFD700',
        marginHorizontal: 1,
    },
    starEmpty: {
        color: '#E0E0E0',
        marginHorizontal: 1,
    },
    ratingText: {
        marginLeft: 4,
        fontSize: 11,
        color: '#666',
        fontWeight: '500',
    },
    
    // Product Name
    productName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2C3E50',
        lineHeight: 18,
        marginBottom: 8,
        minHeight: 36,
    },
    
    // Price Section
    priceContainer: {
        marginTop: 'auto',
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    specialPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#E74C3C',
        marginRight: 6,
    },
    originalPrice: {
        fontSize: 12,
        color: '#95A5A6',
        textDecorationLine: 'line-through',
        fontWeight: '500',
    },
    regularPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2C3E50',
    },
    
    // Wishlist Button
    wishlistButton: {
        position: 'absolute',
        top: hp('20%') - 20,
        right: 12,
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    wishlistActive: {
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#FF6B6B',
    },
    wishlistInactive: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    
    // Out of Stock Overlay
    outOfStockOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 16,
    },
    outOfStockBadge: {
        backgroundColor: '#95A5A6',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    outOfStockText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});