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

function calcVector(magnitude, rad) {
  var x = magnitude * Math.cos(rad);
  var y = magnitude * Math.sin(rad);
  return { x: x, y: y };
}

function movePlayer(state, dt, playerKey, angle) {
  const speed = PLAYER_SPEED * dt;

  const vec = calcVector(speed, angle);

  return state.update(playerKey, (player) => {
    return player
      .update('x', (x) => x + vec.x)
      .update('y', (y) => y + vec.y);
  });
}

function throwDisc(state, dt, playerKey, angle) {
  if (state.turbodisc.held !== playerKey) {
    // Can't throw a disc you don't hold...
    return state;
  }

  if (angle === null) {
    // TODO: throw straight up
    return state;
  }

  const player = state.get(playerKey);

  const speed = INITIAL_DISC_SPEED;

  const vec = calcVector(speed, angle);

  return state
    .setIn(['turbodisc', 'held'], null)
    .setIn(['turbodisc', 'x'], player.x)
    .setIn(['turbodisc', 'y'], player.y)
    .mergeIn(['turbodisc', 'vec'], vec);
}

function updateDiscPosition(state, dt) {
  return state.update('turbodisc', (disc) => {
    const x = disc.x + (disc.vec.x * dt);
    const y = disc.y + (disc.vec.y * dt);

    if (y < 0 || y > 224) {
      disc = disc.setIn(['vec', 'y'], -disc.vec.y);
    }

    return disc
      .set('x', x)
      .set('y', y);
  });
}

const reducer = createImmutableReducer(new State(), {
  [TICK]: ({dt, keys}, state) => {
    dt = dt / 100;

    // Handle player input

    let xDirection = 0;
    let yDirection = 0;

    if (keys.has(keyCodes.W)) {
      yDirection = -1;
    }
    if (keys.has(keyCodes.S)) {
      yDirection = 1;
    }
    if (keys.has(keyCodes.A)) {
      xDirection = -1;
    }
    if (keys.has(keyCodes.D)) {
      xDirection = 1;
    }

    let angle = null;

    if (!(xDirection === 0 && yDirection === 0)) {
      angle = Math.atan2(yDirection, xDirection);
      state = movePlayer(state, dt, PLAYER_LEFT, angle);
    }

    if (keys.has(keyCodes.SPACE)) {
      state = throwDisc(state, dt, PLAYER_LEFT, angle);
    }

    // Update positions

    if (!state.turbodisc.held) {
      state = updateDiscPosition(state, dt);
    }

    return state;
  },
});

export default reducer;
