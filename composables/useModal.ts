import { disablePageScroll, enablePageScroll, clearQueueScrollLocks } from 'scroll-lock'

interface IModalParams {
	componentName: string
	component: any
	params?: any
	props?: any
}

interface IModal extends IModalParams {
	isOpen: boolean
}

const useModal = () => {
	// const nuxtApp = useNuxtApp()
	// const runtimeConfig = useRuntimeConfig()

	// const isDevelopment = runtimeConfig.public.NODE_TYPE !== 'production'

	const modalConfig = useState<IModal>('modalConfig', () => {
		return {
			isOpen: false,
			componentName: '',
			params: {},
			props: {},
			component: null,
		}
	})

	const open = ({ componentName = '', component = null, params = {}, props = {} }: IModalParams) => {
		if (componentName) {
			modalConfig.value.params = params
			modalConfig.value.props = props
			modalConfig.value.componentName = componentName
			modalConfig.value.component = component
			modalConfig.value.isOpen = true

			if (process.client) disablePageScroll()
		}
	}

	const close = (param?: any) => {
		if (process.client) {
			clearQueueScrollLocks()
			enablePageScroll()
		}

		modalConfig.value.isOpen = false

		if (modalConfig.value.params.closeCallback && typeof modalConfig.value.params.closeCallback === 'function') {
			modalConfig.value.params.closeCallback(param)
		}

		setTimeout(() => {
			modalConfig.value.params = {}
			modalConfig.value.props = {}
			modalConfig.value.componentName = ''
			modalConfig.value.component = null
		}, 300)
	}

	const change = ({ componentName = '', component = null, params = {} }: IModalParams) => {
		if (componentName) {
			modalConfig.value.params = params
			modalConfig.value.componentName = componentName
			modalConfig.value.component = component
			modalConfig.value.isOpen = true
		}
	}

	const isOpen = computed(() => modalConfig.value.isOpen)

	return {
		modalConfig,
		open,
		close,
		change,
		isOpen,
	}
}
export default useModal
