import { lazyWithPreload } from 'react-lazy-with-preload';

export const Dashboard = lazyWithPreload(() => import('./Dashboard'));
export const Highlights = lazyWithPreload(() => import('./Highlights'));
export const Study = lazyWithPreload(() => import('./Study'));
export const Settings = lazyWithPreload(() => import('./Settings'));
export const StudySession = lazyWithPreload(() => import('./StudySession'));
