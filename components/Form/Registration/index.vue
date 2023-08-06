<script lang="ts">
export default {
	name: 'FormRegistration',
}
</script>

<script setup lang="ts">
import { useVuelidate } from '@vuelidate/core'
import debounce from 'lodash.debounce'
import rules from './rules'
import { getInvalidEmailSuggestedDomain } from '@/utils'
import { Dictionary } from '~~/types'
import defaultEmailListSuggestions from '@/utils/const/defaultEmailListSuggestions'
import encriptWithKey from '@/utils/encription'

interface IProps {
	params?: { notice: string | string[] }
}

interface IForm {
	email: string
	first_name: string
	last_name: string
	birth_date: string
	password: string
}

const EXLUDE_PATH_TO_REDIRECT: string[] = []

const route = useRoute()
const router = useRouter()

const { params } = defineProps<IProps>()
const emit = defineEmits(['close'])
const runtimeConfig = useRuntimeConfig()
const nuxtApp = useNuxtApp()
const config = useRuntimeConfig()
const productConfig = useAppConfig()

const { getConfigValue, getComplianceStatus, trackReg } = useSiteConfig()

const { isAuth, getUserId, singUp } = useUser()

const isShowFillBtn = runtimeConfig.public.NODE_TYPE !== 'production'

const error = ref(null)
const isLoading = ref(false)
const checkBoxTermsAndConditions = ref(false)
const isAccountExistButPasswordWrong = ref(false)
const form = reactive<IForm>({
	email: '',
	first_name: '',
	last_name: '',
	birth_date: '',
	password: '',
})

const handleClickFill = () => {
	form.email = `test${+new Date()}@gmail.com`
	form.first_name = 'Test name'
	form.last_name = 'Test surname'
	form.birth_date = '10/10/2000'
	form.password = '111111'
	checkBoxTermsAndConditions.value = true
}

const modal = useModal()

const handleClickLoginLink = () => {
	modal.change({
		componentName: 'FormLogin',
		component: resolveComponent('FormLogin'),
	})
}
const handleClckForgotLink = () => {
	modal.change({
		componentName: 'FormForgotPassword',
		component: resolveComponent('FormForgotPassword'),
		params: { email: form.email },
	})
}

const isShowErrorTermsAndConditions = computed(() => v$.value.$dirty && !checkBoxTermsAndConditions.value)

// Invalid email
const invalidEmailDomain = computed(() => {
	return form.email && !v$.value.email.$invalid ? getInvalidEmailSuggestedDomain(form.email) : ''
})
const invalidEmailNoticeText = computed(() => {
	if (invalidEmailDomain.value && invalidEmailDomain.value === 'general') {
		return nuxtApp.$t('auth.notice.general')
	}
	if (invalidEmailDomain.value && invalidEmailDomain.value !== 'general') {
		return `${nuxtApp.$t('auth.notice.domain')[0]} ${invalidEmailDomain.value}${nuxtApp.$t('auth.notice.domain')[1]}`
	}
	return ''
})

// * Submit form
const getRules = rules(productConfig.const?.fullDateFormat, config.public.product === 'gamble88')
const v$ = useVuelidate(getRules, form)

const dateFormat = computed(() => {
	return nuxtApp.$dayjs.localeData().longDateFormat('L')
})

const dateMask = computed(() => {
	return productConfig.const.dateMask || 'DD/MM/YYYY'
})

const isButtonDisabled = computed(() => {
	return isLoading.value || (v$.value.$invalid && v$.value.$dirty)
})

const generatedErrorByServer = computed(() => {
	return error.value ? nuxtApp.$getErrorByCode(error.value) : null
})

const handleSubmitForm = async () => {
	v$.value.$touch()

	useGA('sing_up_attempt', { event_category: 'auth' })

	if (!v$.value.$invalid && checkBoxTermsAndConditions.value) {
		isLoading.value = true

		const payload = {
			...form,
			birth_date: form.birth_date ? nuxtApp.$dayjs(form.birth_date, dateFormat.value).format('YYYY-MM-DD') : '',
		}

		try {
			encriptWithKey()

			await singUp(payload)
			debounsedTrackForm(`success-form`)
			emit('close')

			useCookie('htprf', { path: '/' }).value = null
			useCookie('_fpdt', { path: '/' }).value = null
			useCookie('sing_up_form').value = null

			useGA('sing_up_success', { event_category: 'auth' })

			if (route.name === 'game-slug' && !route.hash) {
				router.push({ path: route.path, hash: '#real' })
			} else if (!EXLUDE_PATH_TO_REDIRECT.includes(route.path)) {
				router.push({ path: '/checkout/deposit' })
			}
		} catch (err: any) {
			debounsedTrackForm(`error-form`, err?.response?._data?.error || null)
			if (err?.response?._data?.error?.code === 1010) {
				isAccountExistButPasswordWrong.value = true
			} else {
				error.value = err.response
			}
			useGA('sing_up_error', { event_category: 'auth', error_code: err?.response?._data?.error?.code || null })
		} finally {
			isLoading.value = false
		}
	}
}

