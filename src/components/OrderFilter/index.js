import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import {color} from 'react-native-reanimated';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {useDispatch} from 'react-redux';
import * as actions from '../../Store/actions/type';

const DrawerContent = ({timeFilter, typeFilter, onPress}) => {
  const dispatch = useDispatch();
  const setTimeFilter = data => {
    dispatch({type: actions.SET_ORDER_TIME_FILTER, payload: data});
  };
  const setTypeFilter = data => {
    dispatch({type: actions.SET_ORDER_TYPE_FILTER, payload: data});
  };
  const reset = () => {
    setTimeFilter('all');
    setTypeFilter('all');
    onPress();
  };
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={reset}>
          <Text style={styles.drawerBtnTxt}>Reset</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onPress()}>
          <Text style={styles.drawerBtnTxt}>Apply</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.contentContainer}>
        <View>
          <Text style={styles.filterTitle}>Time</Text>
          <View style={styles.filterWrapper}>
            <View style={styles.filterContainer}>
              <TouchableOpacity
                style={
                  timeFilter === 'all'
                    ? styles.selectedFilterItem
                    : styles.filterItem
                }
                onPress={() => setTimeFilter('all')}>
                <Text
                  style={
                    timeFilter === 'all'
                      ? styles.selectedFilterTxt
                      : styles.filterTxt
                  }>
                  All
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={
                  timeFilter === 'daily'
                    ? styles.selectedFilterItem
                    : styles.filterItem
                }
                onPress={() => setTimeFilter('daily')}>
                <Text
                  style={
                    timeFilter === 'daily'
                      ? styles.selectedFilterTxt
                      : styles.filterTxt
                  }>
                  Daily
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={
                  timeFilter === 'weekly'
                    ? styles.selectedFilterItem
                    : styles.filterItem
                }
                onPress={() => setTimeFilter('weekly')}>
                <Text
                  style={
                    timeFilter === 'weekly'
                      ? styles.selectedFilterTxt
                      : styles.filterTxt
                  }>
                  Weekly
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={
                  timeFilter === 'monthly'
                    ? styles.selectedFilterItem
                    : styles.filterItem
                }
                onPress={() => setTimeFilter('monthly')}>
                <Text
                  style={
                    timeFilter === 'monthly'
                      ? styles.selectedFilterTxt
                      : styles.filterTxt
                  }>
                  Monthly
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.filterTitle}>Type</Text>
          <View style={styles.filterWrapper}>
            <View style={styles.filterContainer}>
              <TouchableOpacity
                style={
                  typeFilter === 'all'
                    ? styles.selectedFilterItem
                    : styles.filterItem
                }
                onPress={() => setTypeFilter('all')}>
                <Text
                  style={
                    typeFilter === 'all'
                      ? styles.selectedFilterTxt
                      : styles.filterTxt
                  }>
                  All
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={
                  typeFilter === 'directpay'
                    ? styles.selectedFilterItem
                    : styles.filterItem
                }
                onPress={() => setTypeFilter('directpay')}>
                <Text
                  style={
                    typeFilter === 'directpay'
                      ? styles.selectedFilterTxt
                      : styles.filterTxt
                  }>
                  Directpay
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={
                  typeFilter === 'withdraw'
                    ? styles.selectedFilterItem
                    : styles.filterItem
                }
                onPress={() => setTypeFilter('withdraw')}>
                <Text
                  style={
                    typeFilter === 'withdraw'
                      ? styles.selectedFilterTxt
                      : styles.filterTxt
                  }>
                  Withdraw
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={
                  typeFilter === 'refund'
                    ? styles.selectedFilterItem
                    : styles.filterItem
                }
                onPress={() => setTypeFilter('refund')}>
                <Text
                  style={
                    typeFilter === 'refund'
                      ? styles.selectedFilterTxt
                      : styles.filterTxt
                  }>
                  Refund
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={{
            width: wp(25),
            height: hp(4),
            borderRadius: 10,
            alignSelf:'center',
            backgroundColor: '#1463A0',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onPress={onPress}>
          <Text style={{color: 'white'}}>Exit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  contentContainer: {
    flex: 0.7,
    backgroundColor: '#FFF',
    justifyContent: 'space-between',
    padding: 10,
  },
  filterTitle: {
    marginTop: 20,
    fontSize: 16,
  },
  filterWrapper: {
    height: hp(5),
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#1463A0',
    overflow: 'hidden',
    marginTop: 10,
  },
  filterContainer: {
    flexDirection: 'row',
    flex: 1,
    height: hp(6),
  },
  selectedFilterItem: {
    flex: 0.25,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#1463A0',
    backgroundColor: '#1463A0',
  },
  filterItem: {
    flex: 0.25,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#1463A0',
  },
  filterTxt: {
    color: '#1463A0',
  },
  selectedFilterTxt: {
    color: '#FFF',
  },
});

export default DrawerContent;
