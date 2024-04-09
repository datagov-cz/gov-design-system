import { ValueOf } from '../../types/interfaces'

enum Types {
	BASIC = 'basic',
	COMPLEX = 'complex',
	COLORED = 'colored',
	BOOTSTRAP = 'bootstrap'
}
export type Type = `${ValueOf<typeof Types>}`

export const IconClass = {
	root: 'gov-icon',
	holder: 'gov-icon__holder',
}
