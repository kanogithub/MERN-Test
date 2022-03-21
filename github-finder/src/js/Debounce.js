/**
 * @param func {Function}
 * @param delay {Number}
 *
 * @return {Function}
 */

const debounce = (func, delay) => {
	let inDebounce

	return function () {
		const context = this
		const args = arguments
		clearTimeout(inDebounce)
		inDebounce = setTimeout(() => func.apply(context, args), delay)
	}
}

export default debounce