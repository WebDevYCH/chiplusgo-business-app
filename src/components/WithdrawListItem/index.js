import React from 'react';
import {View, StyleSheet, Text} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import NumberFormat from 'react-number-format';

const ListItem = ({data, onPress}) => {
  return (
    <TouchableOpacity
      style={styles.tableItem}
      onPress={onPress ? () => onPress(data) : () => {}}>
      <View>
        <Text style={styles.itemTitle}>{`${data.Type} (${data.active})`}</Text>

        <Text style={styles.itemDate}>{data.Create_date}</Text>
      </View>
      <View>
        <NumberFormat
          value={data.Subtotal}
          displayType={'text'}
          thousandSeparator={true}
          decimalScale={2}
          prefix="-$"
          renderText={value => <Text style={styles.itemRedTxt}>{value}</Text>}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  tableItem: {
    height: hp(7),
    width: wp(90),
    borderBottomWidth: 1,
    borderBottomColor: '#ACACAC',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemTitle: {
    fontSize: 14,
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
