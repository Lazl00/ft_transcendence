//import { createRand } from "./rand.js";
import type {e, f} from "./struct.js"

export function path(fixed: e, th: f , rand: () => number, sy: number): number
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
		th.safe_path_1[x] = y;
		x++;
	}
	y = y + 2;
	for (let i = 0; i < column; i++)
	{
		th.safe_path_1[x] = y;
		x++;
	}
	sc++;
	y = y + 2;
	for (let i = 0; i < column; i++)
	{
		th.safe_path_1[x] = y;
		x++;
	}
	sc++;
	while(sc < ec)
	{
		path = Math.floor(rand() * 3);
		if ((path === 1 && y < fixed.height - 3))
			y++;
		if (path === 2 && y > (fixed.height / 2) - 4)
			y--;
		for (let i = 0; i < column; i++)
		{
			th.safe_path_1[x] = y;
			x++;
		}
		sc++;
	}
	return y;
}
