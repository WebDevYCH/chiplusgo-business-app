import {post} from './base.js';

export const Users = {
  createSubaccount: data =>
    post(`/createSubAccount`, {data})
      .then(({data}) => data)
      .catch(({error}) => error),
  deleteSubaccount: data =>
    post(`/deleteSubAccount`, {data})
      .then(({data}) => data)
      .catch(error => console.log(error)),
};
