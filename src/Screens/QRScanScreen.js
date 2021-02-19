import React, {Fragment, useRef, useState} from 'react';
import QRCodeScanner from 'react-native-qrcode-scanner';
import {Dimensions, StyleSheet} from 'react-native';
const deviceWidth = Dimensions.get('screen').width;
const deviceHeight = Dimensions.get('screen').height;
import Icon from 'react-native-vector-icons/Ionicons';
import {TouchableOpacity, Text, View} from 'react-native';
import { useDispatch } from 'react-redux';
import * as actions from '../Store/actions/type'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {QRLogoImg} from '../assets/images'

// const QRLogoImg = "data:image/png;base64,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"
const Scan = props => {
  const [state, setState] = useState({
    scan: true,
    ScanResult: false,
    result: null,
    trueResult: false,
  });
  var scanner = useRef(null);
  const dispatch=useDispatch()
  const {scan, ScanResult, result, trueResult} = state;

  const onSuccess = e => {
    const check = e.data;
    console.log('-------------------------------',e.data);
    const regex = /[a-zA-Z0-9]+[\/]/g;
    setState({
      result: e,
      scan: true,
      ScanResult: false,
      trueResult: false,
    });
    var path = e.data.split('/')[0]+"/"+"Coupon_ticket"+"/"+e.data.split('/')[1]
    if (regex.test(check)) {
      dispatch({type:actions.SET_COUPON_TICKET_PATH, payload:path})
    props.navigation.replace('CouponDetail');
      // setState({
      //   result: e,
      //   scan: false,
      //   ScanResult: true,
      //   trueResult: true,
      // });
    } else {
      setState({
        ...state,
        result: e,
        scan: false,
        ScanResult: true,
      });
    }
  };

  const scanAgain = () => {
    setState({
      ...state,
      scan: true,
      ScanResult: false,
    });
  };

  return (
    <View style={styles.scrollViewStyle}>
      <Fragment>
        {ScanResult && (
          <Fragment>
            <Text style={styles.textTitle1}>Result !</Text>

            {ScanResult &&(
              <View style={ScanResult ? styles.scanCardView : styles.cardView}>
                <Text>Incorrect QR code</Text>
                <TouchableOpacity
                  onPress={scanAgain}
                  style={styles.buttonTouchable}>
                  <Text style={styles.buttonTextStyle}>
                    Click to Scan again!
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </Fragment>
        )}

        {scan && (
          <>
          <TouchableOpacity style={styles.close} onPress={()=>props.navigation.goBack()}>
          <Icon name="close" size={30} />
          </TouchableOpacity>
          <QRCodeScanner
            reactivate={true}
            showMarker={true}
            ref={node => {
              scanner = node;
            }}
            onRead={onSuccess}
          />
          </>
        )}
      </Fragment>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollViewStyle: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#1463A0',
  },

  textTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
    padding: 16,
    color: 'white',
  },
  textTitle1: {
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
    padding: 16,
    color: 'black',
  },
  cardView: {
    width: deviceWidth - 32,
    height: deviceHeight / 2,
    alignSelf: 'center',
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 2,
    borderColor: '#ddd',
    borderBottomWidth: 0,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 4,
    marginLeft: 5,
    marginRight: 5,
    marginTop: 10,
    backgroundColor: 'white',
  },
  scanCardView: {
    width: deviceWidth - 32,
    height: deviceHeight / 2,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 2,
    borderColor: '#ddd',
    borderBottomWidth: 0,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 4,
    marginLeft: 5,
    marginRight: 5,
    marginTop: 10,
    backgroundColor: 'white',
  },
  buttonScan: {
    width: 42,
  },
  descText: {
    padding: 16,
    textAlign: 'justify',
    fontSize: 16,
  },

  highlight: {
    fontWeight: '700',
  },

  centerText: {
    flex: 1,
    fontSize: 18,
    padding: 32,
    color: '#777',
  },
  textBold: {
    fontWeight: '500',
    color: '#000',
  },
  buttonTouchable: {
    fontSize: 21,
    backgroundColor: '#1463A0',
    marginTop: 32,
    borderRadius: 20,
    width: deviceWidth - 62,
    justifyContent: 'center',
    alignItems: 'center',
    height: 44,
  },
  buttonTextStyle: {
    color: 'white',
    fontWeight: 'bold',
  },
  close:{
    height: hp(5),
    width:hp(5),
    borderRadius:hp(5),
    backgroundColor:'#FFF',
    position:'absolute',
    top:20,
    left:20,
    alignItems:'center',
    justifyContent:'center'
  }
});

export default Scan;
