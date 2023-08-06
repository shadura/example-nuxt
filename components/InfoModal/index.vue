<script setup lang="ts">
interface IProps {
	item: {
		defaultImage: string
		title: string
		content: string
		description?: string
		conditions?: string
	}
}

const { item } = defineProps<IProps>()

const emit = defineEmits(['close'])

const handleClickClose = () => emit('close')
</script>

<template>
	<div :class="[$style['modal'], $style['modal--with-content']]">
		<div v-if="item.defaultImage || item.title" :class="$style['preview']">
			<UIImage :default-image="item.defaultImage" :alt="item.title" :class="$style['image']" />
			<span :class="[$style['info']]">
				<h3 :class="$style['title']">{{ item.title }}</h3>
				<span v-if="item.description" :class="$style['description']">{{ item.description }}</span>
			</span>
		</div>

		<div v-if="item.content || item.conditions" :class="$style['content']" v-html="item.content || item.conditions" />

		<div :class="$style['btn']">
			<UIButton types="subprimary" size="big" @click="handleClickClose">{{ $t('offers.infoModal.btn') }}</UIButton>
		</div>
	</div>
</template>

<style lang="scss" src="./style.scss" module></style>
