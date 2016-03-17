import { combineReducers } from 'redux';

import fps from './fps';
import game from './game';

const rootReducer = combineReducers({
  fps,
  game,
});

export default rootReducer;
