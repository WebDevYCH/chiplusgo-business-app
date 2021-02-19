import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import HomeScreen from '../Screens/HomeScreen';
import LoginScreen from '../Screens/LoginScreen';
import TransactionDetailScreen from '../Screens/TransactionDetailScreen';
import OrderDetailScreen from '../Screens/OrderDetailScreen';
import SplashScreen from '../Screens/SplashScreen';
import QRScanScreen from '../Screens/QRScanScreen';
import CouponDetailScreen from '../Screens/CouponDetailScreen';
import QRScreen from '../Screens/QRScreen'
import EditProfileScreen from '../Screens/EditProfileScreen'
import ResetPasswordScreen from './../Screens/ResetPasswordScreen';
import SubAccountScreen from './../Screens/SubaccountScreen';
import SubAccountCreateScreen from './../Screens/SubaccountCreateScreen';
import WidthdrawScreen from './../Screens/WidthdrawScreen';
import CardFromScreen from '../Screens/AddressFormScreen';
import ReviewWithdrawScreen from '../Screens/ReviewWithdrawScreen';
import EditSubaccountScreen from './../Screens/EditSubaccountScreen';
import CashPointRateScreen from './../Screens/CashPointRateScreen';

const Stack = createStackNavigator();

const Navigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator mode="card" headerMode="none">
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          option={{
            headerTransparent: true,
          }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          option={{
            headerTransparent: true,
          }}
        />
        <Stack.Screen
          name="QRGenerate"
          component={HomeScreen}
          option={{
            headerTransparent: true,
          }}
        />
        <Stack.Screen
          name="TransactionDetail"
          component={TransactionDetailScreen}
          option={{
            headerTransparent: true,
          }}
        />
        <Stack.Screen
          name="OrderDetail"
          component={OrderDetailScreen}
          option={{
            headerTransparent: true,
          }}
        />
        <Stack.Screen
          name="QRScan"
          component={QRScanScreen}
          option={{
            headerTransparent: true,
          }}
        />
        <Stack.Screen
          name="CouponDetail"
          component={CouponDetailScreen}
          option={{
            headerTransparent: true,
          }}
        />
        <Stack.Screen
          name="QR"
          component={QRScreen}
          option={{
            headerTransparent: true,
          }}
        />
        <Stack.Screen
          name="EditProfile"
          component={EditProfileScreen}
          option={{
            headerTransparent: true,
          }}
        />
        <Stack.Screen
          name="ResetPassword"
          component={ResetPasswordScreen}
          option={{
            headerTransparent: true,
          }}
        />
        <Stack.Screen
          name="SubAccount"
          component={SubAccountScreen}
          option={{
            headerTransparent: true,
          }}
        />
        <Stack.Screen
          name="SubAccountCreate"
          component={SubAccountCreateScreen}
          option={{
            headerTransparent: true,
          }}
        />
        <Stack.Screen
          name="Withdraw"
          component={WidthdrawScreen}
          option={{
            headerTransparent: true,
          }}
        />
        <Stack.Screen
          name="CardForm"
          component={CardFromScreen}
          option={{
            headerTransparent: true,
          }}
        />
        <Stack.Screen
          name="ReviewWithdraw"
          component={ReviewWithdrawScreen}
          option={{
            headerTransparent: true,
          }}
        />
        <Stack.Screen
          name="EditSubaccount"
          component={EditSubaccountScreen}
          option={{
            headerTransparent: true,
          }}
        />
        <Stack.Screen
          name="CashPointRate"
          component={CashPointRateScreen}
          option={{
            headerTransparent: true,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
