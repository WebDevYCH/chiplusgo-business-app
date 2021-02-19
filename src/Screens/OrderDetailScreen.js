import React, {useState, useEffect} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {useSelector} from 'react-redux';
import firestore from '@react-native-firebase/firestore';
import * as Progress from 'react-native-progress';

import DetailHeader from './../components/DetailHeader/index';

const OrderDetailScreen = props => {
  const selectedOrderItem = useSelector(({data}) => data.selectedOrderItem);

  const [businessData, setBusinessData] = useState({});

  useEffect(() => {
    if (selectedOrderItem.ClientId) {
      firestore()
        .collection('Business')
        .doc(selectedOrderItem.BusinessId)
        .get()
        .then(documentSnapshot => {
          console.log('User exists: ', documentSnapshot.exists);

          if (documentSnapshot.exists) {
            setBusinessData(documentSnapshot.data());
          }
        });
    }
  }, [selectedOrderItem]);

  if (Object.keys(businessData).length === 0) {
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
      <DetailHeader dateTime={selectedOrderItem.Create_date} {...props} />
      <View style={styles.orderSectionContainer}>
        <View style={styles.listContainer}>
          <Text style={styles.title}>Order Info</Text>
          <View style={styles.list}>
            <Text style={styles.listTxt}>Activity Number :</Text>
            <Text style={styles.listTxt}>
              {selectedOrderItem.OrderId.slice(
                selectedOrderItem.OrderId.length - 8,
                selectedOrderItem.OrderId.length,
              )}
            </Text>
          </View>
          <View style={styles.list}>
            <Text style={styles.listTxt}>Redeemed Date :</Text>
            <Text style={styles.listTxt}>{selectedOrderItem.Create_date.split(',')[0]}</Text>
          </View>
          <View style={styles.list}>
            <Text style={styles.listTxt}>Deal Name :</Text>
            <Text style={styles.listTxt}>{selectedOrderItem.Title}</Text>
          </View>
          <View style={styles.list}>
            <Text style={styles.listTxt}>Customer Name :</Text>
            <Text style={styles.listTxt}>{selectedOrderItem.ClientName}</Text>
          </View>
          <View style={styles.list}>
            <Text style={styles.listTxt}>Source Account :</Text>
            <Text style={styles.listTxt}>{businessData.Business_name.English}</Text>
          </View>
        </View>
      </View>
      <View style={styles.dealSectionContainer}>
        <View style={styles.listContainer}>
          <Text style={styles.title}>Deal Info</Text>
          {selectedOrderItem.Item.map((item, index)=>(
            <View style={styles.colList} key={index}>
            {/* <Text style={styles.listTitle}>Entrees</Text> */}
            <Text style={styles.listTxt}>{item.Item}</Text>
          </View>
          ))}
          
         
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: hp(100),
    width: wp(100),
    backgroundColor: '#FFF',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },
  orderSectionContainer: {
    padding: wp(5),
    borderBottomColor: '#ACACAC',
    borderBottomWidth: 1,
  },
  dealSectionContainer: {
    padding: wp(5),
  },
  listContainer: {
    width: wp(90),
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  list: {
    width: wp(90),
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  colList: {
    width: wp(90),
    paddingVertical: 10,
  },
  listTitle: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  listTxt: {
    lineHeight: 13,
    color: '#000',
    fontSize: 14,
  },
});

export default OrderDetailScreen;
