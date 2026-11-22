import type { GameMap } from './../ColorGrid.js';

export type e = {
	jsize: number; //jump size
	height: number; // hauteur de la map
	len: number; // largeur de la map
	s_height: number; // hauteur max du start
	column: number; // taille d une colonne pour le chemin
}

export type f={
	seed: number;
	cluster_max: number;//size max of trap
	cluster_min: number;//min size of trap
	n_way: number; //number of path possible
	s_safe: number;//size of safe place max
	safe_path_1: number[];//the emplacement of the first safe path the rank is the x value and the number is the y value
	safe_path_2: number[];//the emplacement of the first safe path
	map: GameMap;
}

