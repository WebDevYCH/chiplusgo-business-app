import React from 'react';
import {View, StyleSheet, Text} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const ListItem = ({date}) => {
  return (
    <View style={styles.tableItem}>
      <View>
        <Text style={styles.itemTitle}>{date.split(',')[0]}</Text>
      </View>
    </View>
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
    fontSize: 20,
    fontWeight: 'bold',
  },
  itemDate: {
    fontSize: 12,
    color: '#ACACAC',
  },
  itemGreenTxt: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2FA014',
  },
  itemRedTxt: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#EC1A17',
  },
});

export default ListItem;
