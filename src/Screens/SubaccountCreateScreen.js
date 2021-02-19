import React, {useState, useEffect} from 'react';
import {View, StyleSheet, Text, ToastAndroid, ScrollView} from 'react-native';
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
import {TextInput} from 'react-native-paper';
import IconLock from 'react-native-vector-icons/Entypo';
import Spinner from 'react-native-loading-spinner-overlay';
import {Users, Phone, Emails} from '../api';

const SubAccountCreateScreen = props => {
  const userData = useSelector(({user}) => user.user);
  const subAccounts = useSelector(({data}) => data.subAccounts);
  const dispatch = useDispatch();
  const [showPassword, setShowPasswrod] = useState(false);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = React.useState(false);
  const [error, setError] = useState('');
  const [state, setState] = useState({
    nickName: '',
    email: '',
    password: '',
    emailValidation: false,
    passwordValidation: false,
    phoneValidation: false,
    phone: '',
  });

  const onPress = () => {
    props.navigation.goBack();
  };
  const subProps = {
    title: 'Create Sub Account',
    showButton: false,
    onPress,
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

  const checkPhone = async () =>
    new Promise(async (resolve, reject) => {
      if (state.phone) {
        console.log({
          Phone: `+1${state.phone}`,
          Body: 'This is a test message from Chiplusgo Business App',
          From: '+13462331831',
        });
        await Emails.sendEmail({
          option: {
            from:
              'Customer Service <noreply@firebase.com>',
            to: state.email.replace(/\s/g, ''),
            subject: 'Your Chi+Go Business Sub Account has been created successfully.',
            text: "Your Chi+Go Business Sub Account has been created successfully."}});
        await Phone.sendSMS({
          Phone: `+1${state.phone}`,
          Body: "Your Chi+Go Business Sub Account has been created successfully.",
          From: '+13462331831',
        }).then(res => {
          console.log('===============================', res);
          if (res.error) {            
            ToastAndroid.showWithGravity(
              `We can't send the SMS because ${res.message}!`,
              ToastAndroid.LONG,
              ToastAndroid.CENTER,
            );
          }
          console.log(res);
          Phone.checkPhone({Phone: `+1${state.phone}`}).then(res => {
            if (res.error) {
              setState({...state, phoneValidation: true});
              ToastAndroid.showWithGravity(
                'Please enter real phone number!',
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
      }
    });

  const validate = async () =>
    new Promise(resolve => {
      checkPhone()
        .then(validPhone => {
          console.log(validPhone);
          
          if (
            validateEmail(state.email) &&
            state.password &&
            state.password.length &&
            !state.emailValidation &&
            !state.passwordValidation &&
            !validPhone
          ) {
            resolve(true);
          }
          setState({
            ...state,
            emailValidation: validateEmail(state.email) ? false : true,
            passwordValidation:
              state.password && state.password.length > 5 ? false : true,
            phoneValidation: validPhone,
          });

          resolve(false);
        })
        .catch(e => {
          console.log('--------------err', e);
        });
    });
  const onSave = () => {
    setLoading(true)
    validate().then(valid => {
      if (valid) {
        
        Users.createSubaccount({
          email: state.email.replace(/\s/g, ''),
          password: state.password,
          nickName: "business",
          phoneNumber: `+1${state.phone}`,
          photoURL:"https://business.com"
        })
          .then(res => {
            if (res.error) {              
              setLoading(false)
              ToastAndroid.showWithGravity(
                "Your Email or Phone has been registered already. Please use another Email or Phone number.",
                ToastAndroid.SHORT,
                ToastAndroid.CENTER,
              );

              return;
            }
            firestore()
              .collection('Business')
              .doc(userData.businessId)
              .update({
                Sub_account: [
                  ...subAccounts,
                  {
                    Email: state.email,
                    BusinessId: userData.businessId,
                    Nick_name: state.nickName,
                    SubaccountId: res.uid,
                    Password: state.password,
                    AccountType: 'SUB',
                    Phone: state.phone,
                  },
                ],
              })
              .then(() => {
                console.log('========updated=======');
                const businessRef = firestore()
                  .collection('Business')
                  .doc(userData.businessId);
                firestore()
                  .collection('Business')
                  .doc(res.uid)
                  .set({
                    Business: businessRef,
                    BusinessId: userData.businessId,
                    SubaccountId: res.uid,
                    Nick_name: state.nickName,
                    Email: state.email,
                    AccountType: 'SUB',
                    Phone: state.phone,
                  })
                  .then(res => {
                    setLoading(false)
                    props.navigation.goBack();
                  });
              });
          })
          .catch(error => {
            setLoading(false)
            console.log(error);
            setError('Please use another email!');
          });
      } else {
        setLoading(false)
        console.log('false');
      }
    });
  };

  return (
    <View>
            <Spinner
          visible={loading}
          textContent={'Create subaccount...'}
          textStyle={{color:'#FFF'}}
        />
      <Header {...subProps} />
      <ScrollView>
        <View style={styles.contianer}>
          <View>
            <TextInput
              label="Sub Account Business Name"
              value={state.nickName}
              style={styles.input}
              mode="outlined"
              selectionColor={'#1463A0'}
              underlineColor={'#1463A0'}
              onChangeText={text => setState({...state, nickName: text})}
            />
            <TextInput
              label="Email for Sub Account Login"
              value={state.email}
              style={styles.input}
              mode="outlined"
              error={state.emailValidation}
              selectionColor={'#1463A0'}
              underlineColor={'#1463A0'}
              onChangeText={text => setEmail(text.replace(/\s/g, ''))}
            />

            <TextInput
              label="Create Password for Sub Account"
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
            />
            <TextInput
              label="Phone Number"
              // value={state.phone}
              style={styles.input}
              mode="outlined"
              selectionColor={'#1463A0'}
              underlineColor={'#1463A0'}
              
              error={state.phoneValidation}
              render={props => (
                <TextInputMask
                  {...props}
                  onChangeText={(formatted, extracted) => {
                    setState({...state, phone: extracted}); // 1234567890
                  }}
                  mask={'+1 ([000]) [000] [00] [00]'}
                />
              )}
            />

            <Text style={styles.error}>{error}</Text>
          </View>
          <View style={styles.btnContainer}>
            <TouchableOpacity style={styles.button} onPress={onSave}>
              <Text style={styles.btnTxt}>Save</Text>
            </TouchableOpacity>
            {/* <TouchableOpacity style={styles.button} onPress={()=>{props.navigation.goBack()}}>
              <Text style={styles.btnTxt}>Exit</Text>
            </TouchableOpacity> */}
          </View>
        </View>

        <Modal
          visible={show}
          onDismiss={hideAlert}
          contentContainerStyle={styles.alert}>
          <Text>
            Please contact CHI+GO to change your business name and account
            email.
          </Text>
          <TouchableOpacity
            onPress={hideAlert}
            style={{alignSelf: 'flex-start'}}>
            <Text style={{color: '#1463A0'}}>GOT IT</Text>
          </TouchableOpacity>
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
    marginVertical:5
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
    paddingHorizontal: 20,
    color: 'red',
  },
});

export default SubAccountCreateScreen;
