import { StyleSheet, Platform, Dimensions } from 'react-native';
import { Colors } from './Colors'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Fonts from './Fonts';
import { isRTL } from './Constants';
import { _roundDimensions } from '@helpers/util'

export const GlobalStyles = StyleSheet.create({
  mainView: {
    backgroundColor: Colors().light_white,
    flex: 1,
  },
  contentView: {
    marginHorizontal: wp('4%'),
  },
  boxHeading: {
    flex: 0.50,
    fontSize: wp('4%'),
    fontFamily: Fonts.Font_Semibold,
    color: Colors().black,
    textAlign: 'left'
  },
  viewAll: {
    flex: 0.50,
    fontSize: wp('3.4%'),
    fontFamily: Fonts.Font_Semibold,
    textTransform: 'uppercase',
    color: Colors().link_color,
    textAlign: 'right',
    padding: 8
  },
  outstockview: {
    backgroundColor: Colors().red,
    padding: wp('0.8%'),
    width: wp('18%'),
    position: 'absolute',
    top: hp('1.2%'),
    justifyContent: 'center',
    alignItems: 'center',
    left: wp('2%'),
    overflow: 'hidden',
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 0.3 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    borderRadius: wp('1%'),
    elevation: 3
  },
  outofstockTxt: {
    color: Colors().white,
    fontFamily: Fonts.Font_Semibold,
    fontSize: wp('2.6%'),
    textAlign: 'center',
  },
  newtextView: {
    backgroundColor: Colors().white,
    padding: wp('0.8%'),
    width: wp('12%'),
    position: 'absolute',
    top: hp('1.2%'),
    left: wp('2%'),
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 0.3 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    borderRadius: wp('1%'),
    elevation: 3
  },
  newTxt: {
    color: Colors().text_color,
    fontFamily: Fonts.Font_Semibold,
    fontSize: wp('2.8%'),
    textAlign: 'center',
  },
  unFavCircle: {
    backgroundColor: Colors().white,
    height: _roundDimensions()._height * 0.040,
    width: _roundDimensions()._height * 0.040,
    borderRadius: _roundDimensions()._borderRadius,
    position: 'absolute',
    top: hp('1.2%'),
    left: wp('32%'),
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 0.1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 1,
  },
  FavCircle: {
    backgroundColor: Colors().themeColor,
    height: _roundDimensions()._height * 0.040,
    width: _roundDimensions()._height * 0.040,
    borderRadius: _roundDimensions()._borderRadius,
    position: 'absolute',
    top: hp('1.2%'),
    left: wp('32%'),
    justifyContent: 'center',
    alignItems: 'flex-end',
    overflow: 'hidden',
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 0.1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  unFavIcon: {
    fontWeight: '700',
    fontSize: wp('3.8%')
  },
  headerLeft: {
    flex: 0.10,
    marginLeft: wp('5%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 0.80,
    marginLeft: wp('5%'),
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headingTxt: {
    fontFamily: Fonts.Font_Bold,
    fontSize: wp('5.5%'),
    color: Colors().text_color
  },
  headerRight: {
    flex: 0.10,
    justifyContent: 'center',
    alignItems: 'center',
    height: _roundDimensions()._height * 0.042,
    width: _roundDimensions()._height * 0.040,
    borderRadius: _roundDimensions()._borderRadius,
    backgroundColor: Colors().white,
    marginRight: wp('4%'),
    padding: 4
  },
  horizontalLine: {
    width: wp('90%'),
    alignSelf: 'center',
    height: 0.5,
    backgroundColor: Colors().line_color
  },

  tabBarView: {
    backgroundColor: Colors().light_white,
    alignItems: 'center',
    justifyContent: 'center',
    width: wp('100%'),
    height:
      Platform.OS === 'ios'
        ? wp('22%')
        : wp('15%'),
    flexDirection: 'row',
    marginTop: hp('1%')
  },
  tabbarText: {
    alignSelf: 'center',
    fontSize: Platform.isPad === true ? wp('3%') : wp('5%'),
    marginLeft: Platform.isPad === true ? wp('1%') : wp('2%'),
    fontFamily: Fonts.Font_Bold,
    flex: 1,
    color: Colors().text_color,
  },

  authtabbarText: {
    alignSelf: 'flex-start',
    fontSize: Platform.isPad === true ? wp('3%') : wp('6%'),
    marginLeft: wp('5%'),
    fontFamily: Fonts.Font_Bold,
    flex: 1,
    color: Colors().text_color,
    lineHeight: hp('5%')
  },

  authSubText: {
    fontSize: Platform.isPad === true ? wp('3%') : wp('3.5%'),
    fontFamily: Fonts.Font_Reguler,
    color: '#767787',
    marginLeft: wp('5%'),
  },



  mainProductView: {
    backgroundColor: Colors().light_white,
    // flex: 0.5,
    height: Platform.isPad === true ? wp('50%') : wp('75%'),
    width: Platform.isPad === true ? wp('30%') : wp('46%'),
    // margin: wp('2%'),
    marginBottom: wp('3%'),
    marginRight: wp('3%'),
    borderRadius: wp('2%'),

    // mange Shadow
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 0.3 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
    // shadowOpacity: Platform.OS === 'ios' ? 0.20 : 10,
    // shadowRadius: 5,
    // shadowOffset: { height: 0, weight: 0 },
    // shadowColor: 'black',
    // elevation: 10,
  },
  mainCategoriesView: {
    backgroundColor: Colors().light_white,
    // flex: Platform.isPad === true ? 1 : 0.5,
    height: Platform.isPad === true ? wp('45%') : wp('60%'),
    width: Platform.isPad === true ? wp('30%') : wp('46%'),
    // margin: wp('2%'),
    marginBottom: wp('3%'),
    marginRight: wp('3%'),
    borderRadius: wp('2%'),

    // mange Shadow
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 0.3 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
    // shadowOpacity: Platform.OS === 'ios' ? 0.10 : 10,
    // shadowRadius: 2,
    // shadowColor: 'black',
  },
  mainWishProductView: {
    // flex: 0.5,
    padding: Platform.isPad === true ? wp('1.5%') : wp('3%'),
    alignItems: 'center',
    flexDirection: 'row',
    borderBottomWidth: wp('0.1%'),
    borderColor: Colors().dark_gray_text,
    borderRadius: wp('2%'),

    // mange Shadow
    // shadowOpacity: Platform.OS === 'ios' ? 0.20 : 10,
    // shadowRadius: 5,
    // shadowColor: 'black',
    // elevation: 10,
  },
  button: {
    height: Platform.isPad === true ? wp('6%') : wp('11%'),
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: 'rgba(0,0,0, .4)',
    shadowOffset: { height: 1, width: 1 },
    shadowOpacity: 1,
    shadowRadius: 1,
    elevation: 2,
  },
  buttonText: {
    fontFamily: Fonts.Font_Bold,
    color: Colors().white,
    fontSize: Platform.isPad === true ? wp('2.5%') : wp('3.5%'),
  },
  textInputStyle: {
    height: wp('11%'),
    fontFamily: Fonts.Font_Bold,
    backgroundColor: Colors().white,
    fontSize: Platform.isPad === true ? wp('3.5%') : wp('3.2%'),
    color: Colors().secondry_text_color,
    padding: 5
    //  borderColor: Colors().light_gray
  },
  textAreaInputStyle: {
    height: wp('20%'),
    fontFamily: Fonts.Font_Bold,
    backgroundColor: Colors().white,
    fontSize: Platform.isPad === true ? wp('3.5%') : wp('3.2%'),
    color: Colors().secondry_text_color,
    padding: 5

    // borderColor: Colors().light_gray
  },
  textInputStyle2: {
    height: wp('15%'),
    padding: 5,
    fontFamily: Fonts.Font_Segoe_UI_Reguler,
    backgroundColor: Colors().white,
    width: wp('44%'),
    color: Colors().black,
  },
  shadowInput: {
    elevation: 4
  },
  authHeader: { flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', marginTop: hp('1.5%') },
  // Home screen global view ------------------------------------------------------------- >>>>>>>>>>
  mainViewHomeProduct: {
    backgroundColor: Colors().light_white,
    width: Platform.isPad === true ? wp('30%') : wp('40%'),
    height: Platform.isPad === true ? wp('50%') : wp('70%'),
    margin: Platform.isPad === true ? wp('1.5%') : wp('2%'),
    borderRadius: wp('2%'),

    // mange Shadow
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 0.3 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
    // shadowOpacity: Platform.OS === 'ios' ? 0.10 : 10,
    // shadowRadius: 2,
    // shadowColor: 'black',
  },
  gridViewHomeProduct: {
    backgroundColor: Colors().lightYellowBackground,
    flex: 0.5,
    height: wp('50%'),
    margin: wp('2%'),
    borderRadius: wp('2%'),
    // mange Shadow
    shadowOpacity: Platform.OS === 'ios' ? 0.1 : 10,
    shadowRadius: 2,
    shadowColor: 'black',
    elevation: 10,
  },
  gridMainView: {
    backgroundColor: Colors().white,
    paddingVertical: wp('3%'),
    // mange Shadow
    shadowOpacity: Platform.OS === 'ios' ? 0.1 : 10,
    shadowRadius: 2,
    shadowColor: 'black',
    elevation: 10,
  },
  TopBrandView: {
    backgroundColor: Colors().white,
    width: wp('40%'),
    height: wp('70%'),
    margin: wp('2%'),
    borderRadius: wp('2%'),
    // mange Shadow
    shadowOpacity: Platform.OS === 'ios' ? 0.1 : 10,
    shadowRadius: 2,
    shadowColor: 'black',
    elevation: 10,
  },
  mainViewHomeProductHeader: {
    // flex: 1,
    paddingHorizontal: wp('3%'),
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mainTextHomeProductHeader: {
    fontSize: Platform.isPad === true ? wp('3%') : wp('4.5%'),
    fontFamily: Fonts.Font_Segoe_UI_Bold,
    // flex: 1,
  },
  seeAllTextHomeProduct: {
    fontSize: Platform.isPad === true ? wp('2.5%') : wp('4%'),
    fontFamily: Fonts.Font_Segoe_UI_Semibold,
    // color: Colors().black
  },

  backIcon: {
    margin: wp('2%'),
    padding: wp('2%'),
    height: Platform.isPad === true ? wp('4%') : wp('6%'),
    width: Platform.isPad === true ? wp('4%') : wp('6%'),
    tintColor: Colors().black,
    transform: isRTL ? [{ rotate: '0deg' }] : [{ rotate: '180deg' }],
  },
  nextIcon: {
    margin: wp('2%'),
    padding: wp('2%'),
    height: wp('4%'),
    width: wp('4%'),
    transform: isRTL ? [{ rotate: '0deg' }] : [{ rotate: '180deg' }],
  },
  loader: {
    marginVertical: Dimensions.get('screen').height / 3,
  },
  badge: {
    position: 'absolute',
    top: -14,
    right: 3,
    height: 24,
    width: 24,
    borderRadius: 12,
    backgroundColor: Colors().themeColor,
    justifyContent: 'center',
  },
  badgeText: {
    color: Colors().white,
    textAlign: 'center',
    fontSize: wp('3%'),
    fontFamily: Fonts.Font_Semibold,
  },
});
