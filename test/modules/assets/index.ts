import {application} from '@ijstech/components';
import { Styles } from '@ijstech/components';
const moduleDir = application.currentModuleDir;

function fullPath(path: string): string{
    return `${moduleDir}/${path}`
};
export default {
    logo: {
        header: {
            desktop: fullPath('img/logo.svg'),
            tablet: {
                light: fullPath('img/logo-mobile.svg'),
                dark: fullPath('img/logo-mobile-dark.svg'),
            },
            mobile: {
                light: fullPath('img/logo-mobile.svg'),
                dark: fullPath('img/logo-mobile-dark.svg'),
            }
        },
        footer: {
            light: fullPath('img/logo-mobile.svg'),
            dark: fullPath('img/logo-mobile-dark.svg'),
        }
    },
    fullPath
};