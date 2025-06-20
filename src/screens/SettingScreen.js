import React from "react";
import {
    View,
    TouchableOpacity,
    Text,
    I18nManager,
    Platform,
    StyleSheet,
    Image
} from "react-native";
import { connect } from 'react-redux';
import {
    OtrixContainer, OtrixHeader, OtrixContent, OtrixDivider
} from '@component';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { GlobalStyles, Colors } from '@helpers';
import { _roundDimensions } from '@helpers/util';
import Fonts from "@helpers/Fonts";
import FIcon from 'react-native-vector-icons/FontAwesome';
import MatIcon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { logo } from '@common';
import Rate, { AndroidMarket } from 'react-native-rate';
import { shipping, refund } from '@common';
import Share from 'react-native-share';
import { Switch } from "native-base";
import AsyncStorage from "@react-native-community/async-storage";
import RNRestart from 'react-native-restart';
import { useEffect } from "react";
const shareOptions = {
    title: 'Otrixapp',
    url: Platform.OS == 'android' ? 'https://play.google.com/store/apps/details?id=com.orionwholesale' : 'iOS url',
};

function SettingScreen(props) {



    const [state, setState] = React.useState({ showRate: false, theme: null });


    useEffect(async () => {
        setState({ ...state, theme: await AsyncStorage.getItem('THEME') })
    }, [])
    const switchValue = (state.theme === 'dark' ? true : false);
    const toggleSwitch = async () => {
        if (switchValue === true) {
            await AsyncStorage.setItem('THEME', 'light')
            RNRestart.Restart();
        } else {
            await AsyncStorage.setItem('THEME', 'dark')
            RNRestart.Restart();
        }
    }

    const shareApp = () => {
        Share.open(shareOptions)
            .then((res) => {
                console.log(res);
            })
            .catch((err) => {
                err && console.log(err);
            });
    }
    const { strings } = props;
    return (
        <OtrixContainer customStyles={{ backgroundColor: Colors().light_white }}>

            {/* Header */}
            <OtrixHeader customStyles={{ backgroundColor: Colors().light_white }}>
                {/* <TouchableOpacity style={GlobalStyles.headerLeft} onPress={() => props.navigation.goBack()}>
                    <OtirxBackButton />
                </TouchableOpacity> */}
                <View style={[GlobalStyles.headerCenter, { flex: 1 }]}>
                    <Text style={GlobalStyles.headingTxt}> {strings.setting.title} </Text>
                </View>
            </OtrixHeader>

            {/* Content Start from here */}
            <OtrixContent >
                {/* <TouchableOpacity style={styles.listView} >
                    <View style={[styles.leftSide, { left: wp('1%') }]}>
                        <FIcon name="language" style={styles.icon} />
                    </View>
                    <View style={styles.center}>
                        <Text style={styles.listTitle}>{strings.setting.dark_mode}</Text>
                    </View>
                    <View style={styles.rightSide}>
                        <Switch
                            value={switchValue}
                            onValueChange={toggleSwitch}
                        />
                    </View>
                </TouchableOpacity> */}
                <TouchableOpacity style={styles.listView} onPress={() => props.navigation.navigate('LanguageScreen')}>
                    <View style={[styles.leftSide, { left: wp('1%') }]}>
                        <FIcon name="language" style={styles.icon} />
                    </View>
                    <View style={styles.center}>
                        <Text style={styles.listTitle}>{strings.setting.label_language}</Text>
                    </View>
                    <View style={styles.rightSide}>
                        <MatIcon name="arrow-forward-ios" style={[styles.rightIcon, { transform: [{ rotateY: I18nManager.isRTL == true ? '180deg' : '0deg' }] }]} />
                    </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.listView} onPress={() => props.navigation.navigate('NotificationScreen')}>
                    <View style={styles.leftSide}>
                        <Ionicons name="notifications-outline" style={[styles.icon, { fontSize: wp('5.4%') }]} />
                    </View>
                    <View style={styles.center}>
                        <Text style={styles.listTitle}>{strings.setting.label_notification}</Text>
                    </View>
                    <View style={styles.rightSide}>
                        <MatIcon name="arrow-forward-ios" style={[styles.rightIcon, { transform: [{ rotateY: I18nManager.isRTL == true ? '180deg' : '0deg' }] }]} />
                    </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.listView} onPress={() => props.navigation.navigate('TermsandconditionScreen')}>
                    <View style={styles.leftSide}>
                        <FIcon name="file-text-o" style={styles.icon} />
                    </View>
                    <View style={styles.center}>
                        <Text style={styles.listTitle}>{strings.setting.terms_conditions}</Text>
                    </View>
                    <View style={styles.rightSide}>
                        <MatIcon name="arrow-forward-ios" style={[styles.rightIcon, { transform: [{ rotateY: I18nManager.isRTL == true ? '180deg' : '0deg' }] }]} />
                    </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.listView} onPress={() => props.navigation.navigate('PrivacyPolicyScreen')}>
                    <View style={styles.leftSide}>
                        <MatIcon name="privacy-tip" style={styles.icon} />
                    </View>
                    <View style={styles.center}>
                        <Text style={styles.listTitle}>{strings.setting.privacy_policy}</Text>
                    </View>
                    <View style={styles.rightSide}>
                        <MatIcon name="arrow-forward-ios" style={[styles.rightIcon, { transform: [{ rotateY: I18nManager.isRTL == true ? '180deg' : '0deg' }] }]} />
                    </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.listView} onPress={() => props.navigation.navigate('RefundScreen')}>
                    <View style={styles.leftSide}>
                        <Image source={refund} style={[styles.iconImage, { height: hp('6%'), width: wp('6%') }]} />

                    </View>
                    <View style={styles.center}>
                        <Text style={styles.listTitle}>{strings.setting.return_refund}</Text>
                    </View>
                    <View style={styles.rightSide}>
                        <MatIcon name="arrow-forward-ios" style={[styles.rightIcon, { transform: [{ rotateY: I18nManager.isRTL == true ? '180deg' : '0deg' }] }]} />
                    </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.listView} onPress={() => props.navigation.navigate('ShippingDeliveryScreen')}>
                    <View style={styles.leftSide}>
                        <Image source={shipping} style={styles.iconImage} />
                    </View>
                    <View style={styles.center}>
                        <Text style={styles.listTitle}>{strings.setting.shipping_delivery}</Text>
                    </View>
                    <View style={styles.rightSide}>
                        <MatIcon name="arrow-forward-ios" style={[styles.rightIcon, { transform: [{ rotateY: I18nManager.isRTL == true ? '180deg' : '0deg' }] }]} />
                    </View>
                </TouchableOpacity>


                <TouchableOpacity style={styles.listView}
                    onPress={() => {
                        const options = {
                            AppleAppID: "",
                            GooglePackageName: "com.orionwholesale",
                            AmazonPackageName: "",
                            OtherAndroidURL: "",
                            preferredAndroidMarket: AndroidMarket.Google,
                            preferInApp: false,
                            inAppDelay: 5.0,
                            openAppStoreIfInAppFails: false,
                            fallbackPlatformURL: "ms-windows-store:review?PFN:com.orionwholesale",
                        }
                        Rate.rate(options, (success, errorMessage) => {
                            if (success) {
                                // this technically only tells us if the user successfully went to the Review Page. Whether they actually did anything, we do not know.
                                setState({ ...state, showRate: true })
                            }
                            if (errorMessage) {
                                // errorMessage comes from the native code. Useful for debugging, but probably not for users to view
                                console.error(`Example page Rate.rate() error: ${errorMessage}`)
                            }
                        })
                    }}
                >
                    <View style={styles.leftSide}>
                        <FIcon name="star-o" style={styles.icon} />
                    </View>
                    <View style={styles.center}>
                        <Text style={styles.listTitle}>{strings.setting.rate_app}</Text>
                    </View>
                    <View style={styles.rightSide}>
                        <MatIcon name="arrow-forward-ios" style={[styles.rightIcon, { transform: [{ rotateY: I18nManager.isRTL == true ? '180deg' : '0deg' }] }]} />
                    </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.listView} onPress={() => shareApp()}>
                    <View style={styles.leftSide}>
                        <MatIcon name="share" style={styles.icon} />
                    </View>
                    <View style={styles.center}>
                        <Text style={styles.listTitle}>Share this app</Text>
                    </View>
                    <View style={styles.rightSide}>
                        <MatIcon name="arrow-forward-ios" style={[styles.rightIcon, { transform: [{ rotateY: I18nManager.isRTL == true ? '180deg' : '0deg' }] }]} />
                    </View>
                </TouchableOpacity>

            </OtrixContent>

            {/* <Text style={styles.bottomTxt}>Otrixapp</Text> */}
            <Image source={logo} style={styles.bottomlogo} />
            <Text style={styles.bottomVersion}>Version: 1.0</Text>
            <OtrixDivider size={'lg'} />
        </OtrixContainer >
    )
}

