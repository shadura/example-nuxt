import getValidators from '~~/utils/getValidators'

export default (fullDateFormat = 'DD/MM/YYYY', isKorean = false) =>
	getValidators({
		email: ['required', 'email'],
		first_name: [
			'required',
			isKorean ? '' : 'specialName',
			{ name: 'passwordMinLength', validator: 'minLength', params: [1] },
			{ name: 'passwordMaxLength', validator: 'maxLength', params: [256] },
		],
		last_name: [
			'required',
			isKorean ? '' : 'specialName',
			{ name: 'passwordMinLength', validator: 'minLength', params: [1] },
			{ name: 'passwordMaxLength', validator: 'maxLength', params: [256] },
		],
		birth_date: [
			'required',
			{
				name: 'birthDate',
				validator: 'birthDate',
				params: [fullDateFormat],
			},
		],

		password: [
			'required',
			'password',
			'withoutSpaces',
			{ name: 'passwordMinLength', validator: 'minLength', params: [6] },
			{ name: 'passwordMaxLength', validator: 'maxLength', params: [256] },
		],
	})
