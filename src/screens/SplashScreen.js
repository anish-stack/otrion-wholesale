import React, { useEffect } from "react";
import {
    View,
    Animated,

    Easing,
    I18nManager,
    LogBox,
    Platform
} from "react-native";
import { requestInit } from '@actions';
import { splashlogo } from '@common';
import { OtrixContainer } from '@component';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Colors } from '@helpers'
import getApi from "@apis/getApi";
import DeviceInfo from 'react-native-device-info';
import AsyncStorage from "@react-native-community/async-storage";
import moment from "moment";

const animatedValue = new Animated.Value(0);

function SplashScreen(props) {

    const navigateToMain = () => {
        //let navTo = setTimeout(() => props.loadApplication &&
        let navTo = setTimeout(() => props.loadApplication &&
            props.navigation.reset({
                index: 0,
                routes: [{ name: props.navScreen }]
            }), 300)

        // return () => {
        //     clearTimeout(navTo);
        // };
    }

 useEffect(() => {
    console.log('🚀 useEffect started - Component mounted/dependency changed');
    
    LogBox.ignoreLogs(['Animated: `useNativeDriver`']);
    
    console.log('📱 Starting animation...');
    Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.ease,
        useNativeDriver: true,
    }).start(() => {
        console.log('✅ Animation completed');
    });

    async function fetchData() {
        console.log('🔄 fetchData function started');
        
        try {
            // Get language
            let getLangauge = await AsyncStorage.getItem('Language');
            let language = 'en';
            if (getLangauge) {
                language = getLangauge;
               
            } 

            // Get device info
            let deviceID = await DeviceInfo.getUniqueId();
            let deviceType = Platform.OS;
            console.log('📱 Device ID:', deviceID);
            console.log('📱 Device Type:', deviceType);
            
            await AsyncStorage.setItem("DEVICEID", deviceID);
            
            // Check GET_UPDATED_DATA flag
            let getNewData = await AsyncStorage.getItem("GET_UPDATED_DATA");
            let callAPI = false;

            if (getNewData) {
                getNewData = JSON.parse(getNewData);
              
                if (getNewData == 1) {
                    callAPI = true;
                    console.log('✅ API call triggered by GET_UPDATED_DATA flag');
                }
            } else if (getNewData == null) {
                callAPI = true;
               
            } else {
                callAPI = false;
                console.log('❌ API call skipped based on GET_UPDATED_DATA');
            }

          
            callAPI = true; // Force API call every time

            console.log('🎯 Final callAPI decision:', callAPI);

            if (callAPI) {
              
                const apiUrl = "getHomePageInit?language=" + language + '&device_id=' + deviceID + '&deviceType=' + deviceType;
            
                getApi.getData(apiUrl, [])
                    .then(async response => {
                      
                        if (response.status == 1) {
                          
                            let momentStoreExpire = moment().add(24 * 7, 'hours').format();
                         
                            await AsyncStorage.setItem("LAST_REQUEST", JSON.stringify(momentStoreExpire));
                        
                            await AsyncStorage.setItem('API_DATA', JSON.stringify(response.data));
                         
                            await AsyncStorage.setItem("GET_UPDATED_DATA", JSON.stringify(false));
                          
                            getApi.getData("setCacheFalse?device_id=" + deviceID, [])
                                .then(async response => {
                                  
                                    console.log('🎯 Calling props.requestInit()');
                                    props.requestInit();
                                })
                                .catch(error => {
                                    console.error('❌ setCacheFalse API error:', error);
                                    // Still call requestInit even if setCacheFalse fails
                                    props.requestInit();
                                });
                        } else {
                            console.log('❌ API call failed - status not 1:', response);
                            // Call requestInit anyway to prevent app from hanging
                            props.requestInit();
                        }
                    })
                    .catch(error => {
                        console.error('❌ getHomePageInit API error:', error);
                        // Call requestInit anyway to prevent app from hanging
                        props.requestInit();
                    });
            } else {
                // console.log('⏭️ Skipping API call - calling requestInit with delay');
                let loadApp = setTimeout(() => {
                    console.log('🎯 Timeout completed - calling props.requestInit()');
                    props.requestInit();
                }, 500);
                
                return () => {
                    console.log('🧹 Cleaning up timeout');
                    clearTimeout(loadApp);
                };
            }
        } catch (error) {
            console.error('💥 Error in fetchData:', error);
            // Ensure requestInit is called even if there's an error
            props.requestInit();
        }
    }

    fetchData();
    console.log('🏁 useEffect setup completed');

}, [navigateToMain()]);
    return (
        <OtrixContainer>
            <View style={{ backgroundColor: Colors().white, flex: 1 }}>
                <Animated.Image source={splashlogo} resizeMode='contain' style={{
                    position: 'absolute',
                    left: I18nManager.isRTL == true ? wp('55%') : wp('35%'),
                    top: hp('20%'),
                    height: hp('10%'),
                    width: wp('10%'),
                    alignContent: 'center',
                    transform: [
                        {
                            translateX: animatedValue.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, 32]
                            })
                        },
                        {
                            translateY: animatedValue.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, 150]
                            })
                        },
                        {
                            scaleX: animatedValue.interpolate({
                                inputRange: [0, 1],
                                outputRange: [1, 8]
                            })
                        },
                        {
                            scaleY: animatedValue.interpolate({
                                inputRange: [0, 1],
                                outputRange: [1, 10]
                            })
                        }
                    ]
                }}

                />
            </View>
        </OtrixContainer >
    )
}

const mapStateToProps = (state) => ({
    loadApplication: state.mainScreenInit.loadApplication,
    navScreen: state.mainScreenInit.navScreen
});

const mapDispatchToProps = dispatch => (
    bindActionCreators({
        requestInit,
    }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(SplashScreen);