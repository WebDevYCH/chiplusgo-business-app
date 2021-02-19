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
import {useSelector, useDispatch} from 'react-redux';
import Header from '../components/NavigationHeader';
import DollarIcon from 'react-native-vector-icons/FontAwesome';
import {TextInput} from 'react-native-paper';
import IconLock from 'react-native-vector-icons/Entypo';
import firebase from '@react-native-firebase/app';
import TextInputMask from 'react-native-text-input-mask';
import CurrencyInput from '../components/CurrencyInput';

const AddressFromScreen = props => {
  const withdrawData = useSelector(({data}) => data.withdraw);
  console.log(withdrawData);
  const dispatch = useDispatch();

  useEffect(() => {}, []);

  const [error, setError] = useState('');
  const [state, setState] = useState({
    amount: 0,
    addressOne: '',
    addressTwo: '',
    city: '',
    state: '',
    zipCode: '',
    addressOneValidation: false,
    cityValidation: false,
    stateValidation: false,
    zipCodeValidation: false,
  });

  const onPress = () => {
    props.navigation.goBack();
  };
  const subProps = {
    title: 'Billing Address',
    showButton: true,
    onPress,
    onPressBtn: onPress,
    btnTxt: 'Cancel',
    btnColor: '#EC1A17',
  };

  const checkValue = () => {
    if (
      !state.addressOneValidation &&
      state.addressOne &&
      state.city &&
      !state.cityValidation &&
      state.state &&
      !state.stateValidation &&
      state.zipCode &&
      !state.zipCodeValidation
    ) {
      return true;
    }
    return false;
  };

  const validation = () => {
    if (
      !state.addressOneValidation &&
      state.addressOne &&
      state.city &&
      !state.cityValidation &&
      state.state &&
      !state.stateValidation &&
      state.zipCode &&
      !state.zipCodeValidation
    ) {
      return true;
    }
    setState({
      ...state,
      addressOneValidation: state.addressOne ? false : true,
      cityValidation: state.city ? false : true,
      stateValidation: state.state ? false : true,
      zipCodeValidation: state.zipCode ? false : true,
    });
    return false;
  };

  const setValue = (id, text) => {
    if (text) {
      setState({...state, [id]: text, [`${id}Validation`]: false});
    } else {
      setState({...state, [id]: text, [`${id}Validation`]: true});
    }
  };

  const sendRequest = () => {
    if (validation()) {
      dispatch({
        type: 'SET_DATA',
        payload: {
          withdraw: {
            ...withdrawData,
            addressOne:state.addressOne,
            addressTwo:state.addressTwo,
            city:state.city,
            state:state.state,
            zipCode:state.zipCode,
          },
        },
      });
      props.navigation.navigate('ReviewWithdraw')
    }
  };

  return (
    <View>
      <Header {...subProps} />
      <ScrollView>
        <View style={styles.contianer}>
          <TextInput
            label="Address Line 1"
            value={state.addressOne}
            style={styles.input}
            mode="outlined"
            selectionColor={'#1463A0'}
            underlineColor={'#1463A0'}
            onChangeText={text => setValue('addressOne', text)}
            error={state.addressOneValidation}
          />
          <TextInput
            label="Address Line 2 (optional)"
            value={state.addressTwo}
            style={styles.input}
            mode="outlined"
            selectionColor={'#1463A0'}
            underlineColor={'#1463A0'}
            onChangeText={text => setValue('addressTwo', text)}
          />
          <TextInput
            label="City"
            value={state.city}
            style={styles.input}
            mode="outlined"
            selectionColor={'#1463A0'}
            underlineColor={'#1463A0'}
            onChangeText={text => setValue('city', text)}
            error={state.cityValidation}
          />
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <TextInput
              label="State"
              value={state.state}
              style={styles.halfInput}
              mode="outlined"
              selectionColor={'#1463A0'}
              underlineColor={'#1463A0'}
              onChangeText={text => setValue('state', text)}
              error={state.stateValidation}
            />
            <TextInput
              label="Zip Code"
              value={state.zipCode}
              style={styles.halfInput}
              mode="outlined"
              selectionColor={'#1463A0'}
              underlineColor={'#1463A0'}
              keyboardType="numeric"
              onChangeText={text => setValue('zipCode', text)}
              error={state.zipCodeValidation}
            />
          </View>

          <View style={styles.btnContainer}>
            <TouchableOpacity
              style={checkValue() ? styles.button : styles.disableButton}
              onPress={sendRequest}>
              <Text style={styles.btnTxt}>Continue</Text>
            </TouchableOpacity>
          </View>
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
    width: wp(85),
    height: hp(7),
    backgroundColor: '#1463A0',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disableButton: {
    width: wp(85),
    height: hp(7),
    backgroundColor: '#ACACAC',
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
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
    marginBottom: 10,
  },
  halfInput: {
    width: wp(45),
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
    marginBottom: 10,
  },
  error: {
    paddingHorizontal: wp(5),
    //   color:'red'
  },
});

export default AddressFromScreen;
