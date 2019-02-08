/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Florent Cailhol @ooflorent
*/

"use strict";

const { compareChunksNatural } = require("../util/comparators");
const {
	getFullChunkName,
	getUsedChunkIds,
	assignDeterministicIds
} = require("./IdHelpers");

/** @typedef {import("../Compiler")} Compiler */
/** @typedef {import("../Module")} Module */

class DeterministicChunkIdsPlugin {
	constructor(options) {
		this.options = options || {};
	}

	/**
	 * @param {Compiler} compiler the compiler instance
	 * @returns {void}
	 */
	apply(compiler) {
		compiler.hooks.compilation.tap(
			"DeterministicChunkIdsPlugin",
			compilation => {
				compilation.hooks.chunkIds.tap(
					"DeterministicChunkIdsPlugin",
					chunks => {
						const chunkGraph = compilation.chunkGraph;
						const context = this.options.context
							? this.options.context
							: compiler.context;

						const compareNatural = compareChunksNatural(chunkGraph);

						const usedIds = getUsedChunkIds(compilation);
						assignDeterministicIds(
							Array.from(chunks).filter(chunk => {
								return chunk.id === null;
							}),
							chunk =>
								getFullChunkName(chunk, chunkGraph, context, compiler.root),
							compareNatural,
							this.options.maxLength || 3,
							(chunk, id) => {
								const size = usedIds.size;
								usedIds.add(`${id}`);
								if (size === usedIds.size) return false;
								chunk.id = id;
								chunk.ids = [id];
								return true;
							}
						);
					}
				);
			}
		);
	}
}

module.exports = DeterministicChunkIdsPlugin;