// * Tracking form
const isTrackSingupForm = getConfigValue('isTrackSingupForm')
const trackForm = async (action: string, err?: any) => {
	if (!isTrackSingupForm) return

	try {
		const wrongFields: any = {}

		if (!err) {
			if (v$.value.email && v$.value.email.$invalid) wrongFields.email = v$.value.email
			if (v$.value.first_name.$dirty && v$.value.first_name.$invalid) wrongFields.first_name = v$.value.first_name
			if (v$.value.last_name.$dirty && v$.value.last_name.$invalid) wrongFields.last_name = v$.value.last_name
			if (v$.value.birth_date.$dirty && v$.value.birth_date.$invalid) wrongFields.birth_date = v$.value.birth_date
			if (v$.value.password.$dirty && v$.value.password.$invalid) wrongFields.password = v$.value.password
		}

		const payload: any = {
			email: form.email,
			fname: form.first_name,
			sname: form.last_name,
			brthdate: form.birth_date,
			pswd: `filled_${form.password.length}`,
			adult_checked: checkBoxTermsAndConditions ? 1 : 0,

			status: isAuth.value ? 1 : 0,
			action,

			wrong_fields: err ? JSON.stringify(err) : JSON.stringify(wrongFields),
		}

		if (isAuth.value) {
			payload.uid = getUserId.value
		}

		await trackReg(payload)
	} catch (err) {
		console.error(err)
	}
}
const debounsedTrackForm = debounce(trackForm, 250, { maxWait: 2000 })

watch(checkBoxTermsAndConditions, () => {
	useGA(`sing_up_field_TnC_${checkBoxTermsAndConditions.value ? 'checked' : 'unchecked'}`, {
		event_category: 'auth',
	})
})

const handleClickTC = (event: Event) => {
	if ((event.target as HTMLElement).tagName.toLowerCase() === 'a') {
		window.open('/terms-and-conditions', '_blank')
	} else {
		checkBoxTermsAndConditions.value = !checkBoxTermsAndConditions.value
	}
}

const handleFocusOut = (field: keyof IForm) => {
	v$.value[field].$touch()

	useGA(`sing_up_field_${field}_${v$.value[field].$invalid && v$.value[field].$dirty ? 'invalid' : 'entered'}`, {
		event_category: 'auth',
	})

	saveFormToCookies()

	debounsedTrackForm(`focus_out_${field}`)
}
onMounted(() => {
	clearAuthCookies()
	debounsedTrackForm('open-modal')
	useGA('sing_up_open_form', { event_category: 'auth' })

	setFormFromCookies()
})
onBeforeUnmount(() => {
	debounsedTrackForm('close-modal')
	isAccountExistButPasswordWrong.value = false
})

const clearAuthCookies = () => {
	useCookie('PHPSESSID').value = null
	useCookie('24bab23d9bdcef04c550e6d4ed7d65df').value = null
	useCookie('ef64a87c44fa08af65307ee976d5411f').value = null
}

// * saveFormToCookies
const cookieForm = useCookie('sing_up_form', { maxAge: 60 * 3, path: '/' })

watch(checkBoxTermsAndConditions, () => saveFormToCookies())

const saveFormToCookies = () => {
	cookieForm.value = JSON.stringify({
		form: {
			email: form.email,
			first_name: form.first_name,
			last_name: form.last_name,
			birth_date: form.birth_date,
		},
		checkBoxTermsAndConditions: checkBoxTermsAndConditions.value,
	})
}

const setFormFromCookies = () => {
	let parsedCookieForm: Dictionary<any> = {}

	try {
		parsedCookieForm = cookieForm.value
			? typeof cookieForm.value === 'string'
				? JSON.parse(cookieForm.value)
				: cookieForm.value
			: {}
	} catch (e) {}

	form.first_name = parsedCookieForm?.form?.first_name || ''
	form.last_name = parsedCookieForm?.form?.last_name || ''
	form.birth_date = parsedCookieForm?.form?.birth_date || ''
	form.email = parsedCookieForm?.form?.email || ''
	checkBoxTermsAndConditions.value = parsedCookieForm?.checkBoxTermsAndConditions || !getComplianceStatus.value || false

	if (form.first_name) v$.value.first_name.$touch()
	if (form.last_name) v$.value.last_name.$touch()
	if (form.birth_date) v$.value.birth_date.$touch()
	if (form.email) v$.value.email.$touch()
}

// * Email List Suggestions
const appConfig = useAppConfig()
const emailListSuggestions = appConfig.const.emailListSuggestions || defaultEmailListSuggestions

const formref: any = ref(null)
const triggerNextField = () => {
	const nextInput = formref.value?.querySelector('input[data-name=input-first-name]')
	if (nextInput) nextInput.focus()
}
</script>

