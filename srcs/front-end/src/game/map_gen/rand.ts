// applique un random seeder

export function createRand(seed: number): () => number
{
	let a: number = seed;

	return () => {
	a = (a + 0x6d2b79f5) | 0; // modifie les bit de a pour les prochains appellent et les melanges pour que deux nombres proches n aient pas des resultats procher
	let t = Math.imul(a ^ (a >>> 15), 1 | a);// apllique des xor et des decalages de bit
	t = (t + (Math.imul(t ^ (t >>> 7), 61 | t)));// same
	return ((t ^ (t >>> 14)) >>> 0) /  4294967296;// divise le nombre par max unsign pour que ce soit compris entre 0 et 1
	}
}
