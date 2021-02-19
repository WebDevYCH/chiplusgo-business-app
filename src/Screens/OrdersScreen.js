import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  ToastAndroid,
  Image,
  PermissionsAndroid,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Mailer from 'react-native-mail';
import storage from '@react-native-firebase/storage';
import Header from '../components/HomeHeader';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {useSelector, useDispatch} from 'react-redux';
import firestore from '@react-native-firebase/firestore';
import * as Progress from 'react-native-progress';
import moment from 'moment';
import ListItem from '../components/OrderListItem';
import ListDate from '../components/ListDate';
import Filter from '../components/OrderFilter';
import * as actions from '../Store/actions/type';
import MenuDrawer from 'react-native-side-drawer';
import {ADMIN_ROLE} from '../utiles';
import RNFetchBlob from 'rn-fetch-blob';
import RNFS from 'react-native-fs';
import {Emails} from '../api';

const Transaction = props => {
  const userData = useSelector(store => store.user.user);
  const filterData = useSelector(store => store.filter);
  const role = useSelector(({user}) => user.role);
  const dispatch = useDispatch();
  const [state, setState] = useState({
    data: [],
    orderTimeFilter: filterData.orderTimeFilter,
    orderTypeFilter: filterData.orderTypeFilter,
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
    const subscriber = firestore()
      .collection('Orders')
      .doc('Orders')
      .collection(String(userData.businessId))
      .where(
        'Create_date',
        '>=',
        filterData.orderTimeFilter === 'all'
          ? new Date('1990-05-14T01:57:40.000Z')
          : filterData.orderTimeFilter === 'daily'
          ? new Date(new Date().setDate(new Date().getDate() - 1))
          : filterData.orderTimeFilter === 'weekly'
          ? new Date(new Date().setDate(new Date().getDate() - 7))
          : new Date(new Date().setDate(new Date().getDate() - 30)),
      )
      .orderBy('Create_date', 'desc')
      .onSnapshot(async documentSnapshot => {
        const snapData = documentSnapshot._docs;
        let data = [];
        console.log(snapData);
        snapData.map(item => {
          if (Object.keys(item).includes('_data')) {
            var date = '';
            if (Object.keys(item._data).includes('Create_date')) {
              var date1 = new Date(item._data.Create_date.toDate());
              date = moment(date1).format('MM/DD/YYYY, h:mm:ss a');
            }
            if (role === ADMIN_ROLE) {
              data.push({...item._data, Create_date: date});
            } else {
              if (item.data().SubaccountId === userData.uid) {
                data.push({...item._data, Create_date: date});
              }
            }
          }
        });

        setState({
          ...state,

          data,
        });
      });
    return () => subscriber();
  }, [userData, filterData]);

  const drawerContent = () => {
    return (
      <Filter
        timeFilter={filterData.orderTimeFilter}
        typeFilter={filterData.orderTypeFilter}
        onPress={toggleOpen}
      />
    );
  };

  const goDetail = selectedData => {
    dispatch({
      type: actions.SET_SELECTED_ORDER_ITEM,
      payload: {...selectedData},
    });
    console.log(props.navigation);
    props.navigation.navigate('OrderDetail');
  };

  const download = () => {
    const headerString =
      'Order Id,Business Id,Business Name,Client Id,Client Name,Create Date,Title,Price,Origin Price, Tax,Subtotal,Item\n';
    const dataString = state.data
      .map(
        item =>
          `${item.OrderId},${item.BusinessId},${item.BusinessName},${item.ClientId},${
            item.ClientName
          },${item.Create_date},${item.Title},${item.Price},${
            item.Original_price
          },${item.Tax}, ${item.Subtotal}, ${item.Item.map(
            i => i.Item + ',',
          )}\n`,
      )
      .join('');
    const csvString = `${headerString}${dataString}`;
    const fileName = `${
      moment(new Date()).format('YYYY-MM-DD HH-MM-SS') +
      userData.displayName +
      '(Orders)'
    }.csv`;
    const pathToWrite = `${RNFetchBlob.fs.dirs.DownloadDir}/${fileName}`;

    RNFS.writeFile(pathToWrite, csvString, 'utf8')
      .then(success => {
        console.log('FILE WRITTEN!');
        const reference = storage().ref(`csvFiles/${fileName}`);
      const pathToFile = pathToWrite;
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
            subject: 'Order History',
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
        
      })
      .catch(err => {
        console.log('------------------------', err);
        ToastAndroid.show(
          'Failed download please try again',
          ToastAndroid.SHORT,
        );
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
          title="Orders"
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
