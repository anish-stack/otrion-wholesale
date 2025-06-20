import React from 'react';
import { View, StyleSheet, Text, FlatList, Image, TouchableOpacity } from 'react-native';
import { GlobalStyles, Colors } from '@helpers';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { ASSETS_DIR } from '@env';
import OtrixDivider from '../OtrixComponent/OtrixDivider';
import Fonts from '@helpers/Fonts';
import { logfunction } from "@helpers/FunctionHelper";

function HomeCategory(props) {
    // Check if data exists and is an array
    const hasData = props.data && Array.isArray(props.data) && props.data.length > 0;

    // Render empty state when no data
    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
                {props.strings?.homepage?.no_categories || 'No categories available'}
            </Text>
        </View>
    );

    return (
        <View>
            <View style={styles.catHeading}>
                <Text style={GlobalStyles.boxHeading}>
                    {props.strings?.homepage?.label_category || 'Categories'}
                </Text>
                {hasData && (
                    <TouchableOpacity 
                        style={{ flex: 0.50 }} 
                        onPress={() => props.navigation?.navigate('CategoryScreen')}
                    >
                        <Text style={GlobalStyles.viewAll}>
                            {props.strings?.homepage?.viewall || 'View All'}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
            <OtrixDivider size={'sm'} />
            
            {hasData ? (
                <FlatList
                    style={{ padding: wp('1%') }}
                    data={props.data}
                    contentContainerStyle={{ paddingRight: wp('3%') }}
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    onEndReachedThreshold={0.7}
                    keyExtractor={(contact, index) => String(index)}
                    renderItem={({ item, index }) => (
                        <TouchableOpacity 
                            style={styles.catBox} 
                            key={item.id} 
                            onPress={() => {
                                try {
                                    props.navigation?.navigate('ProductListScreen', { 
                                        type: 'category', 
                                        id: item.category_id, 
                                        childerns: item.children !== undefined ? item.children : [], 
                                        title: item.category_description?.name || 'Category'
                                    });
                                } catch (error) {
                                    logfunction('Navigation Error: ', error);
                                }
                            }}
                        >
                            <View style={styles.imageContainer}>
                                <Image 
                                    source={{ 
                                        uri: item.image ? ASSETS_DIR + 'category/' + item.image : null 
                                    }} 
                                    style={styles.imageView} 
                                    resizeMode='cover'
                                    onError={(error) => {
                                        logfunction('Image Load Error: ', error);
                                    }}
                                    // defaultSource={require('@assets/placeholder-image.png')} // Add a placeholder image
                                />
                            </View>
                            <Text numberOfLines={2} style={styles.catName}>
                                {item.category_description?.name || 'Unknown Category'}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            ) : (
                renderEmptyState()
            )}
        </View>
    );
}

export default HomeCategoryView = React.memo(HomeCategory);

const styles = StyleSheet.create({
    catHeading: {
        justifyContent: 'space-evenly',
        alignItems: 'center',
        flexDirection: 'row',
    },
    catBox: {
        height: hp('12.5%'),
        width: wp('15%'),
        marginHorizontal: wp('1.5%'),
        borderRadius: 5,
    },
    imageContainer: {
        backgroundColor: Colors().categoryBG,
        height: hp('7.5%'),
    },
    imageView: {
        resizeMode: 'cover',
        alignSelf: 'center',
        height: hp('7.5%'),
        borderRadius: 5,
        width: wp('15.5%')
    },
    catName: {
        fontSize: wp('3%'),
        fontFamily: Fonts.Font_Reguler,
        textAlign: 'center',
        color: Colors().text_color
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: hp('5%'),
        paddingHorizontal: wp('5%'),
    },
    emptyText: {
        fontSize: wp('3.5%'),
        fontFamily: Fonts.Font_Reguler,
        textAlign: 'center',
        color: Colors().text_color,
        opacity: 0.7,
    }
});