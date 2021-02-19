const INITIAL_STATE = {
  user: {},
  role: 'admin',
  location: {lat: 0, long: 0},
};

export default (state = {...INITIAL_STATE}, action) => {
  switch (action.type) {
    case 'LOG_IN':
      return {
        ...state,
        ...action.payload,
      };
    case 'SET_LOCATION':
      return {
        ...state,
        ...action.payload,
      };
    case 'SET_USER_DATA':
      return {
        ...state,
        user: {...action.payload},
      };
    case 'SET_ROLE':
      return {
        ...state,
        role: action.payload,
      };
    default:
      // Return the initial state when no action types match.
      return state;
  }
};
