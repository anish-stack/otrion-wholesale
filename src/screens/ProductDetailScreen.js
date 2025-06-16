import React, { useEffect, useRef, useState } from "react";
import {
    View,
    TouchableOpacity,
    Text,
    StyleSheet,
    useWindowDimensions,
    Modal,
    Dimensions,
    Image,
    TextInput,
    ActivityIndicator,
    Animated
} from "react-native";
import { connect } from 'react-redux';
import {
    OtrixContainer, OtrixContent, OtrixDivider, OtirxBackButton, OtrixLoader, SimilarProduct, OtrixAlert, RatingComponent
} from '@component';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { GlobalStyles, Colors } from '@helpers';
import { _roundDimensions } from '@helpers/util';
import { bottomCart, checkround2, close } from '@common';
import Carousel from 'react-native-reanimated-carousel';
import { Badge, ScrollView, Button } from "native-base";
import Fonts from "../helpers/Fonts";
import { bindActionCreators } from "redux";
import { addToCart, addToWishList } from '@actions';
import Icon from 'react-native-vector-icons/AntDesign'
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import MaterialIconsIcon from 'react-native-vector-icons/MaterialIcons';
import ImageViewer from 'react-native-image-zoom-viewer';
import Stars from 'react-native-stars';
import RenderHtml from 'react-native-render-html';
import getApi from "@apis/getApi";
import { numberWithComma, logfunction, _addToWishlist } from "@helpers/FunctionHelper";
import { ASSETS_DIR, CURRENCY } from '@env';
import { Dropdown } from 'react-native-element-dropdown';
import moment from 'moment';

const windowHeight = Dimensions.get('window').height;

// Loading Skeleton Components
const SkeletonLoader = ({ width, height, style }) => {
    const animatedValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(animatedValue, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: false,
                }),
                Animated.timing(animatedValue, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: false,
                }),
            ])
        );
        animation.start();
        return () => animation.stop();
    }, []);

    const opacity = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    return (
        <Animated.View
            style={[
                {
                    width,
                    height,
                    backgroundColor: '#E1E9EE',
                    opacity,
                },
                style,
            ]}
        />
    );
};

const ImageSkeleton = () => (
    <View style={styles.imageSkeletonContainer}>
        <SkeletonLoader width="100%" height={windowHeight > 680 ? wp('100%') / 1.4 : wp('100%') / 1.6} />
    </View>
);

const ProductInfoSkeleton = () => (
    <View style={styles.skeletonContainer}>
        <SkeletonLoader width="80%" height={20} style={{ marginBottom: 10 }} />
        <SkeletonLoader width="60%" height={16} style={{ marginBottom: 15 }} />
        <SkeletonLoader width="40%" height={24} style={{ marginBottom: 10 }} />
        <SkeletonLoader width="70%" height={16} style={{ marginBottom: 20 }} />
        <SkeletonLoader width="100%" height={40} style={{ marginBottom: 15 }} />
        <SkeletonLoader width="100%" height={100} />
    </View>
);

