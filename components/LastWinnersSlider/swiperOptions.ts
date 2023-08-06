import type { SwiperOptions } from 'swiper/types'

export default <SwiperOptions>{
	slidesPerView: 'auto',
	spaceBetween: 6,
	speed: 1000,
	autoplay: {
		delay: 4000,
		disableOnInteraction: false,
	},
}
