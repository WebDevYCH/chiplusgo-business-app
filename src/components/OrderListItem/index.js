import React from 'react';
import {View, StyleSheet, Text} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const OrderListItem = ({data, onPress}) => {
  return (
    <TouchableOpacity
      style={styles.tableItem}
      onPress={onPress ? ()=>onPress(data) : () => {}}>
         <View>
       
          <Text style={styles.itemTxt}>{data.ClientName}</Text>
      
      </View>
      <View>
        <Text style={styles.itemTitle}>{data.Title}</Text>

        <Text style={styles.itemDate}>{data.Create_date}</Text>
      </View>
     
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  tableItem: {
    height: hp(7),
    borderBottomWidth: 1,
    borderBottomColor: '#ACACAC',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemTitle: {
    color:'#000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  itemDate: {
    fontSize: 12,
    color: '#ACACAC',
  },
  itemTxt: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  itemRedTxt: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#EC1A17',
  },
});

export default OrderListItem;
