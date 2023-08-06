<script setup lang="ts">
const route = useRoute()

const emit = defineEmits(['close'])

const { isAuth, login, getBalance, isUserHasCashback } = useUser()
const { getNav } = useSiteConfig()

// * Nav
const navList = computed(() => getNav('burger', { isAuth, isUserHasCashback }))

const modal = useModal()
const handleClickRegistration = () => {
	modal.open({ componentName: 'FormRegistration', component: resolveComponent('FormRegistration') })
}
const closeBurger = () => {
	emit('close')
}

watch(
	() => route.path,
	() => {
		emit('close')
	}
)

onMounted(() => {
	window.addEventListener('resize', closeBurger)
})
onUnmounted(() => {
	window.removeEventListener('resize', closeBurger)
})
</script>

<template>
	<div :class="[$style['burger']]">
		<div :class="$style['close']" data-name="close-burger" @click="closeBurger">
			<UIIcon name="close-white" sprite="main" />
		</div>
		<div :class="$style['inner']" data-scroll-lock-scrollable>
			<div v-if="isAuth" :class="$style['profile']">
				<ProfilePreview :userLoginAlias="login" :balance="getBalance" isInBurger @click="closeBurger" />
				<div :class="$style['profile-actions']">
					<UIButton btnType="primary" href="/checkout/deposit" @click="closeBurger">
						{{ $t('header.cashierBtn') }}
					</UIButton>
				</div>
			</div>
			<BannersItem
				v-else
				:class="$style['profile-banner']"
				:title="$t('burger.banner.title')"
				:text="$t('burger.banner.text')"
				:button="{ text: $t('burger.banner.button') }"
				:images="{
					small_url: '/images/welcome/banner/burger_768.webp',
					tiny_url: '/images/welcome/banner/burger_576.webp',
				}"
				:bannerId="0"
				:isShowButton="true"
				@click:button="handleClickRegistration"
			/>

			<Nav place="burger" :list="navList" @click="closeBurger" />
		</div>
	</div>
</template>

<style lang="scss" src="./style.scss" module></style>
