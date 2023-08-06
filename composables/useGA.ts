import { Dictionary, useGtag } from 'vue-gtag-next'

export const useGA = (action: string, params?: Dictionary<string | number | null>) => {
	const runtimeConfig = useRuntimeConfig()
	if (!runtimeConfig.public.GOOGLE_ANALYTICS_ID) return

	const { event } = useGtag()

	event(action, params || {})
}
