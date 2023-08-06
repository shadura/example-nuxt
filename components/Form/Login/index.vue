<script lang="ts">
export default {
	name: 'FormLogin',
}
</script>

<script setup lang="ts">
import { useVuelidate } from '@vuelidate/core'
import rules from './rules'
import encriptWithKey from '@/utils/encription'

interface IProps {
	params?: { notice?: string | string[]; email?: string }
}
const { params } = defineProps<IProps>()
const emit = defineEmits(['close'])
const runtimeConfig = useRuntimeConfig()
const nuxtApp = useNuxtApp()

const route = useRoute()
const router = useRouter()

const { singIn } = useUser()

const isLoading = ref(false)

const error = ref<any>(null)
const form = reactive({
	login: '',
	password: '',
})

onMounted(() => {
	clearAuthCookies()
	if (params?.email) form.login = params.email
})
const clearAuthCookies = () => {
	useCookie('PHPSESSID').value = null
	useCookie('24bab23d9bdcef04c550e6d4ed7d65df').value = null
	useCookie('ef64a87c44fa08af65307ee976d5411f').value = null
}

const isShowFillBtn = runtimeConfig.public.NODE_TYPE !== 'production'

const handleClickFill = () => {
	form.login = 'test1@gmail.com'
	form.password = '111111'
}

const modal = useModal()

const handleClckRegistrationLink = () => {
	modal.change({
		componentName: 'FormRegistration',
		component: resolveComponent('FormRegistration'),
		params: { email: form.login },
	})
}
const handleClckForgotLink = () => {
	modal.change({
		componentName: 'FormForgotPassword',
		component: resolveComponent('FormForgotPassword'),
		params: { email: form.login },
	})
}

const v$ = useVuelidate(rules, form)

const isButtonDisabled = computed(() => {
	return isLoading.value || (v$.value.$invalid && v$.value.$dirty)
})

const generatedErrorByServer = computed(() => {
	return error.value ? nuxtApp.$getErrorByCode(error.value) : null
})

const handleSubmitForm = async () => {
	v$.value.$touch()
	if (v$.value.$invalid) return

	try {
		isLoading.value = true

		encriptWithKey()

		await singIn(form)
		emit('close')

		useCookie('htprf', { path: '/' }).value = null
		useCookie('_fpdt', { path: '/' }).value = null
		useCookie('sing_up_form').value = null

		if (route.name === 'game-slug' && !route.hash) {
			router.push({ path: route.path, hash: '#real' })
		}

		useGA('sing_in_success', { event_category: 'auth' })
	} catch (err: any) {
		error.value = err.response
		useGA('sing_in_error', { event_category: 'auth' })
	} finally {
		isLoading.value = false
	}
}
</script>

<template>
	<form class="form form--login" data-name="fotm-login" @submit.prevent="handleSubmitForm">
		<div class="form__title" data-name="form-title">
			{{ $t('auth.singInTitle') }}
		</div>

		<div v-if="params && params.notice" class="form__notice">
			{{ params.notice[0] }}
			<div v-html="params.notice[1]"></div>
		</div>

		<UIField
			v-model.trim="form.login"
			:label="$t('auth.labelEmail')"
			name="email"
			data-name="email"
			type="email"
			mountedAutoFocus
			:isShowError="v$.login.$invalid && v$.login.$dirty"
			:errorMsg="$vFieldError(v$.login)"
			@blur="v$.login.$touch()"
		/>
		<UIField
			v-model.trim="form.password"
			:label="$t('auth.labelPassword')"
			name="password"
			data-name="password"
			type="password"
			disableAutocomplete
			autocompleteValue="current-password"
			:isShowError="v$.password.$invalid && v$.password.$dirty"
			:errorMsg="$vFieldError(v$.password)"
			@blur="v$.password.$touch()"
		/>

		<div class="form__buttons form__buttons--single">
			<UIButton
				btnType="subprimary"
				data-name="submit-button"
				class="form__button"
				type="submit"
				:disabled="isButtonDisabled"
				:isLoading="isLoading"
				>{{ $t('auth.singInBtn') }}</UIButton
			>
			<UIButton
				v-if="isShowFillBtn"
				btnType="gray"
				class="form__button"
				type="button"
				data-name="fill-button"
				style="margin-top: 12px"
				@click="handleClickFill"
				>Fill</UIButton
			>
		</div>

		<FormError v-if="generatedErrorByServer" :text="generatedErrorByServer" />

		<p class="form__text">
			{{ $t('auth.singUpText') }}
			<span class="link" data-name="registration-text" @mousedown="handleClckRegistrationLink">{{
				$t('auth.singUpBtn')
			}}</span>
		</p>
		<p class="form__text">
			<span class="link" data-name="restore-password-link" @click="handleClckForgotLink">{{
				$t('auth.restorePasswordLink')
			}}</span>
		</p>
	</form>
</template>
