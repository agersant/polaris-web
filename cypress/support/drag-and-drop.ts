/// <reference types="cypress" />

// Originally from: https://github.com/4teamwork/cypress-drag-drop/blob/2555c6ef021e59e151a2a1672e54b16c4ed8470d/index.js

// Vendored here because:
// - A poorly vetted PR broke the library
// - Maintainer is unresponsive
// - Original repository is JS build-system hell, would require lots of changes to become a maintainable fork

/*
 Local changes:
 	- Reverted https://github.com/4teamwork/cypress-drag-drop/pull/86
	  Tracking issue: https://github.com/4teamwork/cypress-drag-drop/issues/88
	- Updated prototype for `omit` to be valid typescript
	- Adapted typescript definitions from https://github.com/4teamwork/cypress-drag-drop/blob/2555c6ef021e59e151a2a1672e54b16c4ed8470d/index.d.ts
	- Added export {};
*/

const dataTransfer = new DataTransfer();

function omit(object = {}, keys: string[] = []) {
	return Object.entries(object).reduce((accum, [key, value]) => (key in keys ? accum : { ...accum, [key]: value }), {});
}

function isAttached(element) {
	return !!element.closest("html");
}

const DragSimulator = {
	MAX_TRIES: 5,
	DELAY_INTERVAL_MS: 10,
	counter: 0,
	targetElement: null,
	rectsEqual(r1, r2) {
		return r1.top === r2.top && r1.right === r2.right && r1.bottom === r2.bottom && r1.left === r2.left;
	},
	createDefaultOptions(options) {
		const commonOptions = omit(options, ["source", "target"]);
		const source = { ...commonOptions, ...options.source };
		const target = { ...commonOptions, ...options.target };
		return { source, target };
	},
	get dropped() {
		const currentSourcePosition = this.source.getBoundingClientRect();
		return !this.rectsEqual(this.initialSourcePosition, currentSourcePosition);
	},
	get hasTriesLeft() {
		return this.counter < this.MAX_TRIES;
	},
	set target(target) {
		this.targetElement = target;
	},
	get target() {
		return cy.wrap(this.targetElement);
	},
	dragstart(clientPosition = {}) {
		return cy
			.wrap(this.source)
			.trigger("pointerdown", {
				which: 1,
				button: 0,
				...clientPosition,
				eventConstructor: "PointerEvent",
				...this.options.source,
			})
			.trigger("mousedown", {
				which: 1,
				button: 0,
				...clientPosition,
				eventConstructor: "MouseEvent",
				...this.options.source,
			})
			.trigger("dragstart", { dataTransfer, eventConstructor: "DragEvent", ...this.options.source });
	},
	drop(clientPosition = {}) {
		return this.target
			.trigger("drop", {
				dataTransfer,
				eventConstructor: "DragEvent",
				...this.options.target,
			})
			.then(() => {
				if (isAttached(this.targetElement)) {
					this.target
						.trigger("mouseup", {
							which: 1,
							button: 0,
							...clientPosition,
							eventConstructor: "MouseEvent",
							...this.options.target,
						})
						.then(() => {
							if (isAttached(this.targetElement)) {
								this.target.trigger("pointerup", {
									which: 1,
									button: 0,
									...clientPosition,
									eventConstructor: "PointerEvent",
									...this.options.target,
								});
							}
						});
				}
			});
	},
	dragover(clientPosition = {}) {
		if (!this.counter || (!this.dropped && this.hasTriesLeft)) {
			this.counter += 1;
			return this.target
				.trigger("dragover", {
					dataTransfer,
					eventConstructor: "DragEvent",
					...this.options.target,
				})
				.trigger("mousemove", {
					...this.options.target,
					...clientPosition,
					eventConstructor: "MouseEvent",
				})
				.trigger("pointermove", {
					...this.options.target,
					...clientPosition,
					eventConstructor: "PointerEvent",
				})
				.wait(this.DELAY_INTERVAL_MS)
				.then(() => this.dragover(clientPosition));
		}
		if (!this.dropped) {
			console.error(`Exceeded maximum tries of: ${this.MAX_TRIES}, aborting`);
		}
	},
	init(source, target, options = {}) {
		this.options = this.createDefaultOptions(options);
		this.counter = 0;
		this.source = source.get(0);
		this.initialSourcePosition = this.source.getBoundingClientRect();
		return cy.get(target).then(targetWrapper => {
			this.target = targetWrapper.get(0);
		});
	},
	drag(sourceWrapper, targetSelector, options) {
		this.init(sourceWrapper, targetSelector, options)
			.then(() => this.dragstart())
			.then(() => this.dragover())
			.then(() => this.drop())
			.then(() => true);
	},
	move(sourceWrapper, options) {
		const { deltaX, deltaY } = options;
		const { top, left } = sourceWrapper.offset();
		const finalCoords = { clientX: left + deltaX, clientY: top + deltaY };
		this.init(sourceWrapper, sourceWrapper, options)
			.then(() => this.dragstart({ clientX: left, clientY: top }))
			.then(() => this.dragover(finalCoords))
			.then(() => this.drop(finalCoords));
	},
};

function addChildCommand(name, command) {
	Cypress.Commands.add(name, { prevSubject: "element" }, (...args) => command(...args));
}

addChildCommand("drag", DragSimulator.drag.bind(DragSimulator));
addChildCommand("move", DragSimulator.move.bind(DragSimulator));

type Options = Partial<
	Cypress.ClickOptions & {
		source: Cypress.ClickOptions;
		target: Cypress.ClickOptions;
	}
>;

type MoveOptions = Partial<
	Cypress.ClickOptions & {
		deltaX: number;
		deltaY: number;
	}
>;

declare global {
	namespace Cypress {
		interface Chainable<Subject> {
			drag<K extends keyof HTMLElementTagNameMap>(targetSelector: K, options?: Options): true;
			drag<E extends Node = HTMLElement>(targetSelector: string, options?: Options): true;
			drag(targetAlias: string, options?: Options): true;
			move(options: MoveOptions): Chainable<Element>;
		}
	}
}

export {};