function mapStateToProps(state) {
    return {
        cartData: state.cart.cartData,
        strings: state.mainScreenInit.strings

    }
}


export default connect(mapStateToProps)(SettingScreen);

const styles = StyleSheet.create({
    container: {
        height: hp('25%'),
        position: 'relative',
        backgroundColor: Colors().light_white,
        justifyContent: 'flex-end',
        alignItems: 'center',
        zIndex: 99,
        marginBottom: hp('4%')
    },
    imageView: {
        justifyContent: 'center',
        backgroundColor: Colors().white,
        alignItems: 'center',
        borderRadius: wp('0.8%'),
        elevation: 2,
        height: hp('11%'),
        width: wp('23%'),
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 0.2 },
        shadowOpacity: 0.20,
        shadowRadius: 3,
    },
    image: {
        resizeMode: 'contain',
        height: undefined,
        aspectRatio: 1,
        width: wp('20%'),
        alignSelf: 'center'
    },
    username: {
        color: Colors().text_color,
        fontFamily: Fonts.Font_Bold,
        fontSize: wp('4%'),
    },
    email: {
        color: Colors().secondry_text_color,
        fontFamily: Fonts.Font_Regular,
        fontSize: wp('3.5%'),
        marginTop: hp('0.5%')
    },
    listView: {
        height: hp('7.2%'),
        flexDirection: 'row',
        flex: 1,
        backgroundColor: Colors().white,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: hp('0.8%')
    },
    leftSide: {
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: wp('2%'),
        flex: 0.10,
    },
    center: {
        justifyContent: 'center',
        alignItems: 'flex-start',
        flex: 0.80,
        marginHorizontal: wp('3%')
    },
    rightSide: {
        flex: 0.10
    },
    listTitle: {
        color: Colors().text_color,
        fontFamily: Fonts.Font_Semibold,
        fontSize: wp('3.8%'),
    },
    icon: {
        fontSize: wp('5.5%'),
        color: Colors().secondry_text_color
    },
    rightIcon: {
        fontSize: wp('3.5%'),
        color: Colors().secondry_text_color
    },
    bottomTxt: {
        textAlign: 'center',
        fontSize: wp('5%'),
        fontFamily: Fonts.Font_Bold,
        color: Colors().text_color,
        lineHeight: hp('4%')
    },
    bottomVersion: {
        textAlign: 'center',
        fontSize: wp('2.5%'),
        fontFamily: Fonts.Font_Semibold,
        color: Colors().secondry_text_color,
    },
    bottomlogo: {
        height: hp('6%'),
        width: wp('40%'),
        resizeMode: 'contain',
        alignSelf: 'center'
    },
    iconImage: {
        resizeMode: 'contain',
        height: hp('7%'),
        width: wp('7%'),
        tintColor: Colors().secondry_text_color
    }
});