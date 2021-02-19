import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Text,
  Image,
  ScrollView,
  ToastAndroid,
} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

import {useSelector} from 'react-redux';
import firestore from '@react-native-firebase/firestore';
import * as Progress from 'react-native-progress';

import Header from '../components/NavigationHeader';
import * as images from '../assets/images';
import {ADMIN_ROLE} from '../utiles';
import {Emails} from '../api';

function makeid(length) {
  var result = [];
  var characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result.push(
      characters.charAt(Math.floor(Math.random() * charactersLength)),
    );
  }
  return result.join('');
}

const CouponDetailScreen = props => {
  const couponPath = useSelector(({data}) => data.scanedCouponTicketPath);
  const userData = useSelector(({user}) => user.user);
  const businessData = useSelector(({data}) => data.businessData);
  console.log(businessData);
  const role = useSelector(({user}) => user.role);
  const [state, setState] = useState({
    couponData: {},
    clientInfo: {},
    showSuccess: false,
  });
  const onPress = () => {
    props.navigation.goBack();
  };
  const subProps = {
    title: 'Scan to Redeem',
    showButton: true,
    onPress,
    onPressBtn: onPress,
    btnTxt: 'Cancel',
    btnColor: '#EC1A17',
  };

  useEffect(() => {
    if (couponPath) {
      console.log(couponPath.split('/')[0].replace(/\r?\n|\r/g, ''));
      console.log(couponPath.split('/')[1].replace(/\r?\n|\r/g, ''));
      console.log(couponPath.split('/')[2].replace(/\r?\n|\r/g, ''));
      firestore()
        .collection('Coupon_ticket')
        .doc(couponPath.split('/')[0].replace(/\r?\n|\r/g, ''))
        .collection(couponPath.split('/')[1].replace(/\r?\n|\r/g, ''))
        .doc(couponPath.split('/')[2].replace(/\r?\n|\r/g, ''))
        .get()
        .then(documentSnapshot => {
          if (documentSnapshot.exists) {
            firestore()
              .collection('Client')
              .doc(documentSnapshot.data().ClientId)
              .get()
              .then(snapshot => {
                // console.log(documentSnapshot.data());

                if (snapshot.exists) {
                  console.log('---------------', documentSnapshot.data());
                  setState({
                    ...state,
                    couponData: documentSnapshot.data(),
                    clientInfo: snapshot.data(),
                  });
                }
              });
          }
        });
    }
  }, [couponPath]);

  const setRedeem = () => {
    console.log(state.couponData.BusinessId);
    if (state.couponData.BusinessId.includes(userData.businessId)) {
      firestore()
        .collection('Coupon_ticket')
        .doc(couponPath.split('/')[0].replace(/\r?\n|\r/g, ''))
        .collection(couponPath.split('/')[1].replace(/\r?\n|\r/g, ''))
        .doc(couponPath.split('/')[2].replace(/\r?\n|\r/g, ''))
        .update({
          Used: true,
          Used_date: new Date(),
          Used_BusinessId: userData.businessId,
          Used_Business_name: [
            {
              English: businessData.Business_name.English,
              Chinese: businessData.Business_name.Chinese,
            },
          ],
        })
        .then(() => {
          console.log('Coupon ticket updated', state.couponData.ClientId);
          firestore()
            .collection('Orders')
            .doc('Orders')
            .collection(state.couponData.ClientId)
            .where(
              'CouponTicketId',
              '==',
              couponPath.split('/')[2].replace(/\r?\n|\r/g, ''),
            )
            .get()
            .then(querySnapshot => {
              querySnapshot.forEach(documentSnapshot => {
                console.log(documentSnapshot.data());
                firestore()
                  .collection('Orders')
                  .doc('Orders')
                  .collection(state.couponData.ClientId)
                  .doc(documentSnapshot.id)
                  .update({
                    Used: true,
                    Used_date: new Date(),
                  })
                  .then(() => {
                    console.log('Client Order updated', userData.uid);
                    const id = makeid(20);
                    console.log(id);
                    firestore()
                      .collection('Client')
                      .doc(state.couponData.ClientId)
                      .get()
                      .then(clientSnapshot => {
                        if (clientSnapshot.exists) {
                          console.log('Client data: ', clientSnapshot.data());
                          firestore()
                            .collection('Orders')
                            .doc('Orders')
                            .collection(userData.businessId)
                            .doc(id)
                            .set({
                              BusinessId: userData.businessId,
                              BusinessName: documentSnapshot.data()
                                .BusinessName,
                              Business_time: new Date(),
                              ClientId: state.couponData.ClientId,
                              ClientName: clientSnapshot.data().Name,
                              CouponTicketId: couponPath.split('/')[2],
                              CouponId: state.couponData.CouponId,
                              Create_date: new Date(),
                              Discount:
                                parseFloat(state.couponData.Original_price) -
                                parseFloat(state.couponData.Price),
                              Item: state.couponData.Item,
                              OrderId: id,
                              Title: state.couponData.Title,
                              Original_price: parseFloat(
                                state.couponData.Original_price,
                              ),
                              Price: parseFloat(state.couponData.Price),
                              Used_cash: documentSnapshot.data().Used_cash,
                              Used_creditLine: documentSnapshot.data()
                                .Used_creditLine,
                              Used_point: documentSnapshot.data().Used_point,
                              Used_date: new Date(),
                              SubaccountId:
                                role === ADMIN_ROLE ? '' : userData.uid,
                              Subtotal: documentSnapshot.data().Subtotal,
                              Tax: parseFloat(state.couponData.Tax),
                            })
                            .then(() => {
                              Emails.sendEmail({
                                option: {
                                  from:
                                    'Customer Service <noreply@firebase.com>',
                                  to: userData.email,
                                  subject: 'Coupon Detail',
                                  html: `<!DOCTYPE html>
                                <html
                                  lang="en"
                                  xmlns="http://www.w3.org/1999/xhtml"
                                  xmlns:v="urn:schemas-microsoft-com:vml"
                                  xmlns:o="urn:schemas-microsoft-com:office:office"
                                >
                                  <head>
                                    <meta charset="utf-8" />
                                    <!-- utf-8 works for most cases -->
                                    <meta name="viewport" content="width=device-width" />
                                    <!-- Forcing initial-scale shouldn't be necessary -->
                                    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
                                    <!-- Use the latest (edge) version of IE rendering engine -->
                                    <meta name="x-apple-disable-message-reformatting" />
                                    <!-- Disable auto-scale in iOS 10 Mail entirely -->
                                    <title></title>
                                    <!-- The title tag shows in email notifications, like Android 4.4. -->
                                
                                    <link
                                      href="https://fonts.googleapis.com/css?family=Work+Sans:200,300,400,500,600,700"
                                      rel="stylesheet"
                                    />
                                
                                    <!-- CSS Reset : BEGIN -->
                                    <style>
                                      /* What it does: Remove spaces around the email design added by some email clients. */
                                      /* Beware: It can remove the padding / margin and add a background color to the compose a reply window. */
                                      html,
                                      body {
                                        margin: 0 auto !important;
                                        padding: 0 !important;
                                        height: 100% !important;
                                        width: 100% !important;
                                        background: #f1f1f1;
                                      }
                                
                                      /* What it does: Stops email clients resizing small text. */
                                      * {
                                        -ms-text-size-adjust: 100%;
                                        -webkit-text-size-adjust: 100%;
                                      }
                                
                                      /* What it does: Centers email on Android 4.4 */
                                      div[style*="margin: 16px 0"] {
                                        margin: 0 !important;
                                      }
                                
                                      /* What it does: Stops Outlook from adding extra spacing to tables. */
                                      table,
                                      td {
                                        mso-table-lspace: 0pt !important;
                                        mso-table-rspace: 0pt !important;
                                      }
                                
                                      /* What it does: Fixes webkit padding issue. */
                                      table {
                                        border-spacing: 0 !important;
                                        border-collapse: collapse !important;
                                        table-layout: fixed !important;
                                        margin: 0 auto !important;
                                      }
                                
                                      /* What it does: Uses a better rendering method when resizing images in IE. */
                                      img {
                                        -ms-interpolation-mode: bicubic;
                                      }
                                
                                      /* What it does: Prevents Windows 10 Mail from underlining links despite inline CSS. Styles for underlined links should be inline. */
                                      a {
                                        text-decoration: none;
                                      }
                                
                                      /* What it does: A work-around for email clients meddling in triggered links. */
                                      *[x-apple-data-detectors],  /* iOS */
                                .unstyle-auto-detected-links *,
                                .aBn {
                                        border-bottom: 0 !important;
                                        cursor: default !important;
                                        color: inherit !important;
                                        text-decoration: none !important;
                                        font-size: inherit !important;
                                        font-family: inherit !important;
                                        font-weight: inherit !important;
                                        line-height: inherit !important;
                                      }
                                
                                      /* What it does: Prevents Gmail from displaying a download button on large, non-linked images. */
                                      .a6S {
                                        display: none !important;
                                        opacity: 0.01 !important;
                                      }
                                
                                      /* What it does: Prevents Gmail from changing the text color in conversation threads. */
                                      .im {
                                        color: inherit !important;
                                      }
                                
                                      /* If the above doesn't work, add a .g-img class to any image in question. */
                                      img.g-img + div {
                                        display: none !important;
                                      }
                                
                                      /* What it does: Removes right gutter in Gmail iOS app: https://github.com/TedGoas/Cerberus/issues/89  */
                                      /* Create one of these media queries for each additional viewport size you'd like to fix */
                                
                                      /* iPhone 4, 4S, 5, 5S, 5C, and 5SE */
                                      @media only screen and (min-device-width: 320px) and (max-device-width: 374px) {
                                        u ~ div .email-container {
                                          min-width: 320px !important;
                                        }
                                      }
                                      /* iPhone 6, 6S, 7, 8, and X */
                                      @media only screen and (min-device-width: 375px) and (max-device-width: 413px) {
                                        u ~ div .email-container {
                                          min-width: 375px !important;
                                        }
                                      }
                                      /* iPhone 6+, 7+, and 8+ */
                                      @media only screen and (min-device-width: 414px) {
                                        u ~ div .email-container {
                                          min-width: 414px !important;
                                        }
                                      }
                                    </style>
                                
                                    <!-- CSS Reset : END -->
                                
                                    <!-- Progressive Enhancements : BEGIN -->
                                    <style>
                                      .primary {
                                        background: #17bebb;
                                      }
                                      .bg_white {
                                        background: #ffffff;
                                      }
                                      .bg_light {
                                        background: #f7fafa;
                                      }
                                      .bg_black {
                                        background: #000000;
                                      }
                                      .bg_dark {
                                        background: rgba(0, 0, 0, 0.8);
                                      }
                                      .email-section {
                                        padding: 2.5em;
                                      }
                                
                                      /*BUTTON*/
                                      .btn {
                                        padding: 10px 15px;
                                        display: inline-block;
                                      }
                                      .btn.btn-primary {
                                        border-radius: 5px;
                                        background: #17bebb;
                                        color: #ffffff;
                                      }
                                      .btn.btn-white {
                                        border-radius: 5px;
                                        background: #ffffff;
                                        color: #000000;
                                      }
                                      .btn.btn-white-outline {
                                        border-radius: 5px;
                                        background: transparent;
                                        border: 1px solid #fff;
                                        color: #fff;
                                      }
                                      .btn.btn-black-outline {
                                        border-radius: 0px;
                                        background: transparent;
                                        border: 2px solid #000;
                                        color: #000;
                                        font-weight: 700;
                                      }
                                      .btn-custom {
                                        color: rgba(0, 0, 0, 0.3);
                                        text-decoration: underline;
                                      }
                                
                                      h1,
                                      h2,
                                      h3,
                                      h4,
                                      h5,
                                      h6 {
                                        font-family: "Work Sans", sans-serif;
                                        color: #000000;
                                        margin-top: 0;
                                        font-weight: 400;
                                      }
                                
                                      body {
                                        font-family: "Work Sans", sans-serif;
                                        font-weight: 400;
                                        font-size: 15px;
                                        line-height: 1.8;
                                        color: rgba(0, 0, 0, 0.4);
                                      }
                                
                                      a {
                                        color: #17bebb;
                                      }
                                
                                      table {
                                      }
                                      /*LOGO*/
                                
                                      .logo h1 {
                                        margin: 0;
                                      }
                                      .logo h1 a {
                                        color: #17bebb;
                                        font-size: 24px;
                                        font-weight: 700;
                                        font-family: "Work Sans", sans-serif;
                                      }
                                
                                      /*HERO*/
                                      .hero {
                                        position: relative;
                                        z-index: 0;
                                      }
                                
                                      .hero .text {
                                        color: rgba(0, 0, 0, 0.3);
                                      }
                                      .hero .text h2 {
                                        color: #000;
                                        font-size: 34px;
                                        margin-bottom: 15px;
                                        font-weight: 300;
                                        line-height: 1.2;
                                      }
                                      .hero .text h3 {
                                        font-size: 24px;
                                        font-weight: 200;
                                      }
                                      .hero .text h2 span {
                                        font-weight: 600;
                                        color: #000;
                                      }
                                
                                      /*PRODUCT*/
                                      .product-entry {
                                        display: block;
                                        position: relative;
                                        float: left;
                                        padding-top: 20px;
                                      }
                                      .product-entry .text {
                                        width: calc(100% - 125px);
                                        padding-left: 20px;
                                      }
                                      .product-entry .text h3 {
                                        margin-bottom: 0;
                                        padding-bottom: 0;
                                      }
                                      .product-entry .text p {
                                        margin-top: 0;
                                      }
                                      .product-entry img,
                                      .product-entry .text {
                                        float: left;
                                      }
                                
                                      ul.social {
                                        padding: 0;
                                      }
                                      ul.social li {
                                        display: inline-block;
                                        margin-right: 10px;
                                      }
                                
                                      /*FOOTER*/
                                
                                      .footer {
                                        border-top: 1px solid rgba(0, 0, 0, 0.05);
                                        color: rgba(0, 0, 0, 0.5);
                                      }
                                      .footer .heading {
                                        color: #000;
                                        font-size: 20px;
                                      }
                                      .footer ul {
                                        margin: 0;
                                        padding: 0;
                                      }
                                      .footer ul li {
                                        list-style: none;
                                        margin-bottom: 10px;
                                      }
                                      .footer ul li a {
                                        color: rgba(0, 0, 0, 1);
                                      }
                                
                                      @media screen and (max-width: 500px) {
                                      }
                                    </style>
                                  </head>
                                
                                  <body
                                    width="100%"
                                    style="
                                      margin: 0;
                                      padding: 0 !important;
                                      mso-line-height-rule: exactly;
                                      background-color: #f1f1f1;
                                    "
                                  >
                                    <center style="width: 100%; background-color: #f1f1f1">
                                      <div
                                        style="
                                          display: none;
                                          font-size: 1px;
                                          max-height: 0px;
                                          max-width: 0px;
                                          opacity: 0;
                                          overflow: hidden;
                                          mso-hide: all;
                                          font-family: sans-serif;
                                        "
                                      >
                                        &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
                                      </div>
                                      <div style="max-width: 600px; margin: 0 auto" class="email-container">
                                        <!-- BEGIN BODY -->
                                        <table
                                          align="center"
                                          role="presentation"
                                          cellspacing="0"
                                          cellpadding="0"
                                          border="0"
                                          width="100%"
                                          style="margin: auto"
                                        >
                                          <tr>
                                            <td
                                              valign="top"
                                              class="bg_white"
                                              style="padding: 1em 2.5em 0 2.5em"
                                            >
                                              <table
                                                role="presentation"
                                                border="0"
                                                cellpadding="0"
                                                cellspacing="0"
                                                width="100%"
                                              >
                                                <tr>
                                                  <td class="logo" style="text-align: left">
                                                    <h1><a href="#">Order Info</a></h1>
                                                  </td>
                                                </tr>
                                              </table>
                                            </td>
                                          </tr>
                                          <!-- end tr -->
                                          <tr>
                                            <td
                                              valign="middle"
                                              class="hero bg_white"
                                              style="padding: 2em 0 2em 0"
                                            >
                                              <table
                                                role="presentation"
                                                border="0"
                                                cellpadding="0"
                                                cellspacing="0"
                                                width="100%"
                                              >

                                                <tr>
                                                  <td style="padding: 0 2.5em; text-align: left">
                                                    <h3>Deal Name:</h3>
                                                  </td>
                                                  <td style="padding: 0 2.5em; text-align: right">
                                                    <h3>${
                                                      state.couponData.Title
                                                    }</h3>
                                                  </td>
                                                </tr>
                                                <tr>
                                                  <td style="padding: 0 2.5em; text-align: left">
                                                    <h3>Customer Name:</h3>
                                                  </td>
                                                  <td style="padding: 0 2.5em; text-align: right">
                                                    <h3>${
                                                      state.clientInfo.Name
                                                    }</h3>
                                                  </td>
                                                </tr>
                                              </table>
                                            </td>
                                          </tr>
                                          <!-- end tr -->
                                          <tr>
                                            <td
                                              valign="top"
                                              class="bg_white"
                                              style="padding: 1em 2.5em 0 2.5em"
                                            >
                                              <table
                                                role="presentation"
                                                border="0"
                                                cellpadding="0"
                                                cellspacing="0"
                                                width="100%"
                                              >
                                                <tr>
                                                  <td class="logo" style="text-align: left">
                                                    <h1><a href="#">Deal Info</a></h1>
                                                  </td>
                                                </tr>
                                                ${
                                                  Object.keys(
                                                    state.couponData,
                                                  ).includes('Item') &&
                                                  state.couponData.Item.map(
                                                    (item, index) => {
                                                      return `<tr>
                                                        <td
                                                          class="logo"
                                                          style="text-align: left">
                                                          <h3>${item.Item}</h3>
                                                        </td>
                                                      </tr>`;
                                                    },
                                                  )
                                                }
                                               
                                              </table>
                                            </td>
                                          </tr>
                                          <tr>
                                            <table
                                              class="bg_white"
                                              role="presentation"
                                              border="0"
                                              cellpadding="0"
                                              cellspacing="0"
                                              width="100%"
                                            >
                                              
                                              ${state.couponData.Image.map(
                                                (item, index) => {
                                                  return `<tr style="border-bottom: 1px solid rgba(0, 0, 0, 0.05)">
                                                    <td
                                                      valign="middle"
                                                      width="80%"
                                                      style="text-align: center; padding: 0 2.5em">
                                                      <div class="product-entry">
                                                        <img
                                                          src=${item}
                                                          alt=""
                                                          style="
                                                        width: 100px;
                                                        max-width: 600px;
                                                        height: auto;
                                                        margin-bottom: 20px;
                                                        display: block;
                                                      "
                                                        />
                                                      </div>
                                                    </td>
                                                  </tr>`;
                                                },
                                              )}  
                                              
                                           
                                            </table>
                                          </tr>
                                          <!-- end tr -->
                                          <!-- 1 Column Text + Button : END -->
                                        </table>
                                      </div>
                                    </center>
                                  </body>
                                </html>
                                `,
                                },
                              })
                                .then(res => {})
                                .catch(error => {
                                  console.log(error);
                                });
                              setState({...state, showSuccess: true});
                            });
                        }
                      });
                  });
              });
            });
        });
    } else {
      ToastAndroid.show("You can't Redeem this coupon!", ToastAndroid.LONG);
    }
  };

  if (Object.keys(state.couponData).length === 0) {
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

  if (state.showSuccess) {
    return (
      <View style={styles.successContainer}>
        <Image source={images.CompleteImg} />
        <Text style={styles.successTitle}>Redeem Completed</Text>
        <Text style={styles.successContent}>
          {`Activity Number: #${couponPath.slice(
            couponPath.length - 8,
            couponPath.length,
          )}`}
        </Text>
        <TouchableOpacity
          style={styles.successBtn}
          onPress={() => props.navigation.navigate('QRGenerate')}>
          <Text style={styles.successBtnTxt}>Done</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View>
      <Header {...subProps} {...props} />
      <View style={styles.contianer}>
        <View>
          <View style={styles.orderContainer}>
            <Text style={styles.title}>Order Info</Text>
            <View style={styles.inlineTxt}>
              <Text style={styles.txt}>Deal Name :</Text>
              <Text style={styles.txt}>{state.couponData.Title}</Text>
            </View>
            <View style={styles.inlineTxt}>
              <Text style={styles.txt}>Customer Name :</Text>
              <Text style={styles.txt}>{state.clientInfo.Name}</Text>
            </View>
            <View style={styles.inlineTxt}>
              <Text style={styles.txt}>Price :</Text>
              <Text style={styles.txt}>{`$${state.couponData.Price}`}</Text>
            </View>
          </View>
          <View style={styles.dealContainer}>
            <Text style={styles.title}>Deal Info</Text>
            {Object.keys(state.couponData).includes('Item') &&
              state.couponData.Item.map((item, index) => {
                return (
                  <View style={styles.inlineTxt} key={index}>
                    <Text style={styles.txt}>{item.Item}</Text>
                  </View>
                );
              })}
          </View>
        </View>
        <ScrollView horizontal={true}>
          {/* <View style={styles.imageContainer}> */}
          {state.couponData.Image.map((item, index) => {
            console.log(item);
            return (
              <Image
                source={{uri: item}}
                style={styles.productImg}
                key={index}
              />
            );
          })}
          {/* </View> */}
        </ScrollView>
        <View style={styles.btnContainer}>
          {!state.couponData.Used ? (
            <TouchableOpacity style={styles.button} onPress={setRedeem}>
              <Text style={styles.btnTxt}>Redeem & Print Receipt</Text>
            </TouchableOpacity>
          ) : (
            <>
              <Text style={styles.title}>
                This Coupon has been used already.
              </Text>
              <TouchableOpacity
                style={styles.button}
                onPress={() => props.navigation.navigate('QRGenerate')}>
                <Text style={styles.btnTxt}>Ok</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  contianer: {
    height: hp(87),
    width: wp(100),
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },
  orderContainer: {
    width: wp(100),
    padding: wp(5),
    backgroundColor: '#FFF',
    marginBottom: 2,
  },
  dealContainer: {
    width: wp(100),
    padding: wp(5),
    backgroundColor: '#FFF',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  inlineTxt: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: hp(5),
  },
  txt: {
    fontSize: 14,
  },
  btnContainer: {
    height: hp(15),
    width: wp(100),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },
  button: {
    width: wp(90),
    height: hp(7),
    backgroundColor: '#1463A0',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnTxt: {
    fontSize: 14,
    color: '#FFF',
  },
  successContainer: {
    height: hp(100),
    width: wp(100),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 25,
  },
  successContent: {
    fontSize: 14,
    color: '#ACACAC',
    marginBottom: 25,
  },
  successBtn: {
    width: wp(60),
    height: hp(6),
    backgroundColor: '#1463A0',
    borderRadius: hp(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  successBtnTxt: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: 'bold',
  },
  imageContainer: {
    width: wp(100),
    height: hp(25),
    flexDirection: 'row',
  },
  productImg: {
    width: wp(60),
    height: hp(25),
    marginHorizontal: 10,
    borderRadius: 5,
  },
});

export default CouponDetailScreen;
