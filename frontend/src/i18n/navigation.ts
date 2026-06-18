import {createNavigation} from 'next-intl/navigation';
import { locales } from './config';

export const {Link, redirect, useRouter, usePathname} = 
createNavigation({
  locales: locales
});