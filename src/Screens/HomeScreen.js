import * as React from 'react';
import {BottomNavigation, Text} from 'react-native-paper';
import QRGenerateScreen from './QRGenerateScreen';
import OrdersScreen from './OrdersScreen';
import TransactionScreen from './TransactionScreen';
import AccountScreen from './AccountScreen';

const Home = props => {
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    {key: 'home', title: 'Home', icon: 'home'},
    {key: 'orders', title: 'Orders', icon: 'shopping'},
    {key: 'transaction', title: 'Transaction', icon: 'repeat'},
    {key: 'account', title: 'Account', icon: 'account'},
  ]);

  // const renderScene = BottomNavigation.SceneMap({
  //   home: QRGenerateScreen,
  //   orders: OrdersScreen,
  //   transaction: TransactionScreen,
  //   account: AccountScreen,
  // });
  const renderScene = ({route, jumpTo}) => {
    switch (route.key) {
      case 'home':
        return <QRGenerateScreen jumpTo={jumpTo} {...props} />;
      case 'orders':
        return <OrdersScreen jumpTo={jumpTo} {...props} />;
      case 'transaction':
        return <TransactionScreen jumpTo={jumpTo} {...props} />;
      case 'account':
        return <AccountScreen jumpTo={jumpTo} {...props} />;
    }
  };

  return (
    <BottomNavigation
      navigationState={{index, routes}}
      onIndexChange={setIndex}
      renderScene={renderScene}
      activeColor="#1463A0"
      inactiveColor="#ACACAC"
      barStyle={{backgroundColor: '#FFFFFF'}}
      {...props}
    />
  );
};

export default Home;
