import React from 'react';
import {View, StyleSheet, Text, TouchableOpacity} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Header = props => {
  const onclick = () => {
    props.onPress();
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{props.title}</Text>
      {props.download && (
        <TouchableOpacity onPress={props.onDownload}>
          <Icon name="file-download" size={25} color="#1463A0" />
          <Text style={styles.linkText}>CSV</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={onclick}>
        <Text style={styles.linkText}>{props.linkText}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: hp(10),
    width: wp(100),
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    paddingBottom: hp(0.5),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(5),
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  linkText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1463A0',
  },
});

export default Header;
