import React from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { GlobalStyles, Colors } from '@helpers'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Fonts from '@helpers/Fonts';
import Stars from 'react-native-stars';
import Icon from 'react-native-vector-icons/FontAwesome';
import { ASSETS_DIR, CURRENCY } from '@env';
import { numberWithComma, calculateOffPercentage } from '@helpers/FunctionHelper';
import moment from 'moment';
import FastImage from 'react-native-fast-image'

function ProductView(props) {
    const data = props.data;
    const isLoading = props.isLoading || false;
    
    let discountPercentage = null;
    let specialPrice = 0;
    let hasDiscount = false;

    // Calculate special pricing and discount
    if (data?.special != null) {
        let startDate = moment(data.special.start_date, "DD/MM/YYYY");
        let endDate = moment(data.special.end_date, "DD/MM/YYYY");
        if (startDate <= moment(new Date(), "DD/MM/YYYY") && endDate >= moment(new Date(), "DD/MM/YYYY")) {
            specialPrice = data.special.price;
            discountPercentage = calculateOffPercentage(data.price, data.special.price);
            hasDiscount = true;
        }
    }

    // Calculate MRP discount if no special price and MRP exists
    if (!hasDiscount && data?.MRP && parseFloat(data.MRP) > parseFloat(data.price)) {
        discountPercentage = calculateOffPercentage(data.MRP, data.price);
        hasDiscount = true;
    }

    const currentPrice = specialPrice || data?.price;
    const mrpPrice = data?.MRP;
    const wishlistArr = props.wishlistArray ? props.wishlistArray : [];
    const isInWishlist = wishlistArr.includes(data?.id);

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <View style={styles.loadingImageView}>
                    <ActivityIndicator size="small" color={Colors().primary} />
                </View>
                <View style={styles.loadingInfoView}>
                    <View style={styles.loadingLine} />
                    <View style={[styles.loadingLine, { width: '60%' }]} />
                    <View style={[styles.loadingLine, { width: '40%' }]} />
                </View>
            </View>
        );
    }

    return (
        <TouchableOpacity 
            style={styles.productCard} 
            onPress={() => props.navToDetail(data)}
            activeOpacity={0.9}
        >
            {/* Image Container */}
            <View style={styles.imageContainer}>
                <FastImage
                    style={styles.productImage}
                    source={{
                        uri: data?.image ? ASSETS_DIR + 'product/' + data.image : ASSETS_DIR + '/assets/img/default.png',
                        priority: FastImage.priority.high,
                    }}
                    resizeMode={FastImage.resizeMode.contain}
                />
                
                {/* Discount Badge - Only show if there's a discount */}
                {hasDiscount && discountPercentage > 0 && (
                    <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>{Math.round(discountPercentage)}% OFF</Text>
                    </View>
                )}

                {/* Wishlist Heart */}
                <TouchableOpacity 
                    style={styles.heartButton} 
                    onPress={() => props.userAuth ? props.addToWishlist(data.id) : props.navToLogin()}
                    activeOpacity={0.7}
                >
                    <Icon 
                        name={isInWishlist ? "heart" : "heart-o"} 
                        size={14} 
                        color={isInWishlist ? "#ff4757" : "#999"} 
                    />
                </TouchableOpacity>

                {/* New Badge */}
                {data?.quantity > 0 && data?.new === true && (
                    <View style={styles.newBadge}>
                        <Text style={styles.newText}>NEW</Text>
                    </View>
                )}
            </View>

            {/* Content Container */}
            <View style={styles.contentContainer}>
                {/* Rating */}
                {data?.review_avg && parseFloat(data.review_avg) > 0 && (
                    <View style={styles.ratingContainer}>
                        <Stars
                            default={parseFloat(data.review_avg)}
                            count={5}
                            half={true}
                            starSize={35}
                            spacing={1}
                            fullStar={<Icon name={'star'} size={10} color="#ffd700" />}
                            emptyStar={<Icon name={'star-o'} size={10} color="#ddd" />}
                            halfStar={<Icon name={'star-half-empty'} size={10} color="#ffd700" />}
                            disabled={true}
                        />
                        <Text style={styles.ratingText}>({parseFloat(data.review_avg).toFixed(1)})</Text>
                    </View>
                )}

                {/* Product Name */}
                <Text style={styles.productName} numberOfLines={2}>
                    {data?.product_description?.name || 'Product Name'}
                </Text>

                {/* Price Section */}
                <View style={styles.priceSection}>
                    {/* Current Price */}
                    <Text style={styles.currentPrice}>
                        {CURRENCY}{numberWithComma(currentPrice)}
                    </Text>
                    
                    {/* MRP - Always show if available */}
                    {mrpPrice && parseFloat(mrpPrice) !== parseFloat(currentPrice) && (
                        <Text style={styles.mrpPrice}>
                            MRP {CURRENCY}{numberWithComma(mrpPrice)}
                        </Text>
                    )}
                    
                    {/* Save Amount */}
                    {hasDiscount && mrpPrice && (
                        <Text style={styles.saveText}>
                            You save {CURRENCY}{numberWithComma((parseFloat(mrpPrice) - parseFloat(currentPrice)).toFixed(2))}
                        </Text>
                    )}
                </View>

                {/* Stock Status */}
                {data?.quantity === 0 && (
                    <View style={styles.outOfStockContainer}>
                        <Text style={styles.outOfStockText}>Out of Stock</Text>
                    </View>
                )}
            </View>

            {/* Out of Stock Overlay */}
            {data?.quantity === 0 && (
                <View style={styles.stockOverlay}>
                    <Text style={styles.overlayText}>OUT OF STOCK</Text>
                </View>
            )}
        </TouchableOpacity>
    );
}

