import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Text,
  Image,
  PermissionsAndroid,
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
import IconEntypo from 'react-native-vector-icons/FontAwesome5';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import Header from '../components/NavigationHeader';
import LockIcon from 'react-native-vector-icons/AntDesign';
import {TextInput} from 'react-native-paper';
import IconLock from 'react-native-vector-icons/Entypo';
import firebase from '@react-native-firebase/app';
import {
  Input,
  Stack,
  Center,
  Heading,
  useColorModeValue,
  NativeBaseProvider,
  Icon,
} from 'native-base';

const ResetPasswordScreen = props => {
  const businessData = useSelector(({data}) => data.businessData);
  const userData = useSelector(({user}) => user.user);
  const dispatch = useDispatch();
  const [showPassword, setShowPasswrod] = useState(false);
  const [showNewPassword, setShowNewPasswrod] = useState(false);
  const [show, setShow] = React.useState(false);
  const [error, setError] = useState('');
  const [state, setState] = useState({
    email: userData.email,
    currentPassword: '',
    newPassword: '',
  });

  const onPress = () => {
    props.navigation.goBack();
  };
  const subProps = {
    title: 'Reset Password',
    showButton: false,
    onPress,
    btnTxt: 'Cancel',
    btnColor: '#EC1A17',
  };

  const hideAlert = () => setShow(false);
  const showAlert = () => setShow(true);

  const reauthenticate = currentPassword => {
    var user = firebase.auth().currentUser;
    var cred = firebase.auth.EmailAuthProvider.credential(
      user.email,
      currentPassword,
    );
    return user.reauthenticateWithCredential(cred);
  };

  const changePassword = (currentPassword, newPassword) => {
    reauthenticate(currentPassword)
      .then(() => {
        var user = firebase.auth().currentUser;
        user
          .updatePassword(newPassword)
          .then(() => {
            console.log('Password updated!');
            ToastAndroid.show('Your password updated!', ToastAndroid.LONG);
            props.navigation.goBack();
          })
          .catch(error => {
            console.log(error);
          });
      })
      .catch(error => {
        console.log(error);
        if (error.code === 'auth/wrong-password') {
          setError(
            'The password is invalid or the user does not have a password. Please enter correct current password',
          );
        }
      });
  };

  const onChange = () => {
    if (state.currentPassword && state.newPassword)
      changePassword(state.currentPassword, state.newPassword);
  };

  return (
    <View>
      <Header {...subProps} />
      <ScrollView>
        <View style={styles.contianer}>
          <View style={{width: wp(90)}}>
            {/* <TextInput
              label="Username"
              value={state.email}
              style={styles.input}
              mode="outlined"
              selectionColor={'#1463A0'}
              underlineColor={'#1463A0'}
              right={
                <TextInput.Icon
                  name={() => <LockIcon name={'lock'} size={20} />}
                  onPress={showAlert}
                />
              }
              disabled
            /> */}

            {/* <TextInput
              label="Current Password"
              value={state.currentPassword}
              style={styles.input}
              mode="outlined"
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
              onChangeText={text => setState({...state, currentPassword: text})}
            /> */}
            {/* <TextInput
              label="New Password"
              value={state.newPassword}
              style={styles.input}
              mode="outlined"
              selectionColor={'#1463A0'}
              underlineColor={'#1463A0'}
              secureTextEntry={!showPassword}
              right={
                !showNewPassword ? (
                  <TextInput.Icon
                    name={() => <IconLock name={'eye'} size={20} />}
                    onPress={() => setShowNewPasswrod(true)}
                  />
                ) : (
                  <TextInput.Icon
                    name={() => <IconLock name={'eye-with-line'} size={20} />}
                    onPress={() => setShowNewPasswrod(false)}
                  />
                )
              }
              onChangeText={text => setState({...state, newPassword: text})}
            /> */}
            <Stack space={4} w="100%" safeArea>
              <Input
                InputRightElement={
                  <Icon
                    as={
                      <LockIcon name={'lock'} size={20} onPress={showAlert} />
                    }
                    size="md"
                    m={2}
                    color={useColorModeValue('black', 'gray.300')}
                  />
                }
                variant="outline"
                placeholder="User Name"
                placeholderTextColor={useColorModeValue(
                  'blueGray.400',
                  'blueGray.50',
                )}
                value={state.email}
                style={styles.input}
                isDisabled
              />

              <Input
                InputRightElement={
                  !showPassword ? (
                    <Icon
                      as={
                        <IconLock
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
                        <IconLock
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
                variant="outline"
                placeholder="Password"
                placeholderTextColor={useColorModeValue(
                  'blueGray.400',
                  'blueGray.50',
                )}
                value={state.currentPassword}
                onChangeText={text =>
                  setState({...state, currentPassword: text})
                }
              />

              <Input
                InputRightElement={
                  !showPassword ? (
                    <Icon
                      as={
                        <IconLock
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
                        <IconLock
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
                variant="outline"
                placeholder="New Password"
                placeholderTextColor={useColorModeValue(
                  'blueGray.400',
                  'blueGray.50',
                )}
                value={state.newPassword}
                onChangeText={text => setState({...state, newPassword: text})}
              />
            </Stack>
            <Text style={styles.error}>{error}</Text>
          </View>
          <View style={styles.btnContainer}>
            <TouchableOpacity style={styles.button} onPress={onChange}>
              <Text style={styles.btnTxt}>Change Password</Text>
            </TouchableOpacity>
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
    width: wp(90),
    // paddingHorizontal: 20,
    // backgroundColor: '#FFFFFF',
    // marginBottom: 10,
  },
  error: {
    paddingHorizontal: 10,
    color: 'red',
  },
});

export default ResetPasswordScreen;
