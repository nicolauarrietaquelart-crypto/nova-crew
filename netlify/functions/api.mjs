import { getStore } from '@netlify/blobs';
import { createDemoApi } from './core.mjs';

// Strongly consistent site-level key/value store, provisioned by Netlify.
export default async function handler(request){
  const store=getStore({name:'nova-crew-demo-v13',consistency:'strong'});
  return createDemoApi(store)(request);
}