export default ProductView;

const styles = StyleSheet.create({
    productCard: {
        backgroundColor: '#fff',
        borderRadius: wp('2.5%'),
        margin: wp('1%'),
      
        overflow: 'hidden',
        width: wp('46%'), // Fixed width to prevent overlap
        minHeight: hp('32%'), // Minimum height for consistency
    },
    
    imageContainer: {
        backgroundColor: '#f8f9fa',
        height: hp('16%'),
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: hp('1%'),
    },
    
    productImage: {
        width: '85%',
        height: '85%',
    },
    
    discountBadge: {
        position: 'absolute',
        top: hp('0.8%'),
        left: wp('2%'),
        backgroundColor: '#ff4757',
        paddingHorizontal: wp('1.5%'),
        paddingVertical: hp('0.2%'),
        borderRadius: wp('0.8%'),
        zIndex: 2,
    },
    
    discountText: {
        color: '#fff',
        fontSize: wp('2.2%'),
        fontWeight: 'bold',
    },
    
    heartButton: {
        position: 'absolute',
        top: hp('0.8%'),
        right: wp('2%'),
        backgroundColor: '#fff',
        width: wp('6.5%'),
        height: wp('6.5%'),
        borderRadius: wp('3.25%'),
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 2,
        zIndex: 2,
    },
    
    newBadge: {
        position: 'absolute',
        bottom: hp('0.8%'),
        right: wp('2%'),
        backgroundColor: '#00b894',
        paddingHorizontal: wp('1.5%'),
        paddingVertical: hp('0.2%'),
        borderRadius: wp('0.8%'),
        zIndex: 2,
    },
    
    newText: {
        color: '#fff',
        fontSize: wp('2%'),
        fontWeight: 'bold',
    },
    
    contentContainer: {
        padding: wp('2.5%'),
        flex: 1,
        justifyContent: 'space-between',
    },
    
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: hp('0.5%'),
    },
    
    ratingText: {
        marginLeft: wp('1%'),
        fontSize: wp('2.2%'),
        color: '#666',
    },
    
    productName: {
        fontSize: wp('3%'),
        fontWeight: '600',
        color: '#333',
        lineHeight: wp('4%'),
        marginBottom: hp('0.8%'),
        minHeight: hp('4%'), // Ensure consistent height
    },
    
    priceSection: {
        marginTop: 'auto',
    },
    
    currentPrice: {
        fontSize: wp('3.8%'),
        fontWeight: 'bold',
        color: '#2d3436',
        marginBottom: hp('0.2%'),
    },
    
    mrpPrice: {
        fontSize: wp('2.5%'),
        color: '#999',
        textDecorationLine: 'line-through',
        marginBottom: hp('0.2%'),
    },
    
    saveText: {
        fontSize: wp('2.3%'),
        color: '#27ae60',
        fontWeight: '500',
    },
    
    outOfStockContainer: {
        backgroundColor: '#ff6b6b',
        paddingHorizontal: wp('1.5%'),
        paddingVertical: hp('0.2%'),
        borderRadius: wp('0.8%'),
        alignSelf: 'flex-start',
        marginTop: hp('0.5%'),
    },
    
    outOfStockText: {
        color: '#fff',
        fontSize: wp('2%'),
        fontWeight: 'bold',
    },
    
    stockOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 3,
    },
    
    overlayText: {
        color: '#fff',
        fontSize: wp('3.5%'),
        fontWeight: 'bold',
    },
    
    // Loading Styles
    loadingContainer: {
        backgroundColor: '#f5f5f5',
        borderRadius: wp('2.5%'),
        margin: wp('1%'),
        width: wp('46%'),
        minHeight: hp('32%'),
        overflow: 'hidden',
    },
    
    loadingImageView: {
        backgroundColor: '#e0e0e0',
        height: hp('16%'),
        justifyContent: 'center',
        alignItems: 'center',
    },
    
    loadingInfoView: {
        padding: wp('2.5%'),
        flex: 1,
    },
    
    loadingLine: {
        height: hp('1.2%'),
        backgroundColor: '#d0d0d0',
        borderRadius: wp('0.3%'),
        marginBottom: hp('0.8%'),
        width: '100%',
    },
});