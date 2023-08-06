<script setup lang="ts">
interface IProps {
	text?: string
}

const { text } = defineProps<IProps>()
</script>

<template>
	<div class="form__error" data-name="form-error">
		<UIIcon name="attention-white" />
		<span v-html="text"></span>
		<slot />
	</div>
</template>
