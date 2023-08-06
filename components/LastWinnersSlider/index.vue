<script lang="ts">
export default {
	name: 'LastWinnersSlider',
}
</script>

<script setup lang="ts">
import Swiper, { Navigation, Pagination, Autoplay } from 'swiper'
import swiperOptions from './swiperOptions'
import { getUrlToGame } from '@/modules/Games/utils'

const runtimeConfig = useRuntimeConfig()
const nuxtApp = useNuxtApp()

const headers = useRequestHeaders()
const router = useRouter()

const { getBalance } = useUser()

interface IItemaGame {
	active: boolean
	name: string
	slug: string
}

interface IList {
	items: {
		user_name: string
		game: IItemaGame
		bet: number
		win: {
			amount: number
		}
	}[]
}
const { data: list } = await useAsyncData<IList>(
	'lastWinners',
	async () => await useApi('getLastWinners', { params: { count: 30 }, headers })
)

// Swiper
let engine: any
onMounted(() => {
	Swiper.use([Pagination, Autoplay, Navigation])

	nextTick(() => {
		engine = new Swiper('.last-winners-slider__container', swiperOptions)
	})
})

onBeforeUnmount(() => {
	if (engine && list.value?.items?.length && list.value.items.length > 2) engine.destroy?.()
})

const modal = useModal()

const handleClickGame = (game: IItemaGame) => {
	if (getBalance.value > 0) {
		return goToGame(true, game)
	}
	return modal.open({
		componentName: 'GamesModal',
		component: resolveComponent('GamesModal'),
		props: { ...game, isBalanceModal: true },
	})
}
const goToGame = (isReal: boolean, game: IItemaGame) => {
	if (nuxtApp.$device?.isMobile()) {
		const href = getUrlToGame({ id: game.slug }, isReal, runtimeConfig)
		window.location.href = href
	} else {
		return router.push({
			path: `/game/${game.slug}`,
			hash: isReal ? '#real' : '',
		})
	}
}
</script>

<template>
	<div v-if="list && list.items.length && list.items.length > 2" class="last-winners-slider">
		<div class="swiper last-winners-slider__container" :loadtheme="false">
			<div class="swiper-wrapper">
				<div v-for="(item, i) in list.items" :key="i" class="swiper-slide last-winners-slider__item">
					<span>
						{{ item.user_name }} {{ useFormatAmount(item.win.amount) }}
						{{ $t('lastWinners.pretext') }}
						<span v-if="item.game.active" class="game-link" @click="handleClickGame(item.game)">{{
							item.game.name
						}}</span>
						<template v-else>
							{{ item.game.name }}
						</template>
					</span>
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="scss" src="./style.scss"></style>
