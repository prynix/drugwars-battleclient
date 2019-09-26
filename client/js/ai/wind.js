game.heroesAI.wind = {
  move: {
    default: 'flank'
  },
  play: function (card, cardData) {
    var arrow = $('.'+game.ai.side+'decks .hand .skills.wind-arrow');
    var stun = $('.'+game.ai.side+'decks .hand .skills.wind-stun');
    var run = $('.'+game.ai.side+'decks .hand .skills.wind-run');
    var ult = $('.'+game.ai.side+'decks .hand .skills.wind-ult');
    if (!$('.map .'+game.ai.side+'.wind').length) {
      arrow.data('ai discard', arrow.data('ai discard') + 1);
      stun.data('ai discard', stun.data('ai discard') + 1);
      run.data('ai discard', run.data('ai discard') + 1);
    }
    if (card.canCast(arrow)) {
      cardData['can-cast'] = true;
      var range = arrow.data('aoe range');
      var width = arrow.data('aoe width');
      card.around(1, function (spot) {
        var targets = 0, p = 0;
        card.opponentsInLine(spot, range, width, function (cardInRange) {
          if (!cardInRange.hasClasses('invisible ghost dead')) {
            targets++;
            p += parseInt((cardInRange.data('hp')-cardInRange.data('current hp'))/4);
            if (cardInRange.hasClass('towers')) p += 20;
            if (cardInRange.hasClass('units')) p -= 5;
          }
        });
        if (targets > 1) {
          cardData['cast-strats'].push({
            priority: p,
            skill: 'arrow',
            card: arrow.attr('id'),
            target: spot.attr('id')
          });
        }
      });
    }
    if (card.canCast(stun)) {
      card.opponentsInRange(stun.data('cast range'), function (cardInRange) {
        if (!cardInRange.hasClasses('invisible ghost dead towers')) {
          cardData['can-cast'] = true;
          var p = 20, secTarget = card.behindTarget(cardInRange);
          if (cardInRange.hasClass('units')) p -= 10;
          if (secTarget && !secTarget.hasClasses('invisible ghost dead towers')) {
            p += 30;
            if (secTarget.hasClass('units')) p -= 5;
          }
          cardData['cast-strats'].push({
            priority: p - (cardInRange.data('current hp')/4),
            skill: 'stun',
            card: stun.attr('id'),
            target: cardInRange.attr('id')
          });
        }
      });
    }
    if (card.canCast(run)) {
      cardData['can-cast'] = true;
      var p = 10;
      if (cardData['can-be-attacked']) p = 40;
      cardData['cast-strats'].push({
        priority: p,
        skill: 'run',
        card: run.attr('id'),
        target: card.attr('id')
      });
    }
    if (card.canCast(ult)) {
      card.opponentsInRange(ult.data('cast range'), function (cardInRange) {
        if (!cardInRange.hasClasses('invisible ghost dead')) {
          var p = 40;
          cardData['can-cast'] = true;
          if (cardInRange.hasClass('towers')) p += 40;
          if (cardInRange.hasClass('units')) p -= 30;
          cardData['cast-strats'].push({
            priority: p - (cardInRange.data('current hp')/2),
            skill: 'ult',
            card: ult.attr('id'),
            target: cardInRange.attr('id')
          });
        }
      });
    }
    card.data('ai', JSON.stringify(cardData));
  },
  defend: function (card, cardData) {
    var arrow = game.data.skills.wind.arrow;
    var range = arrow['aoe range'];
    var width = arrow['aoe width'];
    card.around(1, function (dirSpot) {
      card.inLine(dirSpot, range, width, function (spot) {
        var spotData = JSON.parse(spot.data('ai'));
        spotData.priority -= 30;
        spotData['can-be-casted'] = true;
        spot.data('ai', JSON.stringify(spotData));
        var cardInRange = $('.card.'+card.opponent(), spot);
        if (cardInRange.length && !cardInRange.hasClasses('ghost dead towers')) {
          var cardInRangeData = JSON.parse(cardInRange.data('ai'));
          cardInRangeData.strats.dodge += 50;
          cardInRange.data('ai', JSON.stringify(cardInRangeData));
        }
      });
    });
    var stun = game.data.skills.wind.stun;
    card.inRange(stun['cast range'], function (spot) {
      var spotData = JSON.parse(spot.data('ai'));
      spotData.priority -= 5;
      spotData['can-be-casted'] = true;
      spot.data('ai', JSON.stringify(spotData));
    });
    if (card.hasBuff('wind-run')) {
      card.data('ai priority bonus', -80);
    }
    var ult = game.data.skills.wind.ult;
    if (game[card.side()].turn >= game.ultTurn) {
      card.inRange(ult['cast range'], function (spot) {
        var spotData = JSON.parse(spot.data('ai'));
        spotData.priority -= 5;
        spotData['can-be-casted'] = true;
        spot.data('ai', JSON.stringify(spotData));
      });
    }
    card.data('ai', JSON.stringify(cardData));
  }
};