import React from 'react';
import {connect} from 'react-redux';

import RenderedCanvas from '../lib/RenderedCanvas';
import GlobalKeyboardHandler from '../lib/GlobalKeyboardHandler';

import {
  WIDTH,
  HEIGHT,
} from '__root/app/constants';

import {
  PLAYER_LEFT,
  PLAYER_RIGHT,
} from '__root/app/reducers/game';

function select(state) {
  return {
    leftPlayer: state.game.leftPlayer,
    rightPlayer: state.game.rightPlayer,
    turbodisc: state.game.turbodisc,
  };
}

const Playing = React.createClass({
  drawPlayer(ctx, player) {
    const width = 20;
    const height = 20;

    if (player.side === PLAYER_LEFT) {
      ctx.fillStyle = 'blue';
    } else {
      ctx.fillStyle = 'red';
    }

    ctx.fillRect(player.x - width / 2, player.y - height / 2, width, height);

    if (player.side === this.props.turbodisc.held) {
      ctx.beginPath();
      ctx.arc(player.x, player.y, width / 4, 0, 2 * Math.PI);
      ctx.fillStyle = 'black';
      ctx.fill();
      ctx.closePath();
    }
  },

  drawDisc(ctx, disc) {
    ctx.beginPath();
    ctx.arc(disc.x, disc.y, 5, 0, 2 * Math.PI);
    ctx.fillStyle = 'black';
    ctx.fill();
    ctx.closePath();
  },

  drawScore(ctx) {
    ctx.fillStyle = 'black';
    ctx.font = '20px sans-serif';

    ctx.textAlign = 'left';
    ctx.fillText(this.props.leftPlayer.score, 20, 20);

    ctx.textAlign = 'right';
    ctx.fillText(this.props.rightPlayer.score, WIDTH - 20, 20);
  },

  renderCanvas(ctx) {
    ctx.fillStyle = '#ccc';

    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    this.drawPlayer(ctx, this.props.leftPlayer);
    this.drawPlayer(ctx, this.props.rightPlayer);

    if (this.props.turbodisc.held === null) {
      this.drawDisc(ctx, this.props.turbodisc);
    }

    this.drawScore(ctx);
  },

  render() {
    return (
      <GlobalKeyboardHandler>
        <RenderedCanvas render={this.renderCanvas} width={WIDTH} height={HEIGHT} />
      </GlobalKeyboardHandler>
    );
  }
});

export default connect(select)(Playing);
