// import {calc_dist_sqrt/*, calc_dist_axe*/} from "./distance.js"
import type {e, f} from "./struct.js"

export function put_roof (fixed: e, th: f, rand: () => number) : number
{
	let s: number = Math.floor(rand() * (th.safe_path_1[1] - 1)) + 1;
	let t: number;
	for(let i = 0; i < s; i++)
		th.map[fixed.height - i - 1][1]= 'R';
	for(let j = 2; j < fixed.len - 1; j++)
	{
		t = Math.floor(rand() * 5);
		if (t < 2)
		{
			if (s != 1)
				s--;
			for(let i = 0; i < s; i++)
				th.map[fixed.height - i - 1][j]= 'R';
		}
		else if (t < 4)
		{
			if (s + th.safe_path_1[j] < fixed.height - 4)
				s++;
			if (s + th.safe_path_1[j] > fixed.height - 3)
				s--;
			for(let i = 0; i < s; i++)
				th.map[fixed.height - i - 1][j]= 'R';
		}
		else
		{
			if (s + th.safe_path_1[j] > fixed.height - 4)
				s--;
			for(let i = 0; i < s; i++)
				th.map[fixed.height - i - 1][j]= 'R';
		}
	}
	return 1;
}
