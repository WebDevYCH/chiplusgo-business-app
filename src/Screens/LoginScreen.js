import React, {useState} from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ToastAndroid,
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import auth from '@react-native-firebase/auth';
import { Portal, Button, Provider} from 'react-native-paper';
import {useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {TextInput} from 'react-native-paper';
import IconEntypo from 'react-native-vector-icons/Entypo';
import {useDispatch} from 'react-redux';
import * as Actions from '../Store/actions/type';
import firestore from '@react-native-firebase/firestore';
import Spinner from 'react-native-loading-spinner-overlay';
import {set} from 'react-native-reanimated';
import {
  Input,
  Stack,
  Center,
  Heading,
  useColorModeValue,
  NativeBaseProvider,
  Icon,
  Modal
} from 'native-base';

const LoginScreen = props => {
  const [isSelected, setSelection] = useState(false);
  const [email, setEmail] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [password, setPasswrod] = useState('');
  const [showPassword, setShowPasswrod] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    try {
      auth().signOut();
    } catch (error) {
      console.log(error);
    }
  }, []);

  const storeData = async uid => {
    try {
      await AsyncStorage.setItem('@token', uid);
    } catch (error) {
      // Error saving data
    }
  };

  const doLogin = () => {
    if (password && email) {
      setLoading(true);
      auth()
        .signInWithEmailAndPassword(email.replace(/\s/g, ''), password)
        .then(user => {
          firestore()
            .collection('Business')
            .get()
            .then(querySnapshot => {
              let flag = 1;
              const tempUser = user.user;
              console.log({...tempUser._user});
              querySnapshot.forEach(documentSnapshot => {
                if (
                  Object.keys(documentSnapshot.data()).includes('Sub_account')
                ) {
                  const subAccountsData = documentSnapshot.data().Sub_account;
                  console.log('User ID: ', subAccountsData);
                  Object.keys(subAccountsData).map(item => {
                    if (subAccountsData[item].SubaccountId === user.user.uid) {
                      console.log(subAccountsData[item], documentSnapshot.id);
                      dispatch({
                        type: Actions.SET_USER_DATA,
                        payload: {
                          ...tempUser._user,
                          businessId: documentSnapshot.id,
                          subAccount: subAccountsData[item],
                        },
                      });
                      dispatch({
                        type: Actions.SET_ROLE,
                        payload: 'agency',
                      });
                      if (isSelected) {
                        storeData(user.user.uid);
                      }
                      flag = 0;
                      setLoading(false);
                      props.navigation.replace('QRGenerate');
                    }
                  });
                  setLoading(false);
                }
              });
              if (flag) {
                console.log('---------------------check business account');
                dispatch({
                  type: Actions.SET_USER_DATA,
                  payload: {
                    ...tempUser._user,
                    businessId: user.user.uid,
                    subAccount: {},
                  },
                });
                dispatch({
                  type: Actions.SET_ROLE,
                  payload: 'admin',
                });
                if (isSelected) {
                  storeData(user.user.uid);
                }
                props.navigation.replace('QRGenerate');
              }
            });

          console.log('User signed in anonymously');
        })
        .catch(error => {
          setLoading(false);
          if (error.code === 'auth/user-not-found') {
            console.log(error);
            setError(
              'There is no user record corresponding to this identifier. The user may have been deleted.',
            );
          }
          if (error.code === 'auth/wrong-password') {
            console.log(error);
            setError(
              'The password is invalid or the user does not have a password.',
            );
          }

          console.log(error);
          // console.error(error);
        });
    }

    // props.navigation.navigate("QRGenerate")
  };

  const resetPassword = () => {
    auth()
      .sendPasswordResetEmail(email)
      .then(() => {
        ToastAndroid.show(
          'We have sent the reset password link to your email. Please check your email.',
          ToastAndroid.LONG,
        );
        setShowModal(false);
      })
      .catch(error => {
        setShowModal(false);
        if (error.code === 'auth/invalid-email') {
          ToastAndroid.show(error.message, ToastAndroid.LONG);
        }
      });
  };


  return (
    <View style={styles.sectionContainer}>
      <Spinner
        visible={loading}
        textContent={'Sign in...'}
        textStyle={{color: '#FFF'}}
      />
      <View style={styles.formContainer}>
        <Text style={styles.title}>LOGIN</Text>
        {/* <TextInput
          label="User Name"
          value={email}
          style={styles.input}
          mode="outlined"
          selectionColor={'#1463A0'}
          underlineColor={'#1463A0'}
          onChangeText={text => setEmail(text)}
        /> */}
        {/* <TextInput
          label="Password"
          value={password}
          style={styles.input}
          mode="outlined"
          selectionColor={'#1463A0'}
          underlineColor={'#1463A0'}
          secureTextEntry={!showPassword}
          right={
            !showPassword ? (
              <TextInput.Icon
                name={() => <Icon name={'eye'} size={20} />}
                onPress={() => setShowPasswrod(true)}
              />
            ) : (
              <TextInput.Icon
                name={() => <Icon name={'eye-with-line'} size={20} />}
                onPress={() => setShowPasswrod(false)}
              />
            )
          }
          onChangeText={text => setPasswrod(text)}
        /> */}
        <Stack space={4} w="100%" safeArea>
          <Input
            // size="2xl"
            variant="outline"
            placeholder="User Name"
            placeholderTextColor={useColorModeValue(
              'blueGray.400',
              'blueGray.50',
            )}
            value={email}
            // style={styles.input}
            onChangeText={text => setEmail(text)}
          />

          <Input
            InputRightElement={
              !showPassword ? (
                <Icon
                  as={
                    <IconEntypo
                      name={'eye'}
                      size={20}
                      color="#900"
                      onPress={() => setShowPasswrod(true)}
                    />
                  }
                  size="md"
                  m={2}
                  color={useColorModeValue('black', 'gray.300')}
                />
              ) : (
                <Icon
                  as={
                    <IconEntypo
                      name={'eye-with-line'}
                      size={20}
                      color="#900"
                      onPress={() => setShowPasswrod(false)}
                    />
                  }
                  size="md"
                  m={2}
                  color={useColorModeValue('black', 'gray.300')}
                />
              )
            }
            type={showPassword ? 'text' : 'password'}
            value={password}
            variant="outline"
            placeholder="Password"
            placeholderTextColor={useColorModeValue(
              'blueGray.400',
              'blueGray.50',
            )}
            onChangeText={text => setPasswrod(text)}
          />
        </Stack>

        <Text style={styles.error}>{error}</Text>
        <View style={styles.checkboxContainer}>
          <CheckBox
            value={isSelected}
            onValueChange={setSelection}
            style={styles.checkbox}
          />
          <Text style={styles.label}>Remember me</Text>
        </View>
        <TouchableOpacity
          style={password && email ? styles.button : styles.grayBtn}
          onPress={doLogin}>
          <Text style={styles.btnTxt}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.forgotButton}
          onPress={() => setShowModal(true)}>
          <Text>Forgot Password?</Text>
        </TouchableOpacity>
      </View>
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        contentContainerStyle={{
          backgroundColor: 'white',
          padding: 40,
          alignSelf: 'center',
          width: wp(90),
          height: hp(40),
          alignItems: 'center',
          justifyContent: 'space-around',
        }}>
          <Modal.Content>
          <Modal.Header>Forgot Password</Modal.Header>
           <Modal.Body>
        
        <TextInput
          label="Email"
          value={email}
          style={styles.input}
          mode="outlined"
          selectionColor={'#1463A0'}
          underlineColor={'#1463A0'}
          onChangeText={text => setEmail(text)}
        />
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-around',
            // width: wp(90),
          }}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setShowModal(false)}>
            <Text style={{color: '#FFF'}}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cameraButton} onPress={resetPassword}>
            <Text style={{color: '#FFF'}}>Send Email</Text>
          </TouchableOpacity>
        </View>
        </Modal.Body>
        </Modal.Content>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    height: hp(100),
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
  },
  formContainer: {
    marginTop: hp(10),
    height: hp(60),
    width: wp(80),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  input: {
    width: wp(80),
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    marginBottom:30
  },
  title: {
    fontSize: 40,
    alignSelf: 'flex-start',
  },
  button: {
    width: wp(80),
    height: hp(7),
    backgroundColor: '#1463A0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  grayBtn: {
    width: wp(80),
    height: hp(7),
    backgroundColor: 'gray',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  cancelButton: {
    width: wp(30),
    height: hp(7),
    backgroundColor: 'red',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraButton: {
    width: wp(30),
    height: hp(7),
    backgroundColor: '#1463A0',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnTxt: {
    color: '#FFFFFF',
  },
  forgotButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },

  checkboxContainer: {
    width: wp(80),
    flexDirection: 'row',
  },

  checkbox: {
    alignSelf: 'center',
  },

  label: {
    margin: 8,
  },
  error: {
    color: 'red',
  },
});

export default LoginScreen;
