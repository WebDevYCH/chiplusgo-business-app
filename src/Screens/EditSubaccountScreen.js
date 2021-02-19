import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Text,
  ToastAndroid,
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
import firebase from '@react-native-firebase/app';
import {Users, Phone} from '../api';
import _ from 'lodash';

const EditSubaccountScreen = props => {
  const userData = useSelector(({user}) => user.user);
  const subAccount = useSelector(({data}) => data.selectedSubaccount);
  const subAccounts = useSelector(({data}) => data.subAccounts);
  const businessData = useSelector(({data}) => data.businessData);
  const dispatch = useDispatch();
  const [showPassword, setShowPasswrod] = useState(false);
  const [showNewPassword, setShowNewPasswrod] = useState(false);
  const [show, setShow] = React.useState(false);
  const [error, setError] = useState('');
  const [state, setState] = useState({
    nickName: subAccount.Nick_name,
    email: subAccount.Email,
    password: subAccount.Password,
    uid: subAccount.SubaccountId,
    emailValidation: false,
    passwordValidation: false,
    phoneValidation: false,
    phone: subAccount.Phone,
  });

  console.log(subAccounts)

  const onPress = () => {
    props.navigation.goBack();
  };

  const onPressBtn = () => {
    setShow(true);
  };
  const subProps = {
    title: 'Create Sub Account',
    showButton: true,
    onPress,
    onPressBtn,
    btnTxt: 'Remove',
    btnColor: '#EC1A17',
  };

  const hideAlert = () => setShow(false);
  const showAlert = () => setShow(true);

  const validateEmail = email => {
    const re = /^[a-zA-Z0-9]+@(?:[a-zA-Z0-9]+\.)+[A-Za-z]+$/;
    return re.test(email);
  };

  const setEmail = email => {
    console.log(email);
    if (validateEmail(email)) {
      setState({...state, email, emailValidation: false});
    } else {
      setState({...state, email, emailValidation: true});
    }
  };

  const setPassword = password => {
    if (password && password.length > 5) {
      setState({...state, password, passwordValidation: false});
    } else {
      setState({...state, password, passwordValidation: true});
    }
  };

  const validate = () => {
    if (state.phone && !state.phoneValidation) {
      return true;
    }
    setState({
      ...state,
      phoneValidation: state.phone ? false : true,
    });
    return false;
  };
  const onSave = () => {
    var updatedAccounts = subAccounts.map(item=>{
      if(item.Email===state.email){
        return {...item, Phone:state.phone}
      }
      return item
    })
    checkPhone().then(valid=>{
      if (!valid) {
        firestore()
          .collection('Business')
          .doc(userData.businessId)
          .update({
            Sub_account: [
              ...updatedAccounts,            
            ],
          })
          .then(() => {
            const businessRef = firestore()
              .collection('Business')
              .doc(userData.businessId);
            firestore()
              .collection('Business')
              .doc(subAccount.SubaccountId)
              .update({
                Phone:state.phone
              })
              .then(res => {
                props.navigation.goBack();
              });
          });
      } else {
        console.log('false');
      }
    })
    
    
    
  };

  const deleteUser = () => {
    console.log(state.uid);
    var tempAccounts = subAccounts;
    var evens = _.remove(tempAccounts, function (n) {
      return n.SubaccountId == state.uid;
    });
    console.log(tempAccounts);
    Users.deleteSubaccount({
      uid: state.uid,
    })
      .then(res => {
        console.log(res);
        firestore()
          .collection('Business')
          .doc(userData.businessId)
          .update({
            Sub_account: [...tempAccounts],
          })
          .then(() => {
            firestore()
              .collection('Business')
              .doc(state.uid)
              .delete()
              .then(() => {
                props.navigation.goBack();
              });
          });
      })
      .catch(error => {});
  };

  const checkPhone = async () =>
  new Promise(resolve => {
    if (state.phone)
      Phone.checkPhone({Phone: `+1${state.phone}`}).then(res => {
        if (res.error) {
          setState({...state, phoneValidation: true});
          ToastAndroid.showWithGravity(
            'Pleaes enter real phone number!',
            ToastAndroid.SHORT,
            ToastAndroid.CENTER,
          );
          resolve(true);
        } else {
          setState({...state, phoneValidation: false});
          ToastAndroid.showWithGravity(
            'Verified your phone number!',
            ToastAndroid.SHORT,
            ToastAndroid.CENTER,
          );
          resolve(false);
        }
      });
  });

  return (
    <View>
      <Header {...subProps} />
      <ScrollView>
        <View style={styles.contianer}>
          <View>
            <TextInput
              label="Name"
              value={state.nickName}
              style={styles.input}
              mode="outlined"
              selectionColor={'#1463A0'}
              underlineColor={'#1463A0'}
              onChangeText={text => setState({...state, nickName: text})}
              disabled
            />
            <TextInput
              label="Username"
              value={state.email}
              style={styles.input}
              mode="outlined"
              error={state.emailValidation}
              selectionColor={'#1463A0'}
              underlineColor={'#1463A0'}
              onChangeText={text => setEmail(text)}
              disabled
            />

            <TextInput
              label="Password"
              value={state.password}
              style={styles.input}
              mode="outlined"
              error={state.passwordValidation}
              selectionColor={'#1463A0'}
              underlineColor={'#1463A0'}
              secureTextEntry={!showPassword}
              right={
                !showPassword ? (
                  <TextInput.Icon
                    name={() => <IconLock name={'eye'} size={20} />}
                    onPress={() => setShowPasswrod(true)}
                  />
                ) : (
                  <TextInput.Icon
                    name={() => <IconLock name={'eye-with-line'} size={20} />}
                    onPress={() => setShowPasswrod(false)}
                  />
                )
              }
              onChangeText={text => setPassword(text)}
              disabled
            />
            <TextInput
              label="Phone Number"
              value={state.phone}
              style={styles.input}
              mode="outlined"
              selectionColor={'#1463A0'}
              underlineColor={'#1463A0'}
              error={state.phoneValidation}
              render={props => (
                <TextInputMask
                  {...props}
                  onChangeText={(formatted, extracted) => {
                    console.log(extracted); // +1 (123) 456-78-90
                    setState({...state, phone: extracted}); // 1234567890
                  }}
                  mask={'+1 ([000]) [000] [00] [00]'}
                />
              )}
              // disabled
            />

            <Text style={styles.error}>{error}</Text>
          </View>
          <View style={styles.btnContainer}>
            <TouchableOpacity style={styles.button} onPress={onSave}>
              <Text style={styles.btnTxt}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Modal
          visible={show}
          onDismiss={hideAlert}
          contentContainerStyle={styles.alert}>
          <Text style={{alignSelf: 'flex-start', fontSize: 16}}>
            Remove Sub Account
          </Text>
          <Text style={{alignSelf: 'flex-start', color: '#666666'}}>
            {`Do you want to remove sub account ${businessData.Business_name.English} - ${subAccount.Nick_name}? This action can not be undone.`}
          </Text>
          <View style={{flexDirection: 'row'}}>
            <TouchableOpacity
              onPress={hideAlert}
              style={{alignSelf: 'flex-start'}}>
              <Text style={{color: '#666666', marginRight: 20}}>CANCEL</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={deleteUser}
              style={{alignSelf: 'flex-start'}}>
              <Text style={{color: '#EC1A17'}}>REMOVE</Text>
            </TouchableOpacity>
          </View>
        </Modal>
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

export default EditSubaccountScreen;
