import client from './client.js';
export const login = (values) => client.post('/auth/login', values);
export const getCurrentUser = () => client.get('/auth/me');
export const changePassword = (values) => client.post('/auth/change-password', values);
export const logout = () => client.post('/auth/logout');
