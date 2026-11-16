import type { GameMap } from './../ColorGrid.js';

export type e = {
	jsize: number;
	height: number;
	len: number;
	s_height: number;
	column: number;
}

export type f={
	seed: number;
	cluster_max: number;//size max of trap
	cluster_min: number;//min size of trap
	n_way: number; //number of path possible
	s_safe: number;//size of safe place max
	safe_path_1: number[];//the emplacement of the first safe path
	map: GameMap;
}

