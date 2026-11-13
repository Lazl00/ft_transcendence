import {calc_dist_sqrt/*, calc_dist_axe*/} from "./distance.js"
import type {e, f} from "./struct.js"


export function spike(fixed: e, th: f, rand: () => number): number
{
	let r: number;
	let cluster: number = 0;
	let s_cluster: number = 0;
	for (let i = 2; i < fixed.len - 1; i++)
	{
		r = Math.floor(rand() * 10);
		if (s_cluster < th.s_safe && cluster == 0)
		{
			if (r <= 6)
			{
				th.map[th.safe_path_1[i]][i] = 'P';
				if (th.map[th.safe_path_1[i] - 1][i] !== 'W')
					th.map[th.safe_path_1[i] - 1][i] = 'G';
				cluster++;
				s_cluster == 0;
			}
			else
				s_cluster++;
		}
		else if((cluster < th.cluster_max && cluster >= 0) || th.s_safe <= s_cluster)
		{
			if (cluster < th.cluster_min && calc_dist_sqrt(i - cluster, th.safe_path_1[i - cluster], i + 1, th.safe_path_1[i + 1]) < fixed.jsize)
			{
				th.map[th.safe_path_1[i]][i] = 'P';
				if (th.map[th.safe_path_1[i] - 1][i] !== 'W')
					th.map[th.safe_path_1[i] - 1][i] = 'G';
				cluster++;
				s_cluster == 0;
			}
			else if(r > 4 && calc_dist_sqrt(i - cluster, th.safe_path_1[i - cluster], i + 1, th.safe_path_1[i + 1]) < fixed.jsize)
			{
				th.map[th.safe_path_1[i]][i] = 'P';
				if (th.map[th.safe_path_1[i] - 1][i] !== 'W')
					th.map[th.safe_path_1[i] - 1][i] = 'G';
				cluster++;
				s_cluster = 0;
			}
			else
			{
				cluster = 0;
				s_cluster++;
			}
		}
		else
		{
			cluster = 0;
			s_cluster++;
		}
	}
	for (let i = 1; i < fixed.len - 1; i++)
	{
		if (th.map[1][i] === 'E' && th.map[2][i] === 'E')
		{
			th.map[1][i] = 'P';
		}
	}
	return 1;
}