function ProductDetailScreen(props) {
    const scrollRight = useRef();
    const [state, setState] = useState({ 
        loading: true, 
        productPrice: 0, 
        productCount: 1, 
        productDetail: null, 
        value: null, 
        isFocus: false, 
        productDescription: null, 
        productSpecial: null, 
        productAttributes: null, 
        productImages: null, 
        productRelated: null, 
        productOption: [], 
        fetchCart: false, 
        productReview: null, 
        optionColor: 0, 
        optionSelect: 0, 
        optionSize: 0, 
        showZoom: false, 
        zoomImages: [], 
        message: null, 
        type: 'error', 
        optionColorPrice: 0, 
        optionSelectPrice: 0, 
        optionSizePrice: 0,
        quantityInput: '1',
        loadingImages: true,
        loadingOptions: true,
        loadingDescription: true,
        loadingReviews: true
    });

    const { 
        loading, 
        productDetail, 
        productOption, 
        productPrice, 
        fetchCart, 
        productReview, 
        productImages, 
        productAttributes, 
        productDescription, 
        isFocus, 
        productRelated, 
        productSpecial, 
        optionColor, 
        optionSelect, 
        optionSize, 
        productCount, 
        zoomImages, 
        showZoom, 
        optionColorPrice, 
        optionSelectPrice, 
        optionSizePrice, 
        message, 
        type,
        quantityInput,
        loadingImages,
        loadingOptions,
        loadingDescription,
        loadingReviews
    } = state;

    const _CartData = () => {
        // setState({ ...state, fetchCart: false })
    }

    const showOutofStock = () => {
        setTimeout(() => {
            setState({ ...state, message: null });
        }, 2500);
        setState({ ...state, message: 'Product out of stock', type: 'error' });
    }

    const handleQuantityChange = (text) => {
        const numericValue = text.replace(/[^0-9]/g, '');
        if (numericValue === '' || parseInt(numericValue) < 1) {
            setState({ ...state, quantityInput: '1', productCount: 1 });
        } else {
            const count = parseInt(numericValue);
            setState({ ...state, quantityInput: numericValue, productCount: count });
        }
    };

    const incrementQuantity = () => {
        const newCount = productCount + 1;
        setState({ ...state, productCount: newCount, quantityInput: newCount.toString() });
    };

    const decrementQuantity = () => {
        const newCount = productCount > 1 ? productCount - 1 : 1;
        setState({ ...state, productCount: newCount, quantityInput: newCount.toString() });
    };

    const _addToCart = () => {
        if (props.USER_AUTH == true) {
            setState({ ...state, fetchCart: true })

            let optionObj = Object.create(null);
            optionObj.optionColorSelected = optionColor;
            optionObj.optionSelectSelected = optionSelect;

            if (Object.keys(productOption).length > 0) {
                Object.keys(productOption).map((item, index) => {
                    if (state[item]) {
                        optionObj['dynamic' + item] = state[item]
                    }
                })
            }

            let sendData = new FormData();
            sendData.append('quantity', productCount)
            sendData.append('product_id', productDetail.id)
            sendData.append('options', JSON.stringify(optionObj))
            
            getApi.postData(
                'user/addToCart',
                sendData,
                props.AUTH_TOKEN
            ).then((response => {
                if (response.status == 1) {
                    props.addToCart(response.cartCount);
                    setState({
                        ...state,
                        message: response.message,
                        fetchCart: false,
                        type: 'success'
                    });
                } else {
                    setState({
                        ...state,
                        message: response.message,
                        fetchCart: false,
                        type: 'error'
                    });
                }

                setTimeout(() => {
                    setState({
                        ...state,
                        message: null,
                    })
                }, 3000);
            }));
        } else {
            props.navigation.navigate('LoginScreen');
        }
    }

    const addToWish = async (id) => {
        let wishlistData = await _addToWishlist(id);
        props.addToWishList(wishlistData, id);
    }

    const colorChange = (data) => {
        let calculatePrice = parseFloat(productPrice);
        if (optionColorPrice != null) {
            calculatePrice = calculatePrice - parseFloat(optionColorPrice);
        }

        if (data.price != null) {
            calculatePrice = calculatePrice + parseFloat(data.price);
        }

        setState({
            ...state,
            optionColor: data.product_option_id,
            productPrice: calculatePrice,
            optionColorPrice: data.price
        });
    }

    const sizeChange = (data) => {
        let calculatePrice = productPrice;

        if (state[data.name + 'price'] > 0) {
            calculatePrice = calculatePrice - state[data.name + 'price'];
        }

        if (data && data.price != null) {
            calculatePrice = parseFloat(calculatePrice) + parseFloat(data.price);
        }

        setState({
            ...state,
            [data.name]: data.product_option_id,
            productPrice: calculatePrice,
            [data.name + 'price']: data.price
        });
    }

    const setOptionSelect = (selected, data) => {
        let calculatePrice = parseFloat(productPrice);
        calculatePrice = calculatePrice - optionSelectPrice;

        if (data.price != null) {
            calculatePrice = calculatePrice + parseFloat(data.price);
        }

        setState({
            ...state,
            optionSelect: selected,
            productPrice: calculatePrice,
            optionSelectPrice: data.price
        });
    }

    function findObjectsByValue(objectArray) {
        return objectArray.filter(obj => obj.type == 'Select');
    }

    let optionArr = [];
    const buildSelect = (item) => {
        let selectArr = findObjectsByValue(productOption[item])
        if (selectArr.length > 0) {
            let label = ''
            selectArr.map((item, i) => {
                label = item.price != null ? item.label + ' (+' + item.price + ')' : item.label;
                optionArr.push({ price: item.price, label: label, value: item.product_option_id });
            })

            return (
                <Dropdown
                    style={[styles.dropdown, isFocus && { borderColor: Colors().themeColor }]}
                    iconStyle={styles.iconStyle}
                    data={optionArr}
                    search
                    maxHeight={300}
                    labelField="label"
                    valueField="value"
                    placeholder={!isFocus ? 'Select item' : '...'}
                    searchPlaceholder="Search..."
                    value={optionSelect}
                    onChange={item => {
                        setOptionSelect(item.value, item);
                    }}
                    renderLeftIcon={() => (
                        <Icon
                            style={styles.icon}
                            color={isFocus ? Colors().themeColor : 'black'}
                            name="Safety"
                            size={20}
                        />
                    )}
                />
            );
        }
    }

    useEffect(() => {
        const { id } = props.route.params;
        
        // Simulate loading states
        setTimeout(() => setState(prev => ({ ...prev, loadingImages: false })), 1000);
        setTimeout(() => setState(prev => ({ ...prev, loadingOptions: false })), 1500);
        setTimeout(() => setState(prev => ({ ...prev, loadingDescription: false })), 2000);
        setTimeout(() => setState(prev => ({ ...prev, loadingReviews: false })), 2500);

        getApi.postData('incrementProductView/' + id, []).then((response => { }));
        
        getApi.getData('productDetail/' + id, []).then((response => {
            let productData = response.data;

            let images = [];
            let zoomImages = [];
            if (productData.data.image != null) {
                images.push(ASSETS_DIR + 'product/' + productData.data.image);
                zoomImages.push({
                    url: ASSETS_DIR + 'product/' + productData.data.image
                });
            } else {
                images.push(ASSETS_DIR + '/assets/img/default.png');
                zoomImages.push({
                    url: ASSETS_DIR + '/assets/img/default.png'
                });
            }

            if (productData.productImages && productData.productImages.length > 0) {
                for (let i = 0; i < productData.productImages.length; i++) {
                    images.push(ASSETS_DIR + 'product/' + productData.productImages[i].image);
                    zoomImages.push({
                        url: ASSETS_DIR + 'product/' + productData.productImages[i].image
                    });
                }
            }

            let special = 0;
            if (productData.productSpecial != null) {
                let startDate = moment(productData.productSpecial.start_date, "DD/MM/YYYY");
                let endDate = moment(productData.productSpecial.end_date, "DD/MM/YYYY");

                if (startDate <= moment(new Date(), "DD/MM/YYYY") && endDate >= moment(new Date(), "DD/MM/YYYY")) {
                    special = productData.productSpecial.price;
                }
            }

            setState({
                ...state,
                productDetail: productData.data,
                productDescription: productData.data.product_description,
                productPrice: special > 0 ? special : productData.data.price,
                basePrice: special > 0 ? special : productData.data.price,
                productSpecial: special,
                productRelated: productData.reletedProducts,
                productAttributes: productData.productAttributes,
                productImages: images,
                productOption: productData.productOptions,
                zoomImages: zoomImages,
                productReview: { 
                    totalReview: productData.totalReviews, 
                    avgRating: productData.avgReview, 
                    star1: productData.star1, 
                    star2: productData.star2, 
                    star3: productData.star3, 
                    star4: productData.star4, 
                    star5: productData.star5 
                },
                loading: false,
                loadingImages: false,
                loadingOptions: false,
                loadingDescription: false,
                loadingReviews: false
            });
        }));
    }, [_CartData()]);

    const { cartCount, USER_AUTH, wishlistData } = props;
    const { width } = useWindowDimensions();
    const tagsStyles = {
        p: {
            color: Colors().black,
            fontFamily: Fonts.Font_Reguler,
            fontSize: wp('3.5%'),
            lineHeight: hp('2.4%'),
        }
    };
    const { strings } = props;

    return (
        <OtrixContainer customStyles={{ backgroundColor: Colors().light_white }}>
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ImageSkeleton />
                    <View style={styles.productDetailView}>
                        <ProductInfoSkeleton />
                    </View>
                </View>
            ) : (
                <>
                    {/* Product Images */}
                    {productImages && productImages.length > 0 && (
                        <View style={styles.container}>
                            {loadingImages ? (
                                <ImageSkeleton />
                            ) : (
                                <Carousel
                                    loop
                                    width={width}
                                    pagingEnabled={true}
                                    snapEnabled={true}
                                    mode="parallax"
                                    modeConfig={{
                                        parallaxScrollingScale: 0.9,
                                        parallaxScrollingOffset: 50,
                                    }}
                                    height={windowHeight > 680 ? width / 1.4 : width / 1.6}
                                    autoPlay={true}
                                    data={productImages}
                                    scrollAnimationDuration={1500}
                                    renderItem={({ item, index }) => (
                                        <TouchableOpacity
                                            key={index}
                                            style={styles.imageContainer}
                                            onPress={() => setState({ ...state, showZoom: true })}
                                        >
                                            <Image 
                                                source={{ uri: item }} 
                                                resizeMode="contain" 
                                                style={styles.productImage}
                                            />
                                        </TouchableOpacity>
                                    )}
                                />
                            )}
                        </View>
                    )}

                    {/* Header */}
                    <View style={styles.headerContainer}>
                        <TouchableOpacity 
                            style={styles.backButton} 
                            onPress={() => props.navigation.goBack()}
                        >
                            <OtirxBackButton />
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.cartButton} 
                            onPress={() => props.navigation.navigate('CartScreen')}
                        >
                            <Image source={bottomCart} style={styles.menuImage} />
                            {cartCount > 0 && (
                                <Badge style={styles.cartBadge}>
                                    <Text style={styles.badgeText}>{cartCount}</Text>
                                </Badge>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Content */}
                    <OtrixContent customStyles={styles.productDetailView}>
                        <OtrixDivider size={'lg'} />
                        <ScrollView style={styles.childView} showsVerticalScrollIndicator={false}>
                            
                            {/* Product Name and Stock */}
                            <View style={styles.productHeader}>
                                <View style={styles.nameContainer}>
                                    {loadingDescription ? (
                                        <SkeletonLoader width="80%" height={24} />
                                    ) : (
                                        <Text style={styles.productName}>
                                            {productDescription?.name}
                                        </Text>
                                    )}
                                </View>
                                <View style={styles.stockContainer}>
                                    {loadingDescription ? (
                                        <SkeletonLoader width="60%" height={16} />
                                    ) : (
                                        <Text style={[styles.stockText, {
                                            color: productDetail?.quantity > 0 ? '#5ddb79' : '#fe151b'
                                        }]}>
                                            {productDetail?.quantity > 0 ? 'In Stock' : 'Out of stock'}
                                        </Text>
                                    )}
                                </View>
                            </View>

                            <OtrixDivider size={'md'} />

                            {/* Price and Rating */}
                            <View style={styles.priceRatingContainer}>
                                <View style={styles.priceContainer}>
                                    {loadingDescription ? (
                                        <SkeletonLoader width="40%" height={28} />
                                    ) : (
                                        productSpecial > 0 ? (
                                            <View style={styles.specialPriceContainer}>
                                                <Text style={styles.currentPrice}>
                                                    {CURRENCY}{numberWithComma(productPrice)}
                                                </Text>
                                                <Text style={styles.originalPrice}>
                                                    {CURRENCY}{numberWithComma(productDetail?.price)}
                                                </Text>
                                            </View>
                                        ) : (
                                            <Text style={styles.regularPrice}>
                                                {CURRENCY}{numberWithComma(productPrice)}
                                            </Text>
                                        )
                                    )}
                                </View>
                                
                                <View style={styles.ratingContainer}>
                                    {loadingReviews ? (
                                        <SkeletonLoader width="70%" height={20} />
                                    ) : (
                                        <>
                                            <Stars
                                                default={productReview?.avgRating > 0 ? parseFloat(productReview.avgRating) : 0}
                                                count={5}
                                                half={true}
                                                starSize={45}
                                                fullStar={<FontAwesomeIcon name={'star'} size={wp('3.5%')} style={styles.starFilled} />}
                                                emptyStar={<FontAwesomeIcon name={'star-o'} size={wp('3.5%')} style={styles.starEmpty} />}
                                                halfStar={<FontAwesomeIcon name={'star-half-empty'} size={wp('3.5%')} style={styles.starFilled} />}
                                                disabled={true}
                                            />
                                            <Text style={styles.reviewCount}>
                                                ({productReview?.totalReview || 0} Reviews)
                                            </Text>
                                        </>
                                    )}
                                </View>
                            </View>

                            <OtrixDivider size={'md'} />

                            {/* Options and Wishlist */}
                            <View style={styles.optionsContainer}>
                                <View style={styles.optionsContent}>
                                    {loadingOptions ? (
                                        <View>
                                            <SkeletonLoader width="100%" height={40} style={{ marginBottom: 15 }} />
                                            <SkeletonLoader width="100%" height={40} />
                                        </View>
                                    ) : (
                                        Object.keys(productOption).length > 0 && Object.keys(productOption).map((item, index) => (
                                            <View key={item.toString()} style={styles.optionGroup}>
                                                <Text style={styles.optionLabel}>{item}:</Text>
                                                <ScrollView 
                                                    ref={scrollRight} 
                                                    horizontal={true} 
                                                    showsHorizontalScrollIndicator={false} 
                                                    style={styles.optionScrollView}
                                                >
                                                    {productOption[item].map((childItem, index) => {
                                                        if (childItem.type === 'Color') {
                                                            return (
                                                                <TouchableOpacity
                                                                    key={childItem.product_option_id.toString()}
                                                                    style={[
                                                                        styles.colorOption,
                                                                        { backgroundColor: childItem.color_code },
                                                                        optionColor === childItem.product_option_id && styles.selectedColorOption
                                                                    ]}
                                                                    onPress={() => colorChange(childItem)}
                                                                >
                                                                    {optionColor === childItem.product_option_id && (
                                                                        <Image 
                                                                            source={childItem.color_code === 'white' || childItem.color_code === '#FFFFFF' || childItem.color_code === '#FFF' ? checkaround : checkround2} 
                                                                            style={styles.checkIcon} 
                                                                        />
                                                                    )}
                                                                </TouchableOpacity>
                                                            );
                                                        } else if (childItem.type === 'Radio' || childItem.type === 'Checkbox') {
                                                            return (
                                                                <TouchableOpacity
                                                                    key={childItem.product_option_id.toString()}
                                                                    style={[
                                                                        styles.sizeOption,
                                                                        state[childItem.name] === childItem.product_option_id && styles.selectedSizeOption
                                                                    ]}
                                                                    onPress={() => sizeChange(childItem)}
                                                                >
                                                                    <Text style={[
                                                                        styles.sizeText,
                                                                        state[childItem.name] === childItem.product_option_id && styles.selectedSizeText
                                                                    ]}>
                                                                        {childItem.label}
                                                                    </Text>
                                                                </TouchableOpacity>
                                                            );
                                                        }
                                                        return null;
                                                    })}
                                                    {buildSelect(item)}
                                                </ScrollView>
                                            </View>
                                        ))
                                    )}
                                </View>

                                {/* Wishlist Button */}
                                <View style={styles.wishlistContainer}>
                                    {wishlistData && wishlistData.length > 0 && wishlistData.includes(productDetail?.id) ? (
                                        <TouchableOpacity 
                                            style={styles.wishlistButtonActive} 
                                            onPress={() => USER_AUTH ? addToWish(productDetail.id) : props.navigation.navigate("LoginScreen")}
                                        >
                                            <FontAwesomeIcon name="heart" size={wp('5%')} color={Colors().white} />
                                        </TouchableOpacity>
                                    ) : (
                                        <TouchableOpacity 
                                            style={styles.wishlistButton} 
                                            onPress={() => USER_AUTH ? addToWish(productDetail.id) : props.navigation.navigate("LoginScreen")}
                                        >
                                            <FontAwesomeIcon name="heart-o" size={wp('5%')} color={Colors().secondry_text_color} />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>

                            {Object.keys(productOption).length === 0 && <OtrixDivider size={'lg'} />}

                            {/* Description */}
                            <View style={styles.sectionDivider} />
                            <OtrixDivider size={'sm'} />
                            <Text style={styles.sectionTitle}>{strings?.product_details?.description || 'Description'}</Text>
                            <OtrixDivider size={'sm'} />
                            
                            {loadingDescription ? (
                                <View>
                                    <SkeletonLoader width="100%" height={16} style={{ marginBottom: 8 }} />
                                    <SkeletonLoader width="90%" height={16} style={{ marginBottom: 8 }} />
                                    <SkeletonLoader width="95%" height={16} />
                                </View>
                            ) : (
                                <RenderHtml
                                    contentWidth={width}
                                    baseStyle={styles.descriptionText}
                                    source={{ html: productDescription?.description || '' }}
                                    tagsStyles={tagsStyles}
                                />
                            )}

                            {/* Specifications */}
                            {Object.keys(productAttributes || {}).length > 0 && (
                                <View>
                                    <OtrixDivider size={'md'} />
                                    <View style={styles.sectionDivider} />
                                    <OtrixDivider size={'sm'} />
                                    <Text style={styles.sectionTitle}>
                                        {strings?.product_details?.specification || 'Specifications'}
                                    </Text>
                                    <OtrixDivider size={'sm'} />

                                    {loadingDescription ? (
                                        <View>
                                            <SkeletonLoader width="100%" height={40} style={{ marginBottom: 10 }} />
                                            <SkeletonLoader width="100%" height={20} style={{ marginBottom: 5 }} />
                                            <SkeletonLoader width="100%" height={20} />
                                        </View>
                                    ) : (
                                        Object.keys(productAttributes).map((item, index) => (
                                            <View key={index}>
                                                <View style={styles.attributeHeader}>
                                                    <Text style={styles.attributeHeaderText}>{item}</Text>
                                                </View>
                                                {productAttributes[item].map((attribute, attIndex) => (
                                                    <View key={attIndex} style={styles.attributeRow}>
                                                        <Text style={styles.attributeName}>{attribute.name}</Text>
                                                        <Text style={styles.attributeValue}>{attribute.text}</Text>
                                                    </View>
                                                ))}
                                            </View>
                                        ))
                                    )}
                                </View>
                            )}

                            <OtrixDivider size={'md'} />
                            <View style={styles.sectionDivider} />

                            {/* Reviews */}
                            {loadingReviews ? (
                                <View style={{ marginVertical: 20 }}>
                                    <SkeletonLoader width="60%" height={20} style={{ marginBottom: 15 }} />
                                    <SkeletonLoader width="100%" height={60} />
                                </View>
                            ) : (
                                <RatingComponent strings={strings} reviewData={productReview} />
                            )}

                            {/* Similar Products */}
                            {productRelated?.length > 0 && (
                                <SimilarProduct 
                                    userAuth={USER_AUTH} 
                                    wishlistArr={wishlistData} 
                                    addToWishlist={addToWish} 
                                    strings={strings} 
                                    navigation={props.navigation} 
                                    reletedData={productRelated} 
                                />
                            )}
                        </ScrollView>
                    </OtrixContent>

                    {/* Image Zoom Modal */}
                    <Modal visible={showZoom} transparent={true}>
                        <ImageViewer 
                            imageUrls={zoomImages}
                            saveToLocalByLongPress={false}
                            backgroundColor={Colors().light_white}
                            renderIndicator={(currentIndex, allSize) => (
                                <View style={styles.zoomHeader}>
                                    <TouchableOpacity 
                                        onPress={() => setState({ ...state, showZoom: false })} 
                                        style={styles.closeButton}
                                    >
                                        <Image source={close} style={styles.closeIcon} />
                                    </TouchableOpacity>
                                    <Text style={styles.imageCounter}>{currentIndex} / {allSize}</Text>
                                </View>
                            )}
                        />
                    </Modal>

                    {/* Bottom Action Bar */}
                    <View style={styles.bottomActionBar}>
                        <Button
                            isLoading={fetchCart}
                            size="md"
                            variant="solid"
                            bg={Colors().themeColor}
                            style={styles.addToCartButton}
                            onPress={() => !productDetail?.out_of_stock ? _addToCart() : showOutofStock()}
                        >
                            <Text style={styles.addToCartText}>
                                {strings?.product_details?.add_to_cart || 'Add to Cart'}
                            </Text>
                        </Button>
                        
                        <View style={styles.quantityContainer}>
                            <TextInput
                                style={styles.quantityInput}
                                value={quantityInput}
                                onChangeText={handleQuantityChange}
                                keyboardType="numeric"
                                textAlign="center"
                                maxLength={3}
                            />
                            <View style={styles.quantityControls}>
                                <TouchableOpacity 
                                    style={styles.quantityButton} 
                                    onPress={incrementQuantity}
                                >
                                    <MaterialIconsIcon name="keyboard-arrow-up" style={styles.quantityIcon} />
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={styles.quantityButton} 
                                    onPress={decrementQuantity}
                                >
                                    <MaterialIconsIcon name="keyboard-arrow-down" style={styles.quantityIcon} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </>
            )}

            {message != null && <OtrixAlert type={type} message={message} />}
        </OtrixContainer>
    );
}

