import {createRand} from "./rand.js"
import {path} from "./path.js"
import {path2} from "./path2.js"
//import {calc_dist_sqrt, calc_dist_axe} from "./distance.js"
import {spike} from "./put_spike.js"
import {spike2} from "./put_spike2.js"
import type {e, f} from "./struct.js"
import { type GameMap } from './../ColorGrid.js';
import { put_roof } from "./put_roof.js"
//fixed value that necver changes

export function map_gen(): GameMap
{
	let fixed: e = {jsize: 3, height: 30, len: 41,
		s_height: 7, column: 3
	};
	// seed dependant value

	let th: f ={seed: 4936354,
		cluster_max: 3, cluster_min: 2, n_way: 1, s_safe: 4,
		safe_path_1: Array.from({length: fixed.len}, () => -10),
		safe_path_2: Array.from({length: fixed.len}, () => -10),
		map: Array.from({length: fixed.height}, () => Array(fixed.len).fill('E'))
	}

	const rand = createRand(th.seed);


	for (let i = 0; i < fixed.height; i++)
	{
		th.map[i][0] = 'W';
		th.map[i][fixed.len - 1] = 'W';
	}

	for (let i = 1; i < fixed.len; i++)
	{
		th.map[0][i] = 'W';
		th.map[fixed.height - 1][i] = 'W';
	}

	let sy: number = Math.floor(rand() * 6) + ((fixed.height / 2) - 3);
	let sx: number = 1;

	th.map[sy][sx] = 'S';

	let ey: number = path(fixed, th, rand, sy) + 1;
	path2(fixed, th, rand, sy, ey);

	for (let i = 0; i < fixed.len; i++)
	{
		if (th.safe_path_1[i] >= 0)
			th.map[th.safe_path_1[i]][i] = 'G';
	}

	for (let i = 0; i < fixed.len; i++)
	{
		if (th.safe_path_2[i] >= 0)
			th.map[th.safe_path_2[i]][i] = 'G';
	}

	th.map[ey][fixed.len - 2] = 'F';

	spike(fixed, th, rand);
	spike2(fixed, th, rand);
	put_roof(fixed, th, rand);
	return th.map;
}

