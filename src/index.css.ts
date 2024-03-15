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

export const invoiceCardStyle = Styles.style({
    background: 'linear-gradient(40deg, #1d1d1d 50%, rgb(100 69 22 / 62%), #1d1d1d)',
    $nest: {
        '&.disabled': {
            opacity: 0.7,
            background: 'linear-gradient(40deg, #1d1d1d 50%, #383838, #1d1d1d)',
        }
    }
})