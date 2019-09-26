game.heroesAI.ld = {
  move: {
    default: 'attack'
  },
  play: function (card, cardData) {
    // bear strats (siege)
    // use return if bear is low hp
    // cardData['has-instant-attack-buff'] = true;
    var bear = $('.'+game.ai.side+'decks .sidehand .skills.ld-bear');
    var link = $('.'+game.ai.side+'decks .hand .skills.ld-link');
    var roar = $('.'+game.ai.side+'decks .hand .skills.ld-roar');
    var ult = $('.'+game.ai.side+'decks .sidehand .skills.ld-ult');
    var cry = $('.'+game.ai.side+'decks .hand .skills.ld-cry');
    //todo return
    if (!$('.map .'+game.ai.side+'.ld').length) {
      rabid.data('ai discard', rabid.data('ai discard') + 1);
      roar.data('ai discard', roar.data('ai discard') + 1);
    }
    if (card.canCast(bear)) {
      card.around(bear.data('cast range'), function (destiny) {
        if (destiny.hasClass('free')) {
          cardData['can-cast'] = true;
          cardData['cast-strats'].push({
            priority: 10 + (destiny.data('priority') * 4) + (game[game.ai.side].turn*2),
            skill: 'bear',
            card: bear.attr('id'),
            target: destiny.attr('id')
          });
        }
      });
    }
    if (card.canCast(link)) {
      cardData['can-cast'] = true;
      p = 10;
      if (cardData['can-attack']) p += 40;
      cardData['cast-strats'].push({
        priority: p,
        skill: 'link',
        card: link.first().attr('id'),
        target: card.attr('id')
      });
    }
    var p;
    if (card.canCast(roar)) {
      cardData['can-cast'] = true;
      p = 0;
      card.opponentsInRange(roar.data('aoe range'), function (cardInRange) {
        if (!cardInRange.hasClasses('invisible ghost dead')) {
          p += 10;
          if (cardInRange.hasClasses('channeling towers')) p += 20;
          if (cardInRange.hasClass('units')) p -= 5;
        }
      });
      if (p) cardData['cast-strats'].push({
        priority: p,
        skill: 'roar',
        card: roar.attr('id'),
        target: card.attr('id')
      });
    }
    if (card.canCast(ult)) {
      cardData['can-cast'] = true;
      var inMelee = 0, inRange = 0;
      card.opponentsInRange(2, function (cardInRange) {
        if (!cardInRange.hasClasses('invisible ghost dead')) inMelee++;
      });
      if (!ult.hasClass('on')) { 
        // turn on
        if (!card.hasBuff('ld-cry') || inMelee) cardData['cast-strats'].push({
          priority: 10 + (10 * inMelee),
          skill: 'ult',
          card: ult.attr('id'),
          target: card.attr('id')
        });
      } else if ((!card.hasBuff('ld-cry') && !cry.length) || (cardData['can-attack'] && !inMelee && inRange)) { 
        // turn off
        cardData['cast-strats'].push({
          priority: 5,
          skill: 'ult',
          card: ult.attr('id'),
          target: card.attr('id')
        });
      }
    }
    if (card.canCast(cry)) {
      cardData['can-cast'] = true;
      cardData['cast-strats'].push({
          priority: 50,
          skill: 'cry',
          card: cry.attr('id'),
          target: card.attr('id')
        });
    }
    card.data('ai', JSON.stringify(cardData));
  },
  defend: function (card, cardData) {
    var bear = card.data('bear');
    if (bear) {
      card.data('ai priority bonus', -20);
    }
    var roar = game.data.skills.ld.roar;
    card.inRange(roar['aoe range'], function (spot) {
      var spotData = JSON.parse(spot.data('ai'));
      spotData.priority -= 25;
      spotData['can-be-casted'] = true;
      spot.data('ai', JSON.stringify(spotData));
    });
    if (card.hasBuff('ld-ult')) {
      card.data('ai priority bonus', -10);
    }
    //console.log('defend-from-ld');
    //if bear in opponent area path block tower
  }
};