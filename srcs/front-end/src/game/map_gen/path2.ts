//import { createRand } from "./rand.js";
import type {e, f} from "./struct.js"

export function path2(fixed: e, th: f , rand: () => number, sy: number, ey: number): number
{
	console.log(fixed);

	let x: number = 1;
	let y: number = sy - 1;

	let column: number = 3;
	let sc: number = 0;
	let ec: number = 12;
	let path: number = 0;

	for (let i = 0; i < column; i++)
	{
		th.safe_path_2[x] = y;
		x++;
	}
	y = y - 2;
	for (let i = 0; i < column; i++)
	{
		th.safe_path_2[x] = y;
		x++;
	}
	sc++;
	y = y - 2;
	for (let i = 0; i < column; i++)
	{
		th.safe_path_2[x] = y;
		x++;
	}
	sc++;
	while(sc < ec)
	{
		path = Math.floor(rand() * 3);
		if ((path === 1 && y < th.safe_path_1[x] - 3))
			y++;
		if (path === 2 && y > 3)
			y--;
		for (let i = 0; i < column; i++)
		{
			th.safe_path_2[x] = y;
			x++;
		}
		sc++;
		if ((2 * (ec - sc) + 2) < ey - y)
		{
			while(sc < ec)
			{
				y += 2;
				for (let i = 0; i < column; i++)
				{
					th.safe_path_2[x] = y;
					x++;
				}
				sc++;
			}
		}
	}
	th.safe_path_2[x] = -10;
	th.safe_path_2[x - 1] = -10;
	return y;
}
