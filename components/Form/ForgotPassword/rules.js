import getValidators from '~~/utils/getValidators'

export default () =>
	getValidators({
		email: ['required', 'email'],
	})
