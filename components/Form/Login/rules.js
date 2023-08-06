import getValidators from '~~/utils/getValidators'

export default () =>
	getValidators({
		login: ['required', 'email'],
		password: [
			'required',
			'withoutSpaces',
			'password',
			{ name: 'passwordMinLength', validator: 'minLength', params: [6] },
			{ name: 'passwordMaxLength', validator: 'maxLength', params: [256] },
		],
	})
