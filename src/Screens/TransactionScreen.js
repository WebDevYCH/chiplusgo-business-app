import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  ToastAndroid,
  PermissionsAndroid,
  Alert,
  Image,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import storage from '@react-native-firebase/storage';
import Mailer from 'react-native-mail';
import Header from '../components/HomeHeader';
import RNFetchBlob from 'rn-fetch-blob';
import RNFS from 'react-native-fs';
import {useSelector, useDispatch} from 'react-redux';
import firestore from '@react-native-firebase/firestore';
import moment from 'moment';
import ListItem from '../components/ListItem';
import ListDate from '../components/ListDate';
import Filter from '../components/Filter';
import * as actions from '../Store/actions/type';
import MenuDrawer from 'react-native-side-drawer';
import {ADMIN_ROLE} from '../utiles';
import {Emails} from '../api';

const Transaction = props => {
  const userData = useSelector(store => store.user.user);
  console.log(userData.email);
  const filterData = useSelector(store => store.filter);
  const role = useSelector(({user}) => user.role);
  const dispatch = useDispatch();
  const [state, setState] = useState({
    data: [],
    transactionTimeFilter: filterData.transactionTimeFilter,
    transactionTypeFilter: filterData.transactionTypeFilter,
    open: false,
  });
  let previousItem = {};

  const toggleOpen = () => {
    setState({...state, open: !state.open});
  };

  async function hasAndroidPermission() {
    const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;

    const hasPermission = await PermissionsAndroid.check(permission);
    if (hasPermission) {
      return true;
    }

    const status = await PermissionsAndroid.request(permission);
    return status === 'granted';
  }

  useEffect(() => {
    hasAndroidPermission();
    firestore()
      .collection('TranscationHistory')
      .doc(String(userData.businessId))
      .collection('TransactionHistory')
      .where(
        'Create_date',
        '>=',
        filterData.transactionTimeFilter === 'all'
          ? new Date('2020-05-14T01:57:40.000Z')
          : filterData.transactionTimeFilter === 'daily'
          ? new Date(new Date().setDate(new Date().getDate() - 1))
          : filterData.transactionTimeFilter === 'weekly'
          ? new Date(new Date().setDate(new Date().getDate() - 7))
          : new Date(new Date().setDate(new Date().getDate() - 30)),
      )
      .where(
        'Type',
        'in',
        filterData.transactionTypeFilter === 'all'
          ? ['Pay', 'Refund', 'Withdraw']
          : filterData.transactionTypeFilter === 'directpay'
          ? ['Pay']
          : filterData.transactionTypeFilter === 'refund'
          ? ['Refund']
          : ['Withdraw'],
      )
      .orderBy('Create_date', 'desc')
      .get()
      .then(async documentSnapshot => {
        let data = [];
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

        setState({
          ...state,

          data,
        });
      });
  }, [userData, filterData]);

  const drawerContent = () => {
    return (
      <Filter
        timeFilter={filterData.transactionTimeFilter}
        typeFilter={filterData.transactionTypeFilter}
        onPress={toggleOpen}
      />
    );
  };

  const goDetail = selectedData => {
    dispatch({
      type: actions.SET_SELECTED_TRANSACTION_ITEM,
      payload: {...selectedData},
    });
    console.log(props.navigation);
    props.navigation.navigate('TransactionDetail');
  };

  const download = () => {
    const headerString =
      'Transaction Id,Business Id,Business Name, Client Id,Client Name,Create Date,Title,Type,Earned Point,Chared Cash,Used CreditLine balance,Used Point,Final Cash Balance,Final Credit Balance,Final Point Balance,Subtotal,Note\n';
    const dataString = state.data
      .map(
        item =>
          `${item.Id},${item.BusinessId},${item.BusinessName},${item.ClientId},${
            item.ClientName
          },${item.Create_date?.replace(',', '')},${item.Title || ''},${
            item.Type || ''
          },${item.Earned_point || ''},${item.Charged_cash || ''},${
            item.Used_creditLine_balance || ''
          },${item.Used_point || ''},${item.Final_cash_balance || ''},${
            item.Final_credit_balance || ''
          },${item.Final_point_balance || ''},${item.Used_point || ''},${
            item.Note?.replace(/(\r\n|\n|\r)/gm, ' ') || ''
          }\n`,
      )
      .join('');
    const csvString = `${headerString}${dataString}`;
    // var path = RNFS.DocumentDirectoryPath + '/test.csv';
    const fileName = `${
      moment(new Date()).format('YYYY-MM-DD HH-MM-SS ') +
      userData.displayName +
      '(Transaction history)'
    }.csv`;
    const path = `${RNFetchBlob.fs.dirs.DownloadDir}/${fileName}`;

    RNFS.writeFile(path, csvString, 'utf8').then(success => {
      console.log('FILE WRITTEN!');
      
      const reference = storage().ref(`csvFiles/${fileName}`);
      const pathToFile = path;
      const task = reference.putFile(pathToFile);
      task.on('state_changed', taskSnapshot => {
        console.log(
          `${taskSnapshot.bytesTransferred} transferred out of ${taskSnapshot.totalBytes}`,
        );
      });
      task.then(async () => {
        const url = await storage()
          .ref(`csvFiles/${fileName}`)
          .getDownloadURL();
        Emails.sendEmail({
          option: {
            from: 'CHI + GO: <noreply@firebase.com>',
            to: userData.email,
            subject: 'Transaction History',
            attachments:[{
              filename: fileName,
              path: url
            }]
          },
        }).then(res => {
             ToastAndroid.show(
          'Sent the CSV file to your email. Please check your email.',
          ToastAndroid.LONG,
        );
        })
        .catch(error => {
          console.log(error);
        });
       
      })

      //   Mailer.mail({
      //     subject: 'CHI+GO: Transacion History',
      //     recipients: [userData.email],
      //     // ccRecipients: [userData.email],
      //     // bccRecipients: [userData.email],
      //     attachments: [{
      //       path: path,
      //     }]
      //   }, (error, event) => {
      //     console.log(error)
      //     Alert.alert(
      //       error,
      //       event,
      //       [
      //         {text: 'Ok', onPress: () => console.log('OK: Email Error Response')},
      //         {text: 'Cancel', onPress: () => console.log('CANCEL: Email Error Response')}
      //       ],
      //       { cancelable: true }
      //     )
      //   });
      // })
      // .catch(err => {
      //   console.log('------------------------', err);
      //   ToastAndroid.show(
      //     'Failed download please try again',
      //     ToastAndroid.SHORT,
      //   );
    });
  };

  return (
    <View style={styles.container}>
      <MenuDrawer
        open={state.open}
        drawerContent={drawerContent()}
        drawerPercentage={80}
        animationTime={250}
        overlay={true}
        opacity={0.1}
        position="right">
        <Header
          title="Transactions"
          linkText="Filter"
          download={true}
          onDownload={download}
          navigation={props.navigation}
          onPress={toggleOpen}
        />
        <View style={styles.subContainer}>
          <ScrollView>
            {state.data.map((item, index) => {
              if (
                Object.keys(previousItem).length === 0 ||
                (Object.keys(previousItem).length > 0 &&
                  previousItem.Create_date.split(',')[0] !==
                    item.Create_date.split(',')[0])
              ) {
                previousItem = {...item};

                return (
                  <View key={index}>
                    <ListDate date={item.Create_date} />
                    <ListItem key={index} data={item} onPress={goDetail} />
                  </View>
                );
              } else {
                return <ListItem key={index} data={item} onPress={goDetail} />;
              }
            })}
          </ScrollView>
        </View>
      </MenuDrawer>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: hp(90),
    width: wp(100),
    display: 'flex',
    backgroundColor: '#FFF',
  },
  animatedBox: {
    flex: 1,
    backgroundColor: '#38C8EC',
    padding: 10,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F04812',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },
  subContainer: {
    height: hp(80),
    width: wp(90),
    marginLeft: wp(5),
  },

  header: {
    flex: 0.1,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#ACACAC',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    padding: 10,
  },
  drawerBtnTxt: {
    fontSize: 14,
    color: '#1463A0',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#FFF',
  },
});

export default Transaction;
