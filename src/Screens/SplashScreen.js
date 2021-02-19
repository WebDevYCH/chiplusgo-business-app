import React from 'react';
import {useEffect} from 'react';
import {View, StyleSheet, Text, Image} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Images from '../assets/images';
import * as Progress from 'react-native-progress';

const SplashScreen = props => {
  const getData = async () => {
    try {
      const value = await AsyncStorage.getItem('@token');
      if (value !== null) {
        return value;
      } else {
        return 0;
      }
    } catch (e) {
      console.log(e);
      return 0;
    }
  };

  useEffect(() => {
    setTimeout(async () => {
      const uid = await getData();
      console.log(uid);
      if (typeof uid === 'string') {
        console.log(uid);
        props.navigation.replace('QRGenerate',{
            uid:uid
        })
      } else {
        props.navigation.replace('Login')
      }
    }, 3000);
  }, []);

  return (
    <View style={styles.container}>
      <Image source={Images.LogoImg} />
      <View style={styles.spinnerContainer}>
        <Progress.CircleSnail
          thickness={5}
          size={50}
          strokeCap={'square'}
          color={['#1463A0']}
        />
        <Text style={styles.loadingTxt}>Loading...</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: hp(100),
    width: wp(100),
    paddingTop: hp(15),
    paddingBottom: hp(40),
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
  },
  balanceFont: {
    fontSize: 25,
    lineHeight: 40,
  },
  loadingTxt: {
    color: '#1463A0',
  },
  spinnerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SplashScreen;
