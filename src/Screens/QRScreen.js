import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Text,
  Image,
  ToastAndroid,
  PermissionsAndroid,
} from 'react-native';
import CameraRoll from '@react-native-community/cameraroll';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import ScreenBrightness from 'react-native-screen-brightness';
import DeviceBrightness from 'react-native-device-brightness';
import {useSelector} from 'react-redux';
import QRCode from 'react-native-qrcode-svg';
import * as Progress from 'react-native-progress';
import firestore from '@react-native-firebase/firestore';
import DownloadIcon from 'react-native-vector-icons/AntDesign';
import LightIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Modal, Portal, Button, Provider} from 'react-native-paper';
import RNFS from 'react-native-fs';
import {QRLogoImg} from '../assets/images';
import Header from '../components/NavigationHeader';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {ADMIN_ROLE} from '../utiles';

const QRScreen = props => {
  var qrDataObject = {};
  const [state, setState] = useState({
    businessInfo: {},
    brightness: 100,
    turnLamp: false,
  });
  const onPress = () => {
    props.navigation.goBack();
  };
  const [show, setShow] = React.useState(false);
  const uid = useSelector(({user}) => user.user.uid);
  const role = useSelector(({user}) => user.role);
  const businessId = useSelector(({user}) => user.user.businessId);
  const userData = useSelector(({user}) => user.user);
  console.log(uid, businessId);
  const subProps = {
    title: 'Show to Request',
    showButton: false,
    onPress,
    btnTxt: 'Cancel',
    btnColor: '#EC1A17',
  };

  const hideAlert = () => setShow(false);
  const showAlert = () => setShow(true);

  const brightPermission = async () => {
    let hasPerm = await ScreenBrightness.hasPermission();
    if (!hasPerm) {
      showAlert(true);
      return true;
    }
    return false;
  };

  useEffect(() => {
    brightPermission();
  }, []);

  useEffect(() => {
    if (uid) {
      firestore()
        .collection('Business')
        .doc(businessId)
        .get()
        .then(documentSnapshot => {
          if (documentSnapshot.exists) {
            setState({...state, businessInfo: documentSnapshot.data()});
          }
        });
    }
  }, [uid]);

  const toggleLamp = async () => {
    const result = await brightPermission();
    if (result) return;
    setState({...state, turnLamp: !state.turnLamp});

    if (!state.turnLamp) {
      console.log('turned on');
      ScreenBrightness.setBrightness(1);
    } else {
      console.log(state.brightness);
      ScreenBrightness.setBrightness(0.1);
    }
  };

  const getDataURL = () => {
    qrDataObject.toDataURL(callback);
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

  const callback = async(dataUrl) => {
    var path = RNFS.CachesDirectoryPath + '/QRcode.png';
    console.log(path);
    if (Platform.OS === "android" && !(await hasAndroidPermission())) {
      return;
    }
    RNFS.writeFile(path, dataUrl, 'base64')
      .then(success => {
        return CameraRoll.save(
          RNFS.CachesDirectoryPath + '/QRcode.png',
          'photo',
        );
      })
      .then(() => {
        ToastAndroid.show('Saved QRcode to gallery !', ToastAndroid.SHORT);
      }).catch(error=>{
        console.log(error)
      })
  };

  if (Object.keys(state.businessInfo).length === 0) {
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
      <Header {...subProps} />
      <View style={styles.textContainer}>
        <Text style={styles.text}>
          Please open your CHI+GO and scan this QR code to pay.
        </Text>
      </View>
      <View style={styles.QRcontainer}>
        <View style={styles.logoContainer}>
          <Image
            source={{uri: state.businessInfo.Business_logo}}
            style={styles.businessLogo}
          />
          {role === ADMIN_ROLE ? (
            <Text style={styles.businessName}>
              {state.businessInfo.Business_name.English}
            </Text>
          ) : (
            <Text style={styles.businessName}>
              {`${state.businessInfo.Business_name.English} - ${userData.subAccount.Nick_name}`}
            </Text>
          )}
        </View>
        <QRCode
          value={uid}
          size={wp(65)}
          logo={{uri: state.businessInfo.Business_logo}}
          getRef={c => (qrDataObject = c)}
        />
        <View style={styles.btnContainer}>
          <TouchableOpacity style={styles.iconBtn} onPress={getDataURL}>
            <DownloadIcon name="download" size={30} color="#1463A0" />
            <Text style={styles.iconBtnTxt}>Download</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={toggleLamp}>
            {state.turnLamp ? (
              <LightIcon
                name="lightbulb-off-outline"
                size={30}
                color="#1463A0"
              />
            ) : (
              <LightIcon
                name="lightbulb-on-outline"
                size={30}
                color="#1463A0"
              />
            )}
            {state.turnLamp ? (
              <Text style={styles.iconBtnTxt}>Turn Off</Text>
            ) : (
              <Text style={styles.iconBtnTxt}>Turn On</Text>
            )}
          </TouchableOpacity>
        </View>
        <Modal
          visible={show}
          onDismiss={hideAlert}
          contentContainerStyle={styles.alert}>
          <Text style={{alignSelf: 'flex-start', fontSize: 16}}>SET</Text>
          <Text style={{alignSelf: 'flex-start', color: '#666666'}}>
            {`CHI+GO does not have permission to set screen brightness. To solve this issue: Open device Settings > Apps & Notifications > App > Search for CHI+GO > Modify system settings`}
          </Text>
          <View style={{flexDirection: 'row'}}>
            <TouchableOpacity
              onPress={hideAlert}
              style={{alignSelf: 'flex-start'}}>
              <Text style={{color: '#666666', marginRight: 20}}>GOT IT</Text>
            </TouchableOpacity>
          </View>
        </Modal>
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
  textContainer: {
    width: wp(100),
    padding: wp(5),
  },
  text: {
    fontSize: 14,
  },
  QRcontainer: {
    width: wp(90),
    marginHorizontal: wp(5),
    alignItems: 'center',
    justifyContent: 'center',
    padding: wp(10),
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,

    elevation: 2,
    backgroundColor: '#FFF',
  },
  logoContainer: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'center',
  },
  businessLogo: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(15),
  },
  businessName: {
    fontSize: 16,
    marginLeft: 15,
  },
  btnContainer: {
    width: wp(65),
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  iconBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnTxt: {
    fontSize: 14,
    color: '#1463A0',
  },
  alert: {
    backgroundColor: 'white',
    padding: 20,
    alignSelf: 'center',
    width: wp(70),
    height: hp(40),
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    borderRadius: 10,
    zIndex: 1000,
  },
});

export default QRScreen;
