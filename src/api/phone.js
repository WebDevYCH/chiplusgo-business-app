import {post} from './base.js';

export const Phone = {
  checkPhone: data =>
    post(`/checkPhone`, data)
      .then(({data}) => data)
      .catch(e => e),
  sendSMS: data => post(`/textmessageV2`, data).then(({data}) => data),
};
