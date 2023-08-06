<script lang="ts">
export default {
	name: 'NavContainer',
}
</script>

<script setup lang="ts">
import type { INavMainItem, NavItemPlace } from '@/types/navList'

const nuxtApp = useNuxtApp()
const runtimeConfig = useRuntimeConfig()

const { getUserToPayoutCashbackCount } = useUser()

interface IProps {
	list: INavMainItem[]
	place: NavItemPlace
	seoSublinks?: { label: string; link: string }[]
}
const props = defineProps<IProps>()

const getIconName = (icon: string) => {
	if (
		props.place === 'burger' &&
		(runtimeConfig.public.product === 'pokiesurf' || runtimeConfig.public.product === 'spinstralia') &&
		icon === 'bonus'
	)
		return 'bonus-accent'
	return icon
}

const formatedList = computed(() => {
	return props.list.map((item) => {
		return {
			...item,
			name: nuxtApp.$t(`nav.${item.name}`),
			icon: getIconName(item.icon),
		}
	})
})

const emit = defineEmits(['click'])
</script>

<template>
	<UINavList
		:list="formatedList"
		:place="place"
		:seoSublinks="seoSublinks"
		:userToPayoutCashbackCount="getUserToPayoutCashbackCount || 0"
		@click="emit('click')"
	/>
</template>
