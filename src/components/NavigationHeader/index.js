import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/Ionicons';

const NavigationHeader = ({title, showButton, onPress, btnTxt, btnColor, onPressBtn}) => {
  return (
    <View style={styles.container}>
      <View style={styles.back}>
        <TouchableOpacity style={styles.back} onPress={onPress}>
          <Icon name="chevron-back" size={30}></Icon>
        </TouchableOpacity>
        <Text style={styles.time}>{title}</Text>
      </View>
      {showButton && (
        <TouchableOpacity onPress={onPressBtn}>
          <Text style={{color: btnColor}}>{btnTxt}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: hp(10),
    paddingHorizontal: wp(5),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: '#ACACAC',
    backgroundColor: '#FFF',
  },
  time: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  back: {
    alignItems: 'center',
    flexDirection: 'row',
  },
});

export default NavigationHeader;
