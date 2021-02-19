import React, {useState, useEffect} from 'react';
import {View, StyleSheet, Text, ScrollView} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import NumberFormat from 'react-number-format';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import * as Progress from 'react-native-progress';
import * as actions from '../Store/actions/type';
import {useSelector, useDispatch} from 'react-redux';
import Header from '../components/NavigationHeader';
import DollarIcon from 'react-native-vector-icons/FontAwesome';
import {TextInput} from 'react-native-paper';
import ListItem from '../components/WithdrawListItem';
import firestore from '@react-native-firebase/firestore';
import moment from 'moment';

const WidthdrawScreen = props => {
  const userData = useSelector(({user}) => user.user);
  const dispatch = useDispatch();

  const [error, setError] = useState('');
  const [state, setState] = useState({
    amount: '',
    businessBalance: 0,
    transactionHistory: null,
  });

  useEffect(() => {
    var data = [];
    firestore()
      .collection('Business')
      .doc(userData.businessId)
      .get()
      .then(documentSnapshot => {
        if (documentSnapshot.exists) {
          dispatch({
            type: actions.SET_BUSINESS_DATA,
            payload: documentSnapshot.data(),
          });
          firestore()
            .collection('Withdraw')
            .doc(documentSnapshot.id)
            .collection('Withdraw')
            .orderBy('Create_date', 'desc')
            .get()
            .then(snapData => {
              firestore()
                .collection('TranscationHistory')
                .doc(userData.uid)
                .collection('TransactionHistory')
                .where('Type', '==', 'Withdraw')
                .get()
                .then(tranSnap => {
                  var date = '';
                  tranSnap.forEach(element => {
                    var date1 = new Date(element.data().Create_date.toDate());
                    date = moment(date1).format('MM/DD/YYYY, h:mm:ss a');
                    data.push({
                      ...element.data(),
                      Create_date: date,
                      active: 'Approved',
                    });
                  });
                  snapData.forEach(element => {
                    var date1 = new Date(element.data().Create_date.toDate());
                    date = moment(date1).format('MM/DD/YYYY, h:mm:ss a');
                    data.push({
                      ...element.data(),
                      Create_date: date,
                      active: 'Pending',
                    });
                  });
                  setState({
                    ...state,
                    businessBalance: documentSnapshot.data()
                      .Business_account_balance,
                    transactionHistory: data,
                  });
                });
            });
        }
      });
  }, [userData]);

  const onPress = () => {
    props.navigation.goBack();
  };
  const subProps = {
    title: 'Select Amount',
    showButton: true,
    onPress,
    onPressBtn: onPress,
    btnTxt: 'Cancel',
    btnColor: '#EC1A17',
  };

  const setValue = text => {
    if (text.length > state.amount.length) {
      if (text.includes('.')) {
        setState({
          ...state,
          amount: String(
            parseFloat((parseFloat(text) * 1000) / 100).toFixed(2),
          ),
        });
      } else {
        setState({
          ...state,
          amount: String(parseFloat(parseFloat(text) / 100).toFixed(2)),
        });
      }
    } else {
      if (text.includes('.')) {
        setState({
          ...state,
          amount: String(parseFloat((parseFloat(text) * 10) / 100).toFixed(2)),
        });
      } else {
        setState({
          ...state,
          amount: String(parseFloat(parseFloat(text) / 100).toFixed(2)),
        });
      }
    }
  };

  const goCardForm = () => {
    if (
      state.amount &&
      parseFloat(state.businessBalance) - parseFloat(state.amount) > 0
    ) {
      dispatch({type: 'SET_DATA', payload: {withdraw: {amount: state.amount}}});
      props.navigation.navigate('CardForm');
    }
  };

  if (!state.transactionHistory) {
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
    <View>
      <Header {...subProps} />
      <View style={styles.contianer}>
        <View>
          <TextInput
            label="Withdraw Amount"
            value={state.amount}
            style={styles.input}
            mode="outlined"
            selectionColor={'#1463A0'}
            underlineColor={'#1463A0'}
            keyboardType="numeric"
            left={
              <TextInput.Icon
                name={() => <DollarIcon name={'dollar'} size={20} />}
              />
            }
            onChangeText={text => setValue(text)}
          />

          <NumberFormat
            value={state.businessBalance}
            displayType={'text'}
            thousandSeparator={true}
            decimalScale={2}
            prefix="Balance: $"
            renderText={value => <Text style={styles.error}>{value}</Text>}
          />
        </View>
        <View style={styles.btnContainer}>
          <TouchableOpacity
            style={
              state.amount &&
              parseFloat(state.businessBalance) - parseFloat(state.amount) > 0
                ? styles.button
                : styles.disableButton
            }
            onPress={goCardForm}>
            <Text style={styles.btnTxt}>Continue</Text>
          </TouchableOpacity>
        </View>
        <ScrollView>
          {state.transactionHistory.map((item, index) => {
            return <ListItem key={index} data={item} />;
          })}
        </ScrollView>
      </View>
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
  disableButton: {
    width: wp(90),
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
    width: wp(100),
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    marginBottom: 10,
  },
  error: {
    paddingHorizontal: wp(5),
    //   color:'red'
  },
});

export default WidthdrawScreen;
