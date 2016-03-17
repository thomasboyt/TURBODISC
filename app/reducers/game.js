import I from 'immutable';
import createImmutableReducer from '../util/immutableReducer';
import keyCodes from '../keyCodes';

import {
  TICK,
} from '../ActionTypes';

import {
  WIDTH,
  HEIGHT,
  PLAYER_SIZE,
  DISC_SIZE,
} from '__root/app/constants';

import {
  boundingBoxIntersecting,
  calcVector,
} from '__root/app/util/math';

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
  justThrew: false,
  score: 0,
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

const PLAYER_SPEED = 10;
const INITIAL_DISC_SPEED = 15;

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
    .mergeIn(['turbodisc', 'vec'], vec)
    .setIn([playerKey, 'justThrew'], true);
}

function getCollisionParams(player) {
  return {
    center: {
      x: player.x,
      y: player.y,
    },
    size: {
      x: PLAYER_SIZE,
      y: PLAYER_SIZE,
    }
  };
}

function scoreFor(state, playerKey) {
  const otherPlayer = playerKey === PLAYER_LEFT ? PLAYER_RIGHT : PLAYER_LEFT;
  return state
    .updateIn([playerKey, 'score'], (score) => score + 1)
    .setIn(['turbodisc', 'held'], otherPlayer);
}

function updateDiscPosition(state, dt) {
  return state
    .update('turbodisc', (disc) => {
      const x = disc.x + (disc.vec.x * dt);
      const y = disc.y + (disc.vec.y * dt);

      if (y < 0 || y > HEIGHT) {
        disc = disc.setIn(['vec', 'y'], -disc.vec.y);
      }

      return disc
        .set('x', x)
        .set('y', y);
    })
    .update((state) => {
      const disc = state.turbodisc;

      const discCollisionParams = {
        center: {
          x: disc.x,
          y: disc.y,
        },
        size: {
          x: DISC_SIZE,
          y: DISC_SIZE,
        },
      };

      if (boundingBoxIntersecting(discCollisionParams, getCollisionParams(state.rightPlayer))) {
        if (state.rightPlayer.justThrew) {
          return state;
        }

        return state
          .setIn(['turbodisc', 'held'], PLAYER_RIGHT);

      } else if (boundingBoxIntersecting(discCollisionParams, getCollisionParams(state.leftPlayer))) {
        if (state.leftPlayer.justThrew) {
          return state;
        }

        return state
          .setIn(['turbodisc', 'held'], PLAYER_LEFT);

      } else if ((disc.x + DISC_SIZE) < 0) {
        // right player scored
        return scoreFor(state, PLAYER_RIGHT);

      } else if ((disc.x - DISC_SIZE) > WIDTH) {
        // left player scored
        return scoreFor(state, PLAYER_LEFT);

      } else {
        // Unset justThrew flag once the disc is out of collision box
        return state
          .setIn(['leftPlayer', 'justThrew'], false)
          .setIn(['rightPlayer', 'justThrew'], false);
      }
    });
}

function updateOpponent(state, dt) {
  if (state.turbodisc.held === PLAYER_RIGHT) {
    return throwDisc(state, dt, PLAYER_RIGHT, Math.atan2(0, -1));
  }
  
  const speed = PLAYER_SPEED * dt;

  let target;
  if (state.turbodisc.held === PLAYER_LEFT) {
    target = {
      x: state.leftPlayer.x,
      y: state.leftPlayer.y,
    };

  } else {
    target = {
      x: state.turbodisc.x,
      y: state.turbodisc.y,
    };
  }

  if (target.y > state.rightPlayer.y) {
    return state.update(PLAYER_RIGHT, (player) => {
      return player
        .update('y', (y) => y + speed);
    });

  } else if (target.y < state.rightPlayer.y) {
    return state.update(PLAYER_RIGHT, (player) => {
      return player
        .update('y', (y) => y - speed);
    });

  } else {
    return state;
  }
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

    state = updateOpponent(state, dt);

    return state;
  },
});

export default reducer;