function mapStateToProps(state) {
    return {
        cartCount: state.cart.cartCount,
        wishlistData: state.wishlist.wishlistData,
        USER_AUTH: state.auth.USER_AUTH,
        strings: state.mainScreenInit.strings,
        AUTH_TOKEN: state.auth.AUTH_TOKEN,
    }
}

const mapDispatchToProps = dispatch => (
    bindActionCreators({
        addToCart,
        addToWishList
    }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(ProductDetailScreen);

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        backgroundColor: Colors().light_white,
    },
    imageSkeletonContainer: {
        height: hp('35%'),
        backgroundColor: Colors().light_white,
    },
    skeletonContainer: {
        backgroundColor: Colors().white,
        marginHorizontal: 0,
        borderTopRightRadius: wp('13%'),
        borderTopLeftRadius: wp('13%'),
        padding: wp('5%'),
        flex: 1,
    },
    productDetailView: {
        backgroundColor: Colors().white,
        marginHorizontal: 0,
        borderTopRightRadius: wp('13%'),
        borderTopLeftRadius: wp('13%'),
        flex: 1,
    },
    container: {
        height: hp('35%'),
        position: 'relative',
        backgroundColor: Colors().light_white,
        zIndex: 99,
    },
    imageContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    productImage: {
        height: windowHeight > 680 ? wp('100%') / 1.4 : wp('100%') / 1.6,
        width: wp('100%'),
    },
    headerContainer: {
        flexDirection: 'row',
        position: 'absolute',
        marginTop: hp('2%'),
        zIndex: 99999999,
        width: '100%',
        justifyContent: 'space-between',
        paddingHorizontal: wp('5%'),
    },
    backButton: {
        zIndex: 999999999,
        alignItems: 'flex-start',
    },
    cartButton: {
        zIndex: 999999999,
        backgroundColor: 'transparent',
        alignItems: 'center',
        position: 'relative',
    },
    menuImage: {
        width: wp('6%'),
        height: hp('6%'),
        resizeMode: 'contain',
        tintColor: Colors().themeColor,
    },
    cartBadge: {
        position: 'absolute',
        right: -5,
        top: -5,
        backgroundColor: Colors().white,
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        color: Colors().themeColor,
        fontSize: wp('2.5%'),
        fontWeight: 'bold',
    },
    childView: {
        marginHorizontal: wp('5%'),
        paddingBottom: hp('1.8%'),
    },
    productHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    nameContainer: {
        flex: 0.75,
    },
    productName: {
        fontSize: wp('4.5%'),
        fontFamily: Fonts.Font_Bold,
        color: Colors().text_color,
        lineHeight: hp('3%'),
    },
    stockContainer: {
        flex: 0.25,
        alignItems: 'flex-end',
    },
    stockText: {
        fontSize: wp('3%'),
        fontFamily: Fonts.Font_Semibold,
    },
    priceRatingContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    priceContainer: {
        flex: 0.6,
    },
    specialPriceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    currentPrice: {
        fontSize: wp('5.5%'),
        fontFamily: Fonts.Font_Bold,
        color: Colors().themeColor,
        marginRight: wp('2%'),
    },
    originalPrice: {
        fontSize: wp('3.5%'),
        fontFamily: Fonts.Font_Regular,
        color: Colors().secondry_text_color,
        textDecorationLine: 'line-through',
    },
    regularPrice: {
        fontSize: wp('5.5%'),
        fontFamily: Fonts.Font_Bold,
        color: Colors().themeColor,
    },
    ratingContainer: {
        flex: 0.4,
        alignItems: 'flex-end',
    },
    starFilled: {
        color: '#ffd12d',
        backgroundColor: 'transparent',
        marginHorizontal: 1,
    },
    starEmpty: {
        color: 'gray',
        backgroundColor: 'transparent',
        marginHorizontal: 1,
    },
    reviewCount: {
        fontFamily: Fonts.Font_Regular,
        fontSize: wp('2.5%'),
        marginTop: hp('0.3%'),
        textAlign: 'center',
        color: Colors().secondry_text_color,
    },
    optionsContainer: {
        flexDirection: 'row',
        flex: 1,
    },
    optionsContent: {
        flex: 0.85,
    },
    optionGroup: {
        marginBottom: hp('2%'),
    },
    optionLabel: {
        fontSize: wp('3.5%'),
        fontFamily: Fonts.Font_Regular,
        color: Colors().text_color,
        marginBottom: hp('1%'),
    },
    optionScrollView: {
        flexDirection: 'row',
    },
    colorOption: {
        height: hp('4%'),
        width: wp('15%'),
        marginHorizontal: wp('1%'),
        borderRadius: 8,
        borderWidth: 2,
        borderColor: Colors().light_gray,
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedColorOption: {
        borderColor: Colors().themeColor,
        borderWidth: 3,
    },
    checkIcon: {
        height: hp('2%'),
        width: wp('4%'),
        borderRadius: 50,
    },
    sizeOption: {
        paddingHorizontal: wp('3%'),
        paddingVertical: hp('1%'),
        marginHorizontal: wp('1%'),
        backgroundColor: Colors().light_white,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors().light_gray,
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedSizeOption: {
        borderColor: Colors().themeColor,
        backgroundColor: Colors().themeColor + '20',
    },
    sizeText: {
        fontSize: wp('3.5%'),
        fontFamily: Fonts.Font_Regular,
        color: Colors().secondry_text_color,
    },
    selectedSizeText: {
        color: Colors().themeColor,
        fontWeight: 'bold',
    },
    wishlistContainer: {
        flex: 0.15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    wishlistButton: {
        width: wp('12%'),
        height: wp('12%'),
        borderRadius: wp('6%'),
        backgroundColor: Colors().light_white,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    wishlistButtonActive: {
        width: wp('12%'),
        height: wp('12%'),
        borderRadius: wp('6%'),
        backgroundColor: Colors().themeColor,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionDivider: {
        height: 1,
        backgroundColor: Colors().light_gray,
        marginVertical: hp('1%'),
    },
    sectionTitle: {
        fontSize: wp('4%'),
        fontFamily: Fonts.Font_Bold,
        color: Colors().text_color,
    },
    descriptionText: {
        color: Colors().secondry_text_color,
        fontFamily: Fonts.Font_Regular,
        fontSize: wp('3.5%'),
        lineHeight: hp('2.4%'),
    },
    attributeHeader: {
        backgroundColor: Colors().light_gray,
        paddingVertical: hp('1%'),
        paddingHorizontal: wp('3%'),
        marginVertical: hp('0.5%'),
    },
    attributeHeaderText: {
        fontFamily: Fonts.Font_Semibold,
        fontSize: wp('3.5%'),
        textTransform: 'uppercase',
        color: Colors().text_color,
    },
    attributeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: hp('1%'),
        paddingHorizontal: wp('3%'),
        borderBottomWidth: 0.5,
        borderBottomColor: Colors().light_gray,
    },
    attributeName: {
        fontFamily: Fonts.Font_Regular,
        fontSize: wp('3.5%'),
        color: Colors().text_color,
        flex: 0.4,
    },
    attributeValue: {
        fontFamily: Fonts.Font_Regular,
        fontSize: wp('3.5%'),
        color: Colors().secondry_text_color,
        flex: 0.6,
        textAlign: 'right',
    },
    zoomHeader: {
        position: 'absolute',
        top: hp('5%'),
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: wp('5%'),
        zIndex: 1000,
    },
    closeButton: {
        padding: 8,
    },
    closeIcon: {
        width: wp('6%'),
        height: wp('6%'),
        tintColor: Colors().black,
    },
    imageCounter: {
        fontSize: wp('4%'),
        color: Colors().black,
        fontFamily: Fonts.Font_Regular,
    },
    bottomActionBar: {
        flexDirection: 'row',
        backgroundColor: Colors().white,
        height: hp('8%'),
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: 'grey',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 8,
        borderTopColor: Colors().light_gray,
        borderTopWidth: 1,
        paddingHorizontal: wp('4%'),
    },
    addToCartButton: {
        flex: 0.7,
        marginRight: wp('3%'),
        borderRadius: 12,
        height: hp('6%'),
    },
    addToCartText: {
        color: Colors().white,
        fontSize: wp('4%'),
        fontFamily: Fonts.Font_Semibold,
    },
    quantityContainer: {
        flex: 0.3,
        flexDirection: 'row',
        backgroundColor: Colors().light_white,
        borderRadius: 12,
        height: hp('6%'),
        shadowColor: 'grey',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        overflow: 'hidden',
    },
    quantityInput: {
        flex: 0.6,
        fontSize: wp('4%'),
        fontFamily: Fonts.Font_Semibold,
        color: Colors().text_color,
        backgroundColor: Colors().white,
        borderTopLeftRadius: 12,
        borderBottomLeftRadius: 12,
        paddingHorizontal: wp('2%'),
    },
    quantityControls: {
        flex: 0.4,
        flexDirection: 'column',
        backgroundColor: Colors().light_gray,
    },
    quantityButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors().light_white,
    },
    quantityIcon: {
        fontSize: wp('5%'),
        color: Colors().themeColor,
    },
    dropdown: {
        height: 40,
        width: wp('40%'),
        borderColor: Colors().light_gray,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 8,
        marginHorizontal: wp('1%'),
        backgroundColor: Colors().white,
    },
    icon: {
        marginRight: 5,
    },
    iconStyle: {
        width: 20,
        height: 20,
    },
});
