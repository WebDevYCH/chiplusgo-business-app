import {post} from './base.js';

export const Emails = {
  sendEmail: data =>
    post(`/sendEmail`, {data})
      .then(({data}) => data)
      .catch(({error}) => error),

};
