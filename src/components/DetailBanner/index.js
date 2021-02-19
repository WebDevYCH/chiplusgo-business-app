import React from 'react';
import {View, Image, Text, StyleSheet} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/AntDesign';

const DetailBanner = ({Avatar, Name, Title}) => {
  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        {Avatar?
        <Image source={{uri:Avatar}}/>
        :
        <Icon name="user" size={70} />
        }
        
      </View>
      <Text style={styles.name}>{Name}</Text>
      <Text style={styles.title}>{Title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: hp(25),
    backgroundColor: '#F1F2F4',
    width: wp(100),
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: hp(10),
    height: hp(10),
    borderRadius: hp(10),
    backgroundColor: 'gray',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name:{
      fontSize:20
  },
  title:{
      fontSize:14,
      color:'#ACACAC'
  }
});

export default DetailBanner;
