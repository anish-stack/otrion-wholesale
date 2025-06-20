import React, { useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { GlobalStyles, Colors, } from '@helpers'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import OtrixDivider from '../OtrixComponent/OtrixDivider';
import ProductView from '../ProductCompnent/ProductView';
import { logfunction } from "@helpers/FunctionHelper";

function Product(props) {
    const navigateToDetailPage = (data) => {
        props.navigation.navigate('ProductDetailScreen', { id: data.id })
    }

    const navigateToLoginPage = (data) => {
        props.navigation.navigate('LoginScreen', {})
    }

    const addToWishlist = (id) => {
        props.addToWishlist(id);
    }

    const { wishlistArr } = props;

    const renderCard = item => {
        item.new = true;
        return (
            <View style={styles.productBox} key={item.id.toString()}>
                <ProductView data={item} key={item.id} strings={props.strings} navToDetail={navigateToDetailPage} navToLogin={navigateToLoginPage} userAuth={props.userAuth} addToWishlist={addToWishlist} wishlistArray={wishlistArr} />
            </View>
        );
    };

    return (
        <>
            <View style={styles.catHeading}>
                <Text style={GlobalStyles.boxHeading}>{props.strings.homepage.label_new_product}</Text>
                <TouchableOpacity style={{ flex: 0.50 }} onPress={() => props.navigation.navigate('ProductListScreen', { title: props.strings.homepage.label_new_product, type: 'newProduct' })}>
                    <Text style={GlobalStyles.viewAll}>{props.strings.homepage.viewall}</Text>
                </TouchableOpacity>
            </View>
            <OtrixDivider size={'sm'} />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {props.data.length > 0 && props.data.map((item, index) => {
                    return renderCard(item);
                })}
            </View>
        </>
    )
}

export default NewProduct = React.memo(Product);


const styles = StyleSheet.create({
    catHeading: {
        justifyContent: 'space-evenly',
        alignItems: 'center',
        flexDirection: 'row',
        marginTop: hp('1%')
    },
    catBox: {
        height: hp('12.5%'),
        width: wp('15%'),
        marginHorizontal: wp('1%'),
        borderRadius: 5,
    },
    productBox: {
        flexDirection: 'column',
        flexDirection: 'row',
        justifyContent: 'center',
        backgroundColor: Colors().white,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,
        elevation: 4,
        width: '46%',
        height: 'auto',
        marginBottom: wp('3%'),
        borderRadius: wp('2%'),
        marginHorizontal: wp('1.5%'),
        paddingBottom: hp('1%'),
    },
});