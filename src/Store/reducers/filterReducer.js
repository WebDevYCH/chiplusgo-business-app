import * as actions from '../actions/type'

const INITIAL_STATE = {
  transactionTimeFilter: 'all',
  transactionTypeFilter: 'all',
  orderTimeFilter:'all',
  orderTypeFilter:'all',
};

export default (state = {...INITIAL_STATE}, action) => {
  switch (action.type) {
    case actions.SET_TRANSACTION_TIME_FILTER:        
      return {
        ...state,
        transactionTimeFilter:action.payload,
      };
    case actions.SET_TRANSACTION_TYPE_FILTER:        
      return {
        ...state,
        transactionTypeFilter:action.payload,
      };
      case actions.SET_ORDER_TIME_FILTER:        
      return {
        ...state,
        orderTimeFilter:action.payload,
      };
      case actions.SET_ORDER_TYPE_FILTER:        
      return {
        ...state,
        orderTypeFilter:action.payload,
      };
    default:
      // Return the initial state when no action types match.
      return state;
  }
};
