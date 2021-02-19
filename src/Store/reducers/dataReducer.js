import * as actions from '../actions/type';

const INITIAL_STATE = {
  selectedTransactionItem: {},
  selectedOrderItem: {},
  scanedCouponTicketPath: '',
  businessData: {},
  widthdraw: {},
  subAccounts: [],
  selectedSubaccount: {},
  count: 0,
};

export default (state = {...INITIAL_STATE}, action) => {
  switch (action.type) {
    case actions.SET_SELECTED_TRANSACTION_ITEM:
      return {
        ...state,
        selectedTransactionItem: {...action.payload},
      };
    case actions.SET_SELECTED_ORDER_ITEM:
      return {
        ...state,
        selectedOrderItem: {...action.payload},
      };
    case actions.SET_COUPON_TICKET_PATH:
      return {
        ...state,
        scanedCouponTicketPath: action.payload,
      };
    case actions.SET_BUSINESS_DATA:
      return {
        ...state,
        businessData: {...action.payload},
      };
    case actions.SET_DATA:
      return {
        ...state,
        ...action.payload,
      };

    case actions.SET_COUNT:
      return {
        ...state,
        count: 1,
      };
    default:
      // Return the initial state when no action types match.
      return state;
  }
};
