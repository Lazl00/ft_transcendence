import {calc_dist_sqrt/*, calc_dist_axe*/} from "./distance.js"
import type {e, f} from "./struct.js"


export function spike(fixed: e, th: f, rand: () => number): number
{
	let r: number;
	let cluster: number = 0;
	let s_cluster: number = 0;
	let hole: number = 0;
	for (let i = 2; i < fixed.len - 3; i++)
	{
		r = Math.floor(rand() * 10);
		console.log(r);
		if (s_cluster < th.s_safe && cluster == 0)
		{
			if (r <= 6)
			{
				if (r > 2)
				{
					th.map[th.safe_path_1[i]][i] = 'E';
					cluster++;
					s_cluster = 0;
					hole = 1;
				}
				else
				{
					th.map[th.safe_path_1[i]][i] = 'P';
					if (th.map[th.safe_path_1[i] - 1][i] !== 'W')
						th.map[th.safe_path_1[i] - 1][i] = 'G';
					cluster++;
					s_cluster = 0;
				}
			}
			else
			{
				s_cluster++;
				hole = 0;
			}
		}
		else if((cluster < th.cluster_max && cluster >= 0) || th.s_safe <= s_cluster)
		{
			if (cluster < th.cluster_min && calc_dist_sqrt(i - cluster, th.safe_path_1[i - cluster], i + 1, th.safe_path_1[i + 1]) < fixed.jsize)
			{
				if (hole == 1 || th.s_safe <= s_cluster)
				{
					th.map[th.safe_path_1[i]][i] = 'E';
					cluster++;
					s_cluster = 0;
					hole = 1;
				}
				else
				{
					th.map[th.safe_path_1[i]][i] = 'P';
					if (th.map[th.safe_path_1[i] - 1][i] !== 'W')
						th.map[th.safe_path_1[i] - 1][i] = 'G';
					cluster++;
					s_cluster = 0;
				}
			}
			else if(r > 4 && calc_dist_sqrt(i - cluster, th.safe_path_1[i - cluster], i + 1, th.safe_path_1[i + 1]) < fixed.jsize)
			{
				if (hole == 1)
				{
					th.map[th.safe_path_1[i]][i] = 'E';
					cluster++;
					s_cluster = 0;
				}
				else
				{
					th.map[th.safe_path_1[i]][i] = 'P';
					if (th.map[th.safe_path_1[i] - 1][i] !== 'W')
						th.map[th.safe_path_1[i] - 1][i] = 'G';
					cluster++;
					s_cluster = 0;
				}
			}
			else
			{
				cluster = 0;
				s_cluster++;
				hole = 0;
			}
		}
		else
		{
			cluster = 0;
			s_cluster++;
			hole = 0;
		}
	}
	for (let i = 1; i < fixed.len - 1; i++)
	{
		if (th.map[1][i] === 'E' && th.map[2][i] === 'E')
		{
			th.map[1][i] = 'P';
		}
	}
	th.map[th.safe_path_1[fixed.len - 3]][fixed.len - 3] = 'E';
	return 1;
}
