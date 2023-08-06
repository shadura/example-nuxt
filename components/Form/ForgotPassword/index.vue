<script lang="ts">
export default {
	name: 'FormForgotPassword',
}
</script>

<script setup lang="ts">
import { useVuelidate } from '@vuelidate/core'
import rules from './rules'

interface IProps {
	params?: { notice: string | string[]; email?: string }
}
const { params } = defineProps<IProps>()

const nuxtApp = useNuxtApp()

const { restorePassword } = useUser()

const isLoading = ref(false)

const error = ref<any>(null)
const form = reactive({
	email: '',
})

onMounted(() => {
	if (params?.email) form.email = params.email
})

const isButtonDisabled = computed(() => {
	return isLoading.value || (v$.value.$invalid && v$.value.$dirty)
})

const generatedErrorByServer = computed(() => {
	return error.value ? nuxtApp.$getErrorByCode(error.value) : null
})

const v$ = useVuelidate(rules, form)
const modal = useModal()
const handleSubmitForm = async () => {
	v$.value.$touch()
	if (v$.value.$invalid) return

	try {
		isLoading.value = true

		await restorePassword(form)
		modal.change({
			componentName: 'FormLogin',
			component: resolveComponent('FormLogin'),
			params: {
				notice: [nuxtApp.$t('auth.newPaswordSentOnEmail'), nuxtApp.$t('auth.checkSpamMessage')],
				email: form.email,
			},
		})
	} catch (err: any) {
		error.value = err.response
		console.error('error', err)
	} finally {
		isLoading.value = false
	}
}
</script>

<template>
	<form class="form form--login" data-name="form-forgot-password" @submit.prevent="handleSubmitForm">
		<div class="form__title" data-name="form-title">
			{{ $t('auth.restoreTitle') }}
		</div>

		<div v-if="params && params.notice" class="form__notice">
			{{ params.notice }}
		</div>

		<UIField
			v-model.trim="form.email"
			:label="$t('auth.labelEmail')"
			name="email"
			data-name="email"
			type="email"
			mountedAutoFocus
			:isShowError="generatedErrorByServer || (v$.email.$invalid && v$.email.$dirty)"
			:errorMsg="generatedErrorByServer || $vFieldError(v$.email)"
			@focus="error = null"
			@blur="v$.email.$touch()"
		/>

		<div class="form__buttons form__buttons--single">
			<UIButton
				btnType="primary"
				class="form__button"
				type="submit"
				data-name="submit-button"
				:disabled="isButtonDisabled"
				:isLoading="isLoading"
				>{{ $t('auth.restoreBtn') }}</UIButton
			>
		</div>
	</form>
</template>
