game.skills.en = {
  passive: {
    passive: function (skill, source, target) {
      source.selfBuff(skill, 'passive-self');
      source.data('en-passive', skill.attr('id'));
      source.on('pre-attacked.en-passive', this.attacked);
    },
    attacked: function (event, eventdata) {
      var source = eventdata.source;
      var target = eventdata.target;
      var skill = $('#'+target.data('en-passive'));
      var buff = target.addBuff(source, skill, 'passive-attacker');
      if (buff) eventdata.bonus += -1 * buff.data('damage reduction');
    }
  },
  curse: {
    cast: function (skill, source, target) { //console.log('curse',skill, source, target)
      var side = source.side();
      var opponent = source.opponent();
      if (target.hasAllClasses('spot jungle free')) {
        var creep = game.units.forestCreep(side, target);
        creep.select();
      } else {
        if (!target.hasClass('card')) target = $('.card', target);
        if (target.hasAllClasses(opponent +' heroes') || target.hasAllClasses(opponent +' ld-summon')) {
          source.addBuff(target, skill);
        } else if (target.hasAllClasses(opponent +' units')) {
          target.removeClass(opponent+' attacktarget').addClass(side).data('side', side);
        }
      }
    }
  },
  heal: {
    cast: function (skill, source) {
      var range = skill.data('cast range');
      if (source.data('skill range bonus')) range += source.data('skill range bonus');
      var side = source.side(),
          buff = source.selfBuff(skill),
          allies = [], targets = [];
      source.on('death', this.death);
      source.around(range, function (spot) {
        var target = $('.card', spot);
        if (target.hasClass(side) && !target.hasClasses('towers bkb cycloned')) allies.push(target);
      });
      if (allies.length) {
        if (allies.length > skill.data('max targets')) {
          for (var i=0; i<skill.data('max targets'); i++) {
            var r = Math.floor(game.random() * allies.length);
            var randomAlly = allies[r];
            targets.push(randomAlly);
            allies.erase(randomAlly);
          }
        } else targets = allies;
        source.heal(buff.data('heal'));
        buff.on('buffcount', game.skills.en.heal.buffcount);
        buff.on('expire', game.skills.en.heal.buffcount);
        $(targets).each(function (i, target) {
          //console.log(target, skill);
          buff = source.addBuff(target, skill);
          target.heal(buff.data('heal'));
          buff.on('buffcount', game.skills.en.heal.buffcount);
          buff.on('expire', game.skills.en.heal.buffcount);
        });
      }
    },
    buffcount: function (event, eventdata) {
      var target = eventdata.target;
      var buff = eventdata.buff;
      if (buff.data('duration') !== 3) target.heal(buff.data('heal'));
    },
    death: function (event, eventdata) {
      var target = eventdata.target;
      var side = target.side();
      $('.map .card.'+side).each(function () {
        var ally = $(this);
        ally.removeBuff('en-heal');
      });
    }
  },
  ult: {
    cast: function (skill, source, target) {
      var damage = source.data('current damage');
      var x = Math.abs(source.getX() - target.getX());
      var y = Math.abs(source.getY() - target.getY());
      var bonus = (x + y) * 2;
      source.setDamage(damage + bonus).addClass('nohighlight');
      source.attack(target, 'force', 'ult');
      game.timeout(200, function (source, damage) {
        source.removeClass('nohighlight').setDamage(damage);
      }.bind(this, source, damage));
    }
  }
};
