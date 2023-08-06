<script lang="ts">
export default {
	name: 'Modal',
}
</script>
<script setup lang="ts">
const { modalConfig, close, isOpen } = useModal()

const computedStyles = computed(() => {
	return modalConfig.value.params.width ? { width: `${modalConfig.value.params.width}px` } : {}
})

const isCloseBtnOutside = computed(() => {
	return modalConfig.value.params.closeBtnOutside || false
})

const handleClickClose = () => {
	close()
}

const handleEmit = (val: any) => {
	if (modalConfig.value.params.emitCallback && typeof modalConfig.value.params.emitCallback === 'function') {
		modalConfig.value.params.emitCallback(val)
	}
}
</script>

<template>
	<div :class="[$style['modal'], { [$style['modal--open']]: isOpen }]" style="visibility: hidden">
		<div :class="$style['modal-over']" @click="handleClickClose"></div>
		<div
			:class="[
				$style['modal-box'],
				$style[`modal--${modalConfig.componentName}`],
				{
					[$style['modal-box--popup']]: modalConfig.params.isPopup,
					[$style['modal-box-bg']]: !modalConfig.params.isPopup,
				},
			]"
			:style="computedStyles"
		>
			<button
				:class="[$style['close'], { [$style['close--outside']]: isCloseBtnOutside }]"
				data-name="close"
				@click="handleClickClose"
			>
				<UIIcon :name="isCloseBtnOutside ? 'close-white' : 'close'" sprite="main" />
			</button>
			<div
				v-if="modalConfig.componentName"
				:class="[
					$style['modal-inner'],
					{ [$style['modal-inner--popup']]: modalConfig.params.isPopup },
					{ [$style['modal-custom-bg']]: modalConfig.params.isPopup },
				]"
				data-scroll-lock-scrollable
			>
				<component
					:is="modalConfig.component"
					:params="modalConfig.params"
					:item="modalConfig.props"
					@close="handleClickClose"
					v-on:[modalConfig.params.listenEmit]="handleEmit"
				/>
			</div>
		</div>
	</div>
</template>

<style lang="scss" src="./style.scss" module></style>
