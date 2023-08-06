import { formatedAmount } from '~~/utils/currency'

interface IParams {
	currency: string
	place: 'before' | 'after'
	separator: string
	thousandsSeparator: string
	decimal: boolean
}
export const useFormatAmount = (amount: number, params: Partial<IParams> = {}) => {
	const { getCurrency } = useSiteConfig()
	const currency = getCurrency()

	const appConfig = useAppConfig()
	const thousandsSeparator = appConfig.const.thousandsSeparator || ' '
	const decimalSeparator = appConfig.const.decimalSeparator || ','
	const place = appConfig.const.currencyPosition || 'after'

	return formatedAmount(amount, { currency, thousandsSeparator, decimalSeparator, place, ...params })
}
