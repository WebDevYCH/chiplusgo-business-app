import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Text,
  Image,
  PermissionsAndroid,
  ScrollView,
} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {Modal, Portal, Button, Provider} from 'react-native-paper';
import TextInputMask from 'react-native-text-input-mask';
import {utils} from '@react-native-firebase/app';
import storage from '@react-native-firebase/storage';
import {useSelector, useDispatch} from 'react-redux';
import firestore from '@react-native-firebase/firestore';
import * as Progress from 'react-native-progress';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import Header from '../components/NavigationHeader';
import LockIcon from 'react-native-vector-icons/AntDesign';
import {TextInput} from 'react-native-paper';
import IconLock from 'react-native-vector-icons/Entypo';
import * as actions from '../Store/actions/type';

const SubAccountScreen = props => {
  const businessId = useSelector(({user}) => user.user.businessId);
  const subAccounts = useSelector(({data}) => data.subAccounts);
  const dispatch = useDispatch();
  const [state, setState] = useState({
    data: subAccounts,
  });
  const onPress = () => {
    props.navigation.goBack();
  };
  const onPressBtn = () => {
    props.navigation.navigate('SubAccountCreate');
  };
  const subProps = {
    title: 'Sub Accounts',
    showButton: true,
    onPress,
    onPressBtn,
    btnTxt: 'Create',
    btnColor: '#1463A0',
  };

  useEffect(() => {}, []);

  useEffect(() => {
    const subscriber = firestore()
      .collection('Business')
      .doc(businessId)
      .onSnapshot(documentSnapshot => {
        console.log(documentSnapshot.data());
        if (documentSnapshot.exists) {
          if (Object.keys(documentSnapshot.data()).includes('Sub_account')) {
            let tempSubAccount = [];
            Object.keys(documentSnapshot.data().Sub_account).map(item => {
              tempSubAccount.push(documentSnapshot.data().Sub_account[item]);
            });
            setState({...state, data: tempSubAccount});
            dispatch({
              type: actions.SET_DATA,
              payload: {subAccounts: tempSubAccount},
            });
          }
        } else {
          setState({...state, data: []});
        }
      });

    // Stop listening for updates when no longer required
    return () => subscriber();
  }, []);

  const goEditSubaccount = data => {
    dispatch({type: actions.SET_DATA, payload: {selectedSubaccount: data}});
    props.navigation.navigate('EditSubaccount')
  };

  // if (state.data.length === 0) {
  //   return (
  //     <View style={styles.loadingContainer}>
  //       <Progress.CircleSnail
  //         thickness={5}
  //         size={50}
  //         strokeCap={'square'}
  //         color={['#1463A0']}
  //       />
  //     </View>
  //   );
  // }

  return (
    <View>
      <Header {...subProps} />
      <ScrollView>
        <View style={styles.contianer}>
          {state.data.map((item, index) => (
            <TouchableOpacity
              style={styles.listContainer}
              key={index}
              onPress={() => goEditSubaccount(item)}>
              <Text style={{fontSize: 14, fontWeight: 'bold'}}>
                {item.Nick_name}
              </Text>
              <Text>{item.Email}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  contianer: {
    height: hp(87),
    width: wp(100),
    alignItems: 'center',
    paddingTop: hp(5),
    // justifyContent: 'space-between',
    backgroundColor: '#FFF',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },
  listContainer: {
    width: wp(90),
    height: hp(10),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomColor: '#ACACAC',
    borderBottomWidth: 1,
  },

  txt: {
    fontSize: 14,
  },
  btnContainer: {
    height: hp(13),
    width: wp(100),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },
  button: {
    width: wp(90),
    height: hp(7),
    backgroundColor: '#1463A0',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnTxt: {
    fontSize: 14,
    color: '#FFF',
  },
  logo: {
    width: wp(20),
    height: wp(20),
    borderRadius: wp(20),
  },
  modal: {
    backgroundColor: 'white',
    padding: 40,
    alignSelf: 'center',
    width: wp(70),
    height: hp(30),
    alignItems: 'center',
    justifyContent: 'space-around',
    zIndex: 1000,
  },
  alert: {
    backgroundColor: 'white',
    padding: 20,
    alignSelf: 'center',
    width: wp(70),
    height: hp(25),
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    borderRadius: 10,
    zIndex: 1000,
  },
  cameraButton: {
    width: wp(50),
    height: hp(7),
    backgroundColor: '#1463A0',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    width: wp(100),
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    marginBottom: 10,
  },
  error: {
    paddingHorizontal: 10,
    color: 'red',
  },
});

export default SubAccountScreen;
