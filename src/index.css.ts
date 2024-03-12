import { Styles } from "@ijstech/components";
const Theme = Styles.Theme.ThemeVars;

export const formStyle = Styles.style({
    $nest: {
        'i-input': {
            $nest: {
                '> input': {
                    background: Theme.colors.secondary.dark
                }
            }
        },
        'i-combo-box': {
            $nest: {
                '.selection': {
                    background: Theme.colors.secondary.dark
                },
                '.selection input': {
                    background: Theme.colors.secondary.dark,
                    color: Theme.colors.secondary.contrastText
                },
                '.icon-btn': {
                    background: Theme.colors.secondary.dark
                },
                '> .icon-btn:hover': {
                    background: Theme.colors.secondary.dark
                },
            }
        }
    }
});

export const imageStyle = Styles.style({
    transform: 'translateY(-100%)',
    $nest: {
        '&>img': {
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center'
        }
    }
});

export const tableStyle = Styles.style({
    $nest: {
        '.i-table-cell:first-child': {
            paddingLeft: 0
        },
        '.i-table-cell:last-child': {
            paddingRight: 0
        },
        '.i-table-body > tr:hover td': {
            color: Theme.text.primary
        }
    }
});