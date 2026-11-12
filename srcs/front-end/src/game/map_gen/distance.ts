export function calc_dist_sqrt(ax: number, ay: number, bx: number, by: number): number
{
	const dx = bx - ax;
	const dy = by - ay;
	return Math.sqrt(dx * dx + dy * dy);
}

export function calc_dist_axe(ax: number, bx: number): number
{
	return Math.abs(bx - ax);
}
