import I from 'immutable';
import createImmutableReducer from '../util/immutableReducer';
import keyCodes from '../keyCodes';

import {
  TICK,
} from '../ActionTypes';

export const PLAYER_LEFT = 'leftPlayer';
export const PLAYER_RIGHT = 'rightPlayer';

export const MOVE_UP = 'MOVE_UP';
export const MOVE_LEFT = 'MOVE_LEFT';
export const MOVE_RIGHT = 'MOVE_RIGHT';
export const MOVE_DOWN = 'MOVE_DOWN';

const Vector = I.Record({
  x: null,
  y: null
});

const Player = I.Record({
  x: null,
  y: null,
  lastVec: new Vector(),
  side: null,
});

const Turbodisc = I.Record({
  x: null,
  y: null,
  z: null,  // 0 - 1?
  vec: new Vector(),
  held: null,
});

const State = I.Record({
  leftPlayer: new Player({
    x: 20,
    y: 112,
    side: PLAYER_LEFT,
  }),

  rightPlayer: new Player({
    x: 300,
    y: 112,
    side: PLAYER_RIGHT,
  }),

  turbodisc: new Turbodisc({
    held: PLAYER_LEFT,
  }),
});

const PLAYER_SPEED = 5;
const INITIAL_DISC_SPEED = 15;

function movePlayer(state, dt, playerKey, direction) {
  const speed = PLAYER_SPEED * dt;

  return state.update(playerKey, (player) => {
    if (direction === MOVE_UP) {
      return player
        .update('y', (y) => y - speed)
        .setIn(['lastVec', 'y'], -PLAYER_SPEED);
    } else if (direction === MOVE_DOWN) {
      return player
        .update('y', (y) => y + speed)
        .setIn(['lastVec', 'y'], PLAYER_SPEED);
    } else if (direction === MOVE_LEFT) {
      return player
        .update('x', (x) => x - speed)
        .setIn(['lastVec', 'x'], -PLAYER_SPEED);
    } else if (direction === MOVE_RIGHT) {
      return player
        .update('x', (x) => x + speed)
        .setIn(['lastVec', 'x'], PLAYER_SPEED);
    }
  });
}

function throwDisc(state, playerKey) {
  if (state.turbodisc.held !== playerKey) {
    // Can't throw a disc you don't hold...
    return state;
  }

  const player = state.get(playerKey);

  const startingVec = player.lastVec;

  return state
    .setIn(['turbodisc', 'held'], null)
    .setIn(['turbodisc', 'x'], player.x)
    .setIn(['turbodisc', 'y'], player.y)
    .mergeIn(['turbodisc', 'vec'], {
      x: Math.sign(startingVec.x) * INITIAL_DISC_SPEED,
      y: Math.sign(startingVec.y) * INITIAL_DISC_SPEED,
    });
}

function updateDiscPosition(state, dt) {
  return state.update('turbodisc', (disc) => {
    return disc
      .set('x', disc.x + (disc.vec.x * dt))
      .set('y', disc.y + (disc.vec.y * dt));
  });
}

const reducer = createImmutableReducer(new State(), {
  [TICK]: ({dt, keys}, state) => {
    dt = dt / 100;

    state = state
      .mergeIn([PLAYER_LEFT, 'lastVec'], {x: null, y: null})
      .mergeIn([PLAYER_RIGHT, 'lastVec'], {x: null, y: null});

    if (keys.has(keyCodes.W)) {
      state = movePlayer(state, dt, PLAYER_LEFT, MOVE_UP);
    }
    if (keys.has(keyCodes.S)) {
      state = movePlayer(state, dt, PLAYER_LEFT, MOVE_DOWN);
    }
    if (keys.has(keyCodes.A)) {
      state = movePlayer(state, dt, PLAYER_LEFT, MOVE_LEFT);
    }
    if (keys.has(keyCodes.D)) {
      state = movePlayer(state, dt, PLAYER_LEFT, MOVE_RIGHT);
    }

    if (keys.has(keyCodes.SPACE)) {
      state = throwDisc(state, PLAYER_LEFT);
    }

    if (!state.turbodisc.held) {
      state = updateDiscPosition(state, dt);
    }

    return state;
  },
});

export default reducer;
