import {createRand} from "./rand.js"
import {path} from "./path.js"
//import {calc_dist_sqrt, calc_dist_axe} from "./distance.js"
import {spike} from "./put_spike.js"
import {e, f} from "./struct.js"
import TileCode from './../ColorGrid.js';
//fixed value that necver changes

export function map_gen(): string[][]
{
	let fixed: e = {jsize: 3, height: 10, len: 41,
		s_height: 7, column: 3
	};
	// seed dependant value

	let th: f ={seed: 1229,
		cluster_max: 3, cluster_min: 1, n_way: 1, s_safe: 4,
		safe_path_1: Array.from({length: fixed.len}, () => -10),
		map: Array.from({length: fixed.height}, () => Array(fixed.len).fill("E"))
	}

	const rand = createRand(th.seed);


	for (let i = 0; i < fixed.height; i++)
	{
		th.map[i][0] = "W";
		th.map[i][fixed.len - 1] = "W";
	}

	for (let i = 1; i < fixed.len; i++)
	{
		th.map[0][i] = "W";
		th.map[fixed.height - 1][i] = "W";
	}

	let sy: number = Math.floor(rand() * fixed.s_height) + 2;
	let sx: number = 1;

	th.map[sy][sx] = "S";

	let ey: number = path(fixed, th, rand, sy) + 1;

	for (let i = 0; i < fixed.len; i++)
	{
		if (th.safe_path_1[i] >= 0)
			th.map[th.safe_path_1[i]][i] = "G";
	}


	th.map[ey][fixed.len - 2] = "F";

	spike(fixed, th, rand);

	return th.map;
}