<template>
	<form
		ref="formref"
		class="form form--registration"
		autocomplete="off"
		data-name="fotm-registration"
		@submit.prevent="handleSubmitForm"
	>
		<div class="form__title" data-name="form-title">
			{{ $t('auth.singUpTitle') }}
		</div>

		<div v-if="params && params.notice" class="form__notice">
			{{ params.notice }}
		</div>

		<UIAutocompleteField
			v-model.trim="form.email"
			:label="$t('auth.labelEmail')"
			name="email"
			data-name="email"
			disableAutocomplete
			mountedAutoFocus
			mode="email"
			type="email"
			:options="emailListSuggestions"
			:isShowError="v$.email.$invalid && v$.email.$dirty"
			:errorMsg="$vFieldError(v$.email)"
			:closeBtn="$t('emailAutocompleteCloseBtn')"
			nextInputId="next-field"
			@blur="handleFocusOut('email')"
			@keyup:enter="triggerNextField"
		/>

		<UIField
			id="next-field"
			v-model.trim="form.first_name"
			:label="$t('auth.labelFirstName')"
			name="first_name"
			data-name="first-name"
			disableAutocomplete
			:isShowError="v$.first_name.$invalid && v$.first_name.$dirty"
			:errorMsg="$vFieldError(v$.first_name)"
			@blur="handleFocusOut('first_name')"
		/>
		<UIField
			v-model.trim="form.last_name"
			:label="$t('auth.labelLastName')"
			name="last_name"
			data-name="last-name"
			disableAutocomplete
			:isShowError="v$.last_name.$invalid && v$.last_name.$dirty"
			:errorMsg="$vFieldError(v$.last_name)"
			@blur="handleFocusOut('last_name')"
		/>
		<UIField
			v-model.trim="form.birth_date"
			name="birth_date"
			data-name="birth-date"
			:label="$t('auth.labelDateOfBirth')"
			:propsMask="dateMask"
			disableAutocomplete
			type="birth_date"
			:isShowError="v$.birth_date.$invalid && v$.birth_date.$dirty"
			:errorMsg="$vFieldError(v$.birth_date)"
			@blur="handleFocusOut('birth_date')"
		/>

		<UIField
			v-model.trim="form.password"
			:label="$t('auth.labelPassword')"
			name="password"
			data-name="password"
			type="password"
			disableAutocomplete
			autocompleteValue="new-password"
			:isShowError="v$.password.$invalid && v$.password.$dirty"
			:errorMsg="$vFieldError(v$.password)"
			@blur="handleFocusOut('password')"
		/>

		<UICheckbox
			:key="checkBoxTermsAndConditions"
			:modelValue="checkBoxTermsAndConditions"
			data-name="registration-checkbox"
			@mousedown="handleClickTC"
		>
			{{ $t('auth.checkboxText')[0] }}
			<nuxt-link to="/terms-and-conditions/" target="_blank" data="accept-terms-link">
				{{ $t('auth.linkTermsAndConditions') }}
			</nuxt-link>
			{{ $t('auth.checkboxText')[1] }}
		</UICheckbox>

		<FormError v-if="isAccountExistButPasswordWrong" data-name="form-error"
			><div>
				{{ $t('auth.errorAccountExistsButPasswordWrong')[0] }}
				<span class="link-white" @click="handleClckForgotLink">{{
					$t('auth.errorAccountExistsButPasswordWrong')[1]
				}}</span
				>{{ $t('auth.errorAccountExistsButPasswordWrong')[2] }}
			</div></FormError
		>

		<FormError v-else-if="generatedErrorByServer" :text="generatedErrorByServer" data-name="form-error" />

		<FormError v-else-if="isShowErrorTermsAndConditions" :text="$t('auth.checkboxErrorText')" data-name="form-error" />

		<div v-if="invalidEmailNoticeText" class="form__notice form__notice--email" data-name="form-warning">
			<UIIcon name="warning" />
			<span>{{ invalidEmailNoticeText }}</span>
		</div>

		<div class="form__buttons form__buttons--single">
			<div class="submit-wrapper">
				<UIButton
					btnType="subprimary"
					class="form__button"
					data-name="submit-button"
					type="submit"
					:disabled="isButtonDisabled"
					:isLoading="isLoading"
					>{{ $t('auth.singUpBtn') }}</UIButton
				>
			</div>
			<UIButton
				v-if="isShowFillBtn"
				btnType="gray"
				data-name="fill-button"
				class="form__button"
				type="button"
				style="margin-top: 12px"
				@click="handleClickFill"
				>Fill</UIButton
			>
		</div>

		<p class="form__text">
			{{ $t('auth.ifYouAlreadyRegistred') }}
			<span class="link" data-name="login-link" @mousedown="handleClickLoginLink">{{ $t('auth.loginTextLink') }}</span>
		</p>
		<p class="form__text" v-html="$t('auth.bonusText')"></p>
	</form>
</template>
