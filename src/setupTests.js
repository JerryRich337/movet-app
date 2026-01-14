// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// jsdom (Jest) doesn't provide ResizeObserver by default.
// ApexCharts (and some AntD internals) expect it to exist.
if (typeof window !== 'undefined' && !window.ResizeObserver) {
	window.ResizeObserver = class ResizeObserver {
		observe() {}
		unobserve() {}
		disconnect() {}
	};
}

if (typeof window !== 'undefined' && !window.matchMedia) {
	window.matchMedia = () => ({
		matches: false,
		media: '',
		onchange: null,
		addListener: () => {},
		removeListener: () => {},
		addEventListener: () => {},
		removeEventListener: () => {},
		dispatchEvent: () => false,
	});
}

// jsdom defines window.scrollTo but throws "Not implemented" when called.
// Our app uses it in effects (Dashboard/App), so always override it.
if (typeof window !== 'undefined') {
	window.scrollTo = () => {};
}

// ApexCharts expects certain SVG APIs that jsdom doesn't fully implement.
if (typeof SVGElement !== 'undefined' && !SVGElement.prototype.getScreenCTM) {
	const identityMatrix = {
		a: 1,
		b: 0,
		c: 0,
		d: 1,
		e: 0,
		f: 0,
		inverse() {
			return identityMatrix;
		},
	};

	// eslint-disable-next-line no-extend-native
	SVGElement.prototype.getScreenCTM = () => identityMatrix;
}

if (typeof SVGSVGElement !== 'undefined' && !SVGSVGElement.prototype.createSVGPoint) {
	// eslint-disable-next-line no-extend-native
	SVGSVGElement.prototype.createSVGPoint = () => ({
		x: 0,
		y: 0,
		matrixTransform: () => ({ x: 0, y: 0 }),
	});
}
