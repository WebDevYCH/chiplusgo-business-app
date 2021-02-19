import {combineReducers} from 'redux';
import user from './userReducer';
import filter from './filterReducer';
import data from './dataReducer';

export default combineReducers({
  user,
  filter,
  data
});
