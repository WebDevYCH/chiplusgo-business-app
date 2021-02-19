import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import firestore from '@react-native-firebase/firestore';
import PushNotification from 'react-native-push-notification';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {QRCodeScanImg, QRCodeImg} from '../assets/images';
import ListItem from '../components/ListItem';
import {useSelector, useDispatch} from 'react-redux';
import * as actions from '../Store/actions/type';
import * as Progress from 'react-native-progress';
import {ADMIN_ROLE} from '../utiles';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import NumberFormat from 'react-number-format';

var count = 0;
const QRGenerateScreen = props => {
  const userData = useSelector(store => store.user.user);
  const role = useSelector(({user}) => user.role);
  // const count = useSelector(({data})=>data.count)
  const dispatch = useDispatch();
  const businessId = useSelector(({user}) => user.user.businessId);
  // console.log('--------------------------------', count);

  const [state, setState] = useState({
    balance: 0,
    data: [],
    count: 0,
    businessInfo: {},
  });

  PushNotification.configure({
    onRegister: function (token) {
      console.log('TOKEN:', token);
    },
    onNotification: function (notification) {
      goDetail(notification.data);
      // notification.finish(PushNotificationIOS.FetchResult.NoData);
    },
    permissions: {
      alert: true,
      badge: true,
      sound: true,
    },
    popInitialNotification: true,
    requestPermissions: true,
  });

  useEffect(() => {
    // if (userData.businessId) {
    console.log(userData.businessId);
    const subscriber = firestore()
      .collection('TranscationHistory')
      .doc(String(userData.businessId))
      .collection('TransactionHistory')
      .where(
        'Create_date',
        '>=',
        new Date(new Date().setDate(new Date().getDate() - 7)),
      )
      .orderBy('Create_date', 'desc')
      .onSnapshot(async documentSnapshot => {
        const businessData = await firestore()
          .collection('Business')
          .doc(String(userData.businessId))
          .get();
        let balance = parseFloat(businessData._data.Business_account_balance);
        let data = [];
        var index = 0;
        var notifiItem = {};
        count = 0
        console.log('=============================================')
        documentSnapshot.docChanges().forEach(change => {
          if (change.type === 'added') {
            console.log('------------------------------')
            count+=1
            notifiItem = change.doc.data();
          }
          // if (change.type === 'modified') {
          //   notifiItem = change.doc.data();
          // }
          if (change.type === 'removed') {
          }
        });
        console.log('----------------ddddddddddddddddddddd--------------', count)
        documentSnapshot.forEach(item => {
          var date = '';
          if (Object.keys(item.data()).includes('Create_date')) {
            var date1 = new Date(item.data().Create_date.toDate());
            date = moment(date1).format('MM/DD/YYYY, h:mm:ss a');
          }
          if (role === ADMIN_ROLE && item.data().Type !== 'Purchase') {
            data.push({
              ...item.data(),
              Create_date: date,
              id: item.id,
              Date: date1,
            });
          } else {
            if (
              item.data().SubaccountId === userData.uid &&
              item.data().Type !== 'Purchase'
            ) {
              data.push({
                ...item.data(),
                Create_date: date,
                id: item.id,
                Date: date1,
              });
            }
          }
        });
        console.log('----------------FiNAL count--------------', count)
        if (role === ADMIN_ROLE && notifiItem.Type !== 'Purchase') {
          if (count === 1 && data.length > 0) {
            sendNotification(notifiItem);
          }
        } else {
          if (count === 1 && data.length > 0) {
            if (
              notifiItem.SubaccountId === userData.uid &&
              notifiItem.Type !== 'Purchase'
            ) {
              sendNotification(notifiItem);
            }
          }
        }

        count = 1;
        getBusinessInfo(userData.businessId, balance, data);
      });
    return () => subscriber();
  }, [userData]);

  const getBusinessInfo = async (businessId, balance, data) => {
    firestore()
      .collection('Business')
      .doc(String(businessId))
      .get()
      .then(documentSnapshot => {
        if (documentSnapshot.exists) {
          setState({
            ...state,
            balance,
            data,
            count: 1,
            businessInfo: documentSnapshot.data(),
          });
          dispatch({
            type: actions.SET_BUSINESS_DATA,
            payload: documentSnapshot.data(),
          });
        }
      });
  };

  const sendNotification = notifiItem => {
    var date1 = new Date(notifiItem.Create_date.toDate());
    var date = moment(date1).format('MM/DD/YYYY, h:mm:ss a');

    var message =
      notifiItem.Type === 'Refund'
        ? `Refund $${notifiItem.Subtotal} to ${notifiItem.ClientName}`
        : `${notifiItem.ClientName} paid $${notifiItem.Subtotal}`;
    PushNotification.localNotification({
      channelId: 'chiplusgo',
      title: 'Chi+Go Notification',
      message: message,
      playSound: true,
      soundName: 'default',
      actions: '["Yes", "No"]',
      data: {...notifiItem, Create_date: date, id: notifiItem.Id, Date: date1},
    });
  };

  const goDetail = selectedData => {
    dispatch({
      type: actions.SET_SELECTED_TRANSACTION_ITEM,
      payload: {...selectedData},
    });
    props.navigation.navigate('TransactionDetail');
  };

  if (Object.keys(state.businessInfo).length === 0) {
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
      <View style={styles.subContainer}>
        {role === ADMIN_ROLE ? (
          <Text
            style={
              styles.titleFont
            }>{`Hello, ${state.businessInfo.Business_name.English}`}</Text>
        ) : (
          <Text
            style={
              styles.titleFont
            }>{`Hello, ${state.businessInfo.Business_name.English} - ${userData.subAccount.Nick_name}`}</Text>
        )}

        {role === ADMIN_ROLE && (
          <>
              <NumberFormat
                value={parseFloat(state.balance)}
                displayType={'text'}
                thousandSeparator={true}
                decimalScale={2}
                prefix="$"
                renderText={value => <Text style={styles.balanceFont}>{value}</Text>}
              />

            <Text style={styles.smallfont}>CHI + GO Balance</Text>
          </>
        )}

        <View style={styles.QRSection}>
          <TouchableOpacity
            style={styles.scanButtonContainer}
            onPress={() => props.navigation.navigate('QRScan')}>
            <Image source={QRCodeScanImg} />
            <Text style={styles.scanBtnText}>Scan to Redeem</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.scanButtonContainer}
            onPress={() => props.navigation.navigate('QR')}>
            <Image source={QRCodeImg} />
            <Text style={styles.scanBtnText}>Show to Request</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.historyContainer}>
          <View style={styles.title}>
            <Text style={styles.historyTitle}>Recent Activity</Text>
            <TouchableOpacity>
              <Text
                style={styles.titleLink}
                onPress={() => props.jumpTo('transaction')}>
                View All >
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView>
            {state.data.map((item, index) => {
              return <ListItem key={index} data={item} onPress={goDetail} />;
            })}
          </ScrollView>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: hp(90),
    width: wp(100),
    backgroundColor: '#FFFFFF',
  },
  subContainer: {
    height: hp(90),
    width: wp(100),
    paddingTop: hp(5),
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },
  balanceFont: {
    fontSize: 48,
  },
  titleFont: {
    fontSize: 16,
    lineHeight: 40,
  },
  smallFont: {
    fontSize: 12,
    lineHeight: 40,
  },
  scanBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  QRSection: {
    width: wp(90),
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  QRBtnSection: {
    width: wp(90),
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  scanButtonContainer: {
    height: hp(12),
    width: wp(42.5),
    paddingVertical: hp(1),
    backgroundColor: '#1463A0',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  historyContainer: {
    height: hp(50),
    width: wp(90),
    paddingBottom: hp(3),
  },
  title: {
    height: hp(7),
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: 10,
  },
  titleLink: {
    color: '#1463A0',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default QRGenerateScreen;
