/*
 * Reynolds' boids. Each boid looks at neighbours within `perception` and
 * steers by three rules: keep apart (separation), match heading
 * (alignment), move towards the local centre (cohesion). A pointer can act
 * as a predator that every boid within `fear` flees from. Nothing here
 * touches the DOM; the component draws whatever this produces.
 */

export interface Boid {
	x: number;
	y: number;
	vx: number;
	vy: number;
}

export interface Params {
	separation: number;
	alignment: number;
	cohesion: number;
	perception: number;
	minSpeed: number;
	maxSpeed: number;
	/** How hard a boid can turn per step. */
	maxForce: number;
	wrap: boolean;
}

export interface Predator {
	x: number;
	y: number;
	fear: number;
}

export const defaults: Params = {
	separation: 1.4,
	alignment: 1,
	cohesion: 0.8,
	perception: 60,
	minSpeed: 1.2,
	maxSpeed: 3,
	maxForce: 0.08,
	wrap: true,
};

export function mulberry32(seed: number): () => number {
	let a = seed >>> 0;
	return () => {
		a = (a + 0x6d2b79f5) >>> 0;
		let t = a;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

export function spawn(
	count: number,
	width: number,
	height: number,
	random: () => number = Math.random,
): Boid[] {
	return Array.from({ length: count }, () => {
		const angle = random() * Math.PI * 2;
		const speed = 1.5 + random();
		return {
			x: random() * width,
			y: random() * height,
			vx: Math.cos(angle) * speed,
			vy: Math.sin(angle) * speed,
		};
	});
}

function limit(x: number, y: number, max: number): [number, number] {
	const m = Math.hypot(x, y);
	if (m > max && m > 0) return [(x / m) * max, (y / m) * max];
	return [x, y];
}

/** Shortest offset from a to b, across the wrap seam when wrapping. */
function offset(
	ax: number,
	ay: number,
	bx: number,
	by: number,
	width: number,
	height: number,
	wrap: boolean,
): [number, number] {
	let dx = bx - ax;
	let dy = by - ay;
	if (wrap) {
		if (dx > width / 2) dx -= width;
		else if (dx < -width / 2) dx += width;
		if (dy > height / 2) dy -= height;
		else if (dy < -height / 2) dy += height;
	}
	return [dx, dy];
}

export function step(
	boids: Boid[],
	params: Params,
	width: number,
	height: number,
	predator?: Predator | null,
): Boid[] {
	const r2 = params.perception * params.perception;
	const sepRadius = params.perception * 0.45;
	const sep2 = sepRadius * sepRadius;
	return boids.map((b) => {
		let n = 0;
		let avx = 0;
		let avy = 0;
		let cx = 0;
		let cy = 0;
		let sx = 0;
		let sy = 0;
		for (const o of boids) {
			if (o === b) continue;
			const [dx, dy] = offset(b.x, b.y, o.x, o.y, width, height, params.wrap);
			const d2 = dx * dx + dy * dy;
			if (d2 > r2 || d2 === 0) continue;
			n++;
			avx += o.vx;
			avy += o.vy;
			cx += dx;
			cy += dy;
			if (d2 < sep2) {
				const d = Math.sqrt(d2);
				sx -= (dx / d) * (1 - d / sepRadius);
				sy -= (dy / d) * (1 - d / sepRadius);
			}
		}
		let fx = 0;
		let fy = 0;
		if (n > 0) {
			/* Alignment: steer towards the average heading. */
			const [tx, ty] = limit(avx / n, avy / n, params.maxSpeed);
			fx += (tx - b.vx) * params.alignment;
			fy += (ty - b.vy) * params.alignment;
			/* Cohesion: steer towards the centre of the neighbours. */
			const [ux, uy] = limit(cx / n, cy / n, params.maxSpeed);
			fx += ux * 0.05 * params.cohesion;
			fy += uy * 0.05 * params.cohesion;
			/* Separation: already a summed push away from the close ones. */
			fx += sx * params.separation * 0.6;
			fy += sy * params.separation * 0.6;
		}
		if (predator) {
			const [dx, dy] = offset(
				b.x,
				b.y,
				predator.x,
				predator.y,
				width,
				height,
				params.wrap,
			);
			const d = Math.hypot(dx, dy);
			if (d < predator.fear && d > 0) {
				const push = (1 - d / predator.fear) * 0.6;
				fx -= (dx / d) * push;
				fy -= (dy / d) * push;
			}
		}
		[fx, fy] = limit(fx, fy, params.maxForce * 3);
		if (!params.wrap) {
			/* Walls push after the limit so a crowd cannot dilute them. */
			const margin = 40;
			const turn = 0.2;
			if (b.x < margin) fx += turn;
			if (b.x > width - margin) fx -= turn;
			if (b.y < margin) fy += turn;
			if (b.y > height - margin) fy -= turn;
		}
		let vx = b.vx + fx;
		let vy = b.vy + fy;
		const speed = Math.hypot(vx, vy);
		if (speed > params.maxSpeed) {
			vx = (vx / speed) * params.maxSpeed;
			vy = (vy / speed) * params.maxSpeed;
		} else if (speed < params.minSpeed && speed > 0) {
			vx = (vx / speed) * params.minSpeed;
			vy = (vy / speed) * params.minSpeed;
		}
		let x = b.x + vx;
		let y = b.y + vy;
		if (params.wrap) {
			x = ((x % width) + width) % width;
			y = ((y % height) + height) % height;
		} else {
			x = Math.min(width, Math.max(0, x));
			y = Math.min(height, Math.max(0, y));
		}
		return { x, y, vx, vy };
	});
}

/** How aligned the flock is: 1 when every boid points the same way. */
export function polarisation(boids: Boid[]): number {
	if (boids.length === 0) return 0;
	let sx = 0;
	let sy = 0;
	for (const b of boids) {
		const m = Math.hypot(b.vx, b.vy) || 1;
		sx += b.vx / m;
		sy += b.vy / m;
	}
	return Math.hypot(sx, sy) / boids.length;
}

/** Mean distance from each boid to its nearest neighbour. */
export function spacing(boids: Boid[]): number {
	if (boids.length < 2) return 0;
	let total = 0;
	for (const b of boids) {
		let best = Number.POSITIVE_INFINITY;
		for (const o of boids) {
			if (o === b) continue;
			const d = Math.hypot(o.x - b.x, o.y - b.y);
			if (d < best) best = d;
		}
		total += best;
	}
	return total / boids.length;
}
