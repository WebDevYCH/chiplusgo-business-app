import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {useSelector, useDispatch} from 'react-redux';
import firestore from '@react-native-firebase/firestore';
import * as Progress from 'react-native-progress';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {TouchableOpacity} from 'react-native-gesture-handler';
import * as actions from '../Store/actions/type';
import * as images from '../assets/images';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ADMIN_ROLE} from '../utiles';
import profileImg from '../assets/images/profile.jpg'

const Account = props => {
  const businessStoreData = useSelector(({data}) => data.businessData);
  const role = useSelector(({user}) => user.role);
  const userData = useSelector(({user}) => user.user);
  const [businessData, setBusinessData] = useState({});
  const dispatch = useDispatch();
  useEffect(() => {
    firestore()
      .collection('Business')
      .doc(userData.businessId)
      .get()
      .then(documentSnapshot => {
        console.log('User exists: ', documentSnapshot.exists);

        if (documentSnapshot.exists) {
          setBusinessData(documentSnapshot.data());
          console.log(documentSnapshot.data().Business_logo);
          
        }
      });
  }, [businessStoreData]);

  const goEditProfile = () => {
    dispatch({type: actions.SET_BUSINESS_DATA, payload: businessData});
    props.navigation.navigate('EditProfile');
  };

  const goResetPassword = () => {
    props.navigation.navigate('ResetPassword');
  };

  const goSubAccount = () => {
    dispatch({type: actions.SET_BUSINESS_DATA, payload: businessData});
    props.navigation.navigate('SubAccount');
  };

  const goWithdraw = () => {
    props.navigation.navigate('Withdraw');
  };

  const signOut = async () => {
    auth().signOut();
    await AsyncStorage.setItem('@token', '');
    props.navigation.replace('Login');
  };

  const goChangeRate = async () => {
    props.navigation.navigate('CashPointRate');
  }

  if (Object.keys(businessData).length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Progress.CircleSnail
          thickness={5}
          size={50}
          strokeCap={'square'}
          color={['#1463A0']}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View>
        <Image source={images.CardImg} style={styles.img} />
        <View style={styles.logoContainer}>
          <Image
            source={businessData.Business_logo?{uri: businessData.Business_logo}:profileImg}
            style={styles.logo}
          />
        </View>
      </View>
      <View style={styles.nameSection}>
        {role === ADMIN_ROLE ? (
          <Text style={styles.name}>{businessData.Business_name.English}</Text>
        ) : (
          <Text
            style={
              styles.name
            }>{`${businessData.Business_name.English} - ${userData.subAccount.Nick_name}`}</Text>
        )}

        <Text style={styles.email}>{userData.email}</Text>
      </View>
      <View style={{width: wp(100), alignItems: 'center'}}>
        {role === ADMIN_ROLE && (
          <TouchableOpacity style={styles.touchList} onPress={goEditProfile}>
            <Text style={{fontSize: 14}}>Edit Profile</Text>
            <Icon name="navigate-next" size={30} color="#ACACAC"></Icon>
          </TouchableOpacity>
        )}

        {role === ADMIN_ROLE && (
          <TouchableOpacity style={styles.touchList} onPress={goResetPassword}>
            <Text style={{fontSize: 14}}>Reset Password</Text>
            <Icon name="navigate-next" size={30} color="#ACACAC"></Icon>
          </TouchableOpacity>
        )}

        {role === ADMIN_ROLE && (
          <TouchableOpacity style={styles.touchList} onPress={goSubAccount}>
            <Text style={{fontSize: 14}}>Sub Accounts</Text>
            <Icon name="navigate-next" size={30} color="#ACACAC"></Icon>
          </TouchableOpacity>
        )}

        {role === ADMIN_ROLE && (
          <TouchableOpacity style={styles.touchList} onPress={goWithdraw}>
            <Text style={{fontSize: 14}}>Withdraw Request</Text>
            <Icon name="navigate-next" size={30} color="#ACACAC"></Icon>
          </TouchableOpacity>
        )}

        {role === ADMIN_ROLE && (
          <TouchableOpacity style={styles.touchList} onPress={goChangeRate}>
            <Text style={{fontSize: 14, color:'#000'}}>Return points rate</Text>
            <Icon name="navigate-next" size={30} color="#ACACAC"></Icon>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.touchList} onPress={signOut}>
          <Text style={{fontSize: 14, color: '#EC1A17'}}>SIGN OUT</Text>
          <Icon name="navigate-next" size={30} color="#ACACAC"></Icon>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: hp(87),
    width: wp(100),
    backgroundColor: '#FFF',
  },
  banner: {
    width: wp(100),
    position: 'relative',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },
  img: {
    width: wp(100),
    height: hp(15),
  },
  logo: {
    width: hp(13),
    height: hp(13),
    borderRadius: hp(13),
  },
  logoContainer: {
    width: hp(16),
    height: hp(16),
    borderRadius: hp(16),
    padding: hp(2),
    borderWidth: hp(2),
    borderColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: hp(12),
    position: 'absolute',
    bottom: -hp(8),
    alignSelf: 'center',
    backgroundColor: '#FFF',
  },
  nameSection: {
    height: hp(22),
    width: wp(100),
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 20,
    color: '#000',
    fontWeight: 'bold',
  },
  email: {
    fontSize: 14,
    color: '#666666',
  },
  touchList: {
    width: wp(90),
    height: hp(8),
    borderBottomWidth: 1,
    borderBottomColor: '#ACACAC',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});

export default Account;
