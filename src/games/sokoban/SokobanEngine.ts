export type TileType = 'Wall' | 'Floor' | 'Goal' | 'Empty';
export type EntityType = 'Player' | 'Box' | 'None';

export interface Position {
    x: number;
    y: number;
}

export interface GameState {
    grid: TileType[][];
    entities: { type: EntityType; id?: number }[][]; // Grid of entities
    playerPos: Position;
    moves: number;
    levelComplete: boolean;
}

export class SokobanEngine {
    private initialState: GameState;
    public currentState: GameState;

    constructor(levelString: string) {
        this.initialState = this.parseLevel(levelString);
        this.currentState = JSON.parse(JSON.stringify(this.initialState));
    }

    private parseLevel(level: string): GameState {
        const lines = level.split('\n').filter(line => line.length > 0);
        const height = lines.length;
        const width = Math.max(...lines.map(line => line.length));

        const grid: TileType[][] = Array(height).fill(null).map(() => Array(width).fill('Empty'));
        const entities: { type: EntityType }[][] = Array(height).fill(null).map(() => Array(width).fill({ type: 'None' }));
        let playerPos: Position = { x: 0, y: 0 };

        lines.forEach((line, y) => {
            line.split('').forEach((char, x) => {
                switch (char) {
                    case '#':
                        grid[y][x] = 'Wall';
                        break;
                    case '.':
                        grid[y][x] = 'Goal';
                        break;
                    case '@':
                        grid[y][x] = 'Floor';
                        playerPos = { x, y };
                        break;
                    case '+': // Player on Goal
                        grid[y][x] = 'Goal';
                        playerPos = { x, y };
                        break;
                    case '$':
                        grid[y][x] = 'Floor';
                        entities[y][x] = { type: 'Box' };
                        break;
                    case '*': // Box on Goal
                        grid[y][x] = 'Goal';
                        entities[y][x] = { type: 'Box' };
                        break;
                    case ' ':
                        grid[y][x] = 'Floor';
                        break;
                    default:
                        grid[y][x] = 'Empty';
                }
            });
        });

        return {
            grid,
            entities,
            playerPos,
            moves: 0,
            levelComplete: false
        };
    }

    public move(direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'): boolean {
        if (this.currentState.levelComplete) return false;

        const dx = direction === 'LEFT' ? -1 : direction === 'RIGHT' ? 1 : 0;
        const dy = direction === 'UP' ? -1 : direction === 'DOWN' ? 1 : 0;

        const newX = this.currentState.playerPos.x + dx;
        const newY = this.currentState.playerPos.y + dy;

        // Check bounds and walls
        if (this.isWall(newX, newY)) return false;

        // Check for box
        if (this.isBox(newX, newY)) {
            const boxNextX = newX + dx;
            const boxNextY = newY + dy;

            // Can push box?
            if (this.isWall(boxNextX, boxNextY) || this.isBox(boxNextX, boxNextY)) {
                return false;
            }

            // Push box
            this.currentState.entities[boxNextY][boxNextX] = { type: 'Box' };
            this.currentState.entities[newY][newX] = { type: 'None' };
        }

        // Move player
        this.currentState.playerPos = { x: newX, y: newY };
        this.currentState.moves++;

        this.checkWin();
        return true;
    }

    private isWall(x: number, y: number): boolean {
        if (y < 0 || y >= this.currentState.grid.length || x < 0 || x >= this.currentState.grid[0].length) return true;
        return this.currentState.grid[y][x] === 'Wall';
    }

    private isBox(x: number, y: number): boolean {
        return this.currentState.entities[y][x].type === 'Box';
    }

    private checkWin() {
        let allBoxesOnGoal = true;
        for (let y = 0; y < this.currentState.grid.length; y++) {
            for (let x = 0; x < this.currentState.grid[0].length; x++) {
                if (this.currentState.grid[y][x] === 'Goal') {
                    if (this.currentState.entities[y][x].type !== 'Box') {
                        allBoxesOnGoal = false;
                        break;
                    }
                }
                // Also check if there are boxes NOT on goals (though the first check covers most cases, strictly we just need to ensure every goal has a box, assuming #boxes == #goals)
            }
        }
        this.currentState.levelComplete = allBoxesOnGoal;
    }

    public reset() {
        this.currentState = JSON.parse(JSON.stringify(this.initialState));
    }

    public getState(): GameState {
        return this.currentState;
    }
}
