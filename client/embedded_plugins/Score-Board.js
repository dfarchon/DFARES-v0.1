const SCORE_TYPES = {
  withdrawArtifact: {
    label: 'Silver + Artifact',
    title: 'Silver + Artifact Score',
    description: 'Withdraw silver + mint artifact score. Higher is better.',
    columnLabel: 'score',
    sortDirection: 'desc',
  },
  claimDistance: {
    label: 'Claim Distance',
    title: 'Claimed Planet Distance',
    description: 'Closest claimed planet to center. Lower is better.',
    columnLabel: 'distance',
    sortDirection: 'asc',
  },
};

const DEFAULT_SCORE_TYPE = 'withdrawArtifact';
const MAX_UINT256 = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

function print_score(players) {
  console.log(`total ${players.length}`);

  for (let player of players) {
    console.log(`${player.player}: ${player.score}`);
  }
}

function scoreToNumber(score) {
  if (score === undefined || score === null) {
    return undefined;
  }

  if (typeof score === 'number') {
    return score;
  }

  if (score.toHexString && score.toHexString() === MAX_UINT256) {
    return undefined;
  }

  if (score.toNumber) {
    return score.toNumber();
  }

  const parsed = Number(score);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function get_score(scores, scoreType) {
  return scores ? scores[scoreType] : undefined;
}

async function get_claim_distance_score(address) {
  const localScore = scoreToNumber(df.getPlayerClaimDistanceScore(address));
  if (localScore !== undefined) {
    return localScore;
  }

  try {
    if (df.contractsAPI.getClaimDistanceScore) {
      return scoreToNumber(await df.contractsAPI.getClaimDistanceScore(address));
    }

    if (df.contractsAPI.contract.getScore) {
      return scoreToNumber(await df.contractsAPI.contract.getScore(address));
    }
  } catch (e) {
    console.warn('failed to fetch claim distance score', address, e);
  }

  return undefined;
}

function sort_players(m, scoreType) {
  let a = Array.from(m);

  let sortPart = a.filter((t) => get_score(t[1], scoreType) !== undefined);
  let notSortPart = a.filter((t) => get_score(t[1], scoreType) === undefined);
  const sortDirection = SCORE_TYPES[scoreType].sortDirection;

  sortPart.sort((a, b) => {
    const scoreA = get_score(a[1], scoreType);
    const scoreB = get_score(b[1], scoreType);
    const scoreDiff = sortDirection === 'asc' ? scoreA - scoreB : scoreB - scoreA;
    return scoreDiff || a[0].localeCompare(b[0]);
  });

  let res = [];
  for (let i = 0; i < sortPart.length; i++) {
    let t = sortPart[i];
    res.push(t);
  }

  for (let i = 0; i < notSortPart.length; i++) {
    let t = notSortPart[i];
    res.push(t);
  }

  return res;
}

function create_head(scoreType) {
  let row = document.createElement('tr');
  row.style.width = '100%';
  row.style.height = '26px';

  for (let i = 0; i < 3; i++) {
    let field = document.createElement('th');
    row.appendChild(field);
  }

  row.children[0].innerHTML = 'place';
  row.children[1].innerHTML = 'player';
  row.children[2].innerHTML = SCORE_TYPES[scoreType].columnLabel; //row.children[0].style.width = "100px";// no effect

  row.children[0].style.width = '40px';
  row.children[1].style.width = '146px';
  row.children[2].style.width = '80px'; //row.children[2].innerHTML = "junk";

  return row;
}

function create_row() {
  let row = document.createElement('tr');
  row.style.width = '100%';
  row.style.height = '26px';
  let rank = document.createElement('td');
  rank.style.textAlign = 'right';
  row.appendChild(rank);
  let user = document.createElement('td'); //field1.style.width = "100px";// no effect

  user.style.maxWidth = '146px';
  user.style.overflow = 'hidden';
  row.appendChild(user);
  let score = document.createElement('td');
  score.style.textAlign = 'right';
  row.appendChild(score);
  return row;
}

function timestampSection(value) {
  return value.toString().padStart(2, '0');
}

class Plugin {
  constructor() {
    // this.begin_time = new Date('2023-07-19 19:00:00.000 GMT+0800');
    this.end_time = new Date(df.getEndTimeSeconds() * 1000);
    this.timer = document.createElement('div');
    this.timer.style.width = '100%';
    this.timer.style.textAlign = 'center';

    this.table = document.createElement('table'); //this.table.style.width = '100%';

    this.table.style.maxHeight = '300px';
    this.table.style.display = 'block';
    this.table.style.borderSpacing = '8px 0'; // take effect only when borderCollapse is `separate`

    this.table.style.borderCollapse = 'separate';
    this.table.style.overflow = 'scroll'; //this.table.style. tableLayout="fixed";
    // this.table.style.height = '26px';
    //this.table.style.textAlign = "right";

    this.active_score_type = DEFAULT_SCORE_TYPE;
    this.score_type_title = document.createElement('div');
    this.score_type_title.style.marginTop = '4px';
    this.score_type_title.style.textAlign = 'center';
    this.score_type_title.style.fontSize = '12px';
    this.score_type_controls = document.createElement('div');
    this.score_type_controls.style.display = 'flex';
    this.score_type_controls.style.gap = '4px';
    this.score_type_controls.style.margin = '4px 0';
    this.score_type_buttons = {};

    for (let scoreType of Object.keys(SCORE_TYPES)) {
      let button = document.createElement('button');
      button.style.flex = '1';
      button.style.height = '26px';
      button.innerText = SCORE_TYPES[scoreType].label;
      button.onclick = () => {
        this.active_score_type = scoreType;
        this.update_score_type_controls();
        this.update_table();
        if (scoreType === 'claimDistance') {
          this.update_players();
        }
      };
      this.score_type_buttons[scoreType] = button;
      this.score_type_controls.appendChild(button);
    }
    this.update_score_type_controls();

    this.table.appendChild(create_head(this.active_score_type));
    let n = df.getAllPlayers().length;
    for (let i = 0; i < n; i++) {
      this.table.appendChild(create_row());
    }

    this.n = n;
    this.scoreboard = new Map();
    this.refresh_button = document.createElement('button');
    this.refresh_button.style.width = '100%';
    this.refresh_button.style.height = '26px';
    this.refresh_button.innerText = 'refresh';
    this.refresh_button.onclick = this.update_players;
    this.interval_handle = window.setInterval(this.update_timer, 1000);
    this.update_timer();
    this.update_players();
  }

  update_score_type_controls = () => {
    const activeScoreType = SCORE_TYPES[this.active_score_type];
    this.score_type_title.innerHTML = `<strong>${activeScoreType.title}</strong><br/>${activeScoreType.description}`;

    for (let scoreType of Object.keys(SCORE_TYPES)) {
      const button = this.score_type_buttons[scoreType];
      button.disabled = scoreType === this.active_score_type;
      button.style.fontWeight = scoreType === this.active_score_type ? 'bold' : 'normal';
    }
  };
  update_timer = () => {
    let now = new Date();
    let t = Math.floor((this.end_time - now) / 1000);

    if (t < 0) {
      t = 0;
    }

    let h = Math.floor(t / 3600);
    let m = Math.floor((t - h * 3600) / 60);
    let s = t - h * 3600 - m * 60;
    this.timer.innerText =
      timestampSection(h) + ':' + timestampSection(m) + ':' + timestampSection(s);
  };
  update_table = () => {
    let players = sort_players(this.scoreboard, this.active_score_type);
    this.table.children[0].children[2].innerHTML = SCORE_TYPES[this.active_score_type].columnLabel;

    for (let i = this.n; i < players.length; i++) {
      this.table.appendChild(create_row());
    }

    for (let i = players.length + 1; i < this.table.children.length; i++) {
      this.table.children[i].style.display = 'none';
    }

    for (let i = 0; i < players.length; i++) {
      const row = this.table.children[i + 1];
      row.style.display = '';
      row.style.color = '';
      row.children[0].innerHTML = `${i + 1}.`; // rank

      const score = get_score(players[i][1], this.active_score_type);
      row.children[2].innerHTML = score === undefined ? 'n/a' : score; //score

      let name = players[i][0];
      let p_data = df.players.get(name);

      if (p_data && p_data.twitter) {
        name = `<a href="https://twitter.com/${p_data.twitter}" >@${p_data.twitter}</a>`;
      }

      row.children[1].innerHTML = name;
    }

    this.n = players.length;

    if (players.length >= 1) {
      this.table.children[1].style.color = '#ff44b7';
    }

    const lvl_2 = Math.min(players.length, 3);
    for (let i = 2; i <= lvl_2; i++) {
      this.table.children[i].style.color = '#f8b73e';
    }

    const lvl_3 = Math.min(players.length, 7);
    for (let i = 4; i <= lvl_3; i++) {
      this.table.children[i].style.color = '#c13cff';
    }

    const lvl_4 = Math.min(players.length, 15);
    for (let i = 8; i <= lvl_4; i++) {
      this.table.children[i].style.color = '#6b68ff';
    }

    const lvl_5 = Math.min(players.length, 31);
    for (let i = 16; i <= lvl_5; i++) {
      this.table.children[i].style.color = 'green';
    }

    const lvl_6 = Math.min(players.length, 63);
    for (let i = 32; i <= lvl_6; i++) {
      this.table.children[i].style.color = 'white';
    }
  };
  update_score = async (players) => {
    if (!this.table) {
      return;
    }

    const entries = await Promise.all(
      players.map(async (player) => {
        let address = player.player.toLowerCase();
        let scores = this.scoreboard.get(address) || {};
        scores.withdrawArtifact = scoreToNumber(df.getPlayerScore(address));
        scores.claimDistance = scoreToNumber(df.getPlayerClaimDistanceScore(address));

        if (scores.withdrawArtifact === undefined) {
          scores.withdrawArtifact = scoreToNumber(player.score);
        }

        if (scores.claimDistance === undefined && this.active_score_type === 'claimDistance') {
          scores.claimDistance = await get_claim_distance_score(address);
        }

        return [address, scores];
      })
    );

    for (let entry of entries) {
      this.scoreboard.set(entry[0], entry[1]);
    }

    this.update_table();
  };
  update_players = async () => {
    this.refresh_button.innerText = 'refreshing...';
    this.refresh_button.disabled = true;
    let player_numbers = await df.contractsAPI.contract.getNPlayers();
    player_numbers = player_numbers.toNumber();
    console.log('players', player_numbers);
    let counter = 0;
    const batch_size = 100;

    for (let i = 0; i < player_numbers; i += batch_size) {
      const end = i + batch_size < player_numbers ? i + batch_size : player_numbers;
      df.contractsAPI.contract.bulkGetPlayers(i, end).then(async (values) => {
        //players.push(...values);
        //print_score(values);
        await this.update_score(values);
        counter += values.length;
        console.log('update score for player', counter);
        this.refresh_button.innerText = `refreshing...${Math.floor(
          (counter * 100) / player_numbers
        )}%`;

        if (counter === player_numbers) {
          this.refresh_button.innerText = 'refresh';
          this.refresh_button.disabled = false;
        }
      });
    }
  };
  /**
   * Called when plugin is launched with the "run" button.
   */

  async render(container) {
    container.style.width = '300px';
    container.appendChild(this.timer);
    container.appendChild(this.score_type_title);
    container.appendChild(this.score_type_controls);
    container.appendChild(this.table);
    container.appendChild(this.refresh_button);
  }
  /**
   * Called when plugin modal is closed.
   */

  destroy() {
    this.timer = null;
    this.table = null;
    this.score_type_title = null;
    this.score_type_controls = null;
    this.score_type_buttons = null;
    this.refresh_button = null;

    if (this.interval_handle) {
      window.clearInterval(this.interval_handle);
      this.interval_handle = null;
    }
  }
}
/**
 * And don't forget to export it!
 */

export default Plugin;
