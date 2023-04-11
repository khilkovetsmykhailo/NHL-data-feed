interface LeagueRecord {
  wins: number;
  losses: number;
  ot: number;
  type: string;
}

interface Team {
  id: number;
  name: string;
  link: string;
}

interface Score {
  leagueRecord: LeagueRecord;
  score: number;
  team: Team;
}

interface Status {
  abstractGameState: string;
  codedGameState: string;
  detailedState: string;
  statusCode: string;
  startTimeTBD: boolean;
}

interface Venue {
  id: number;
  name: string;
  link: string;
}

interface Game {
  gamePk: number;
  link: string;
  gameType: string;
  season: string;
  gameDate: string;
  status: Status;
  teams: {
    away: Score;
    home: Score;
  };
  venue: Venue;
  content: {
    link: string;
  };
}

interface Date {
  date: string;
  totalItems: number;
  totalEvents: number;
  totalGames: number;
  totalMatches: number;
  games: Game[];
  events: any[];
  matches: any[];
}

interface MetaData {
  timeStamp: string;
}

export interface NHLScheduleResponse {
  copyright: string;
  totalItems: number;
  totalEvents: number;
  totalGames: number;
  totalMatches: number;
  metaData: MetaData;
  wait: number;
  dates: Date[];
}

interface HockeyPlayerGameInfo {
  person: {
    id: number;
    fullName: string;
    link: string;
    firstName: string;
    lastName: string;
    primaryNumber: string;
    birthDate: string;
    currentAge: number;
    birthCity: string;
    birthStateProvince: string;
    birthCountry: string;
    nationality: string;
    height: string;
    weight: number;
    active: boolean;
    alternateCaptain: boolean;
    captain: boolean;
    rookie: boolean;
    shootsCatches: string;
    rosterStatus: string;
    currentTeam: {
      id: number;
      name: string;
      link: string;
    };
    primaryPosition: {
      code: string;
      name: string;
      type: string;
      abbreviation: string;
    };
  };
  jerseyNumber: string;
  position: {
    code: string;
    name: string;
    type: string;
    abbreviation: string;
  };
  stats: {
    skaterStats: {
      timeOnIce: string;
      assists: number;
      goals: number;
      shots: number;
      hits: number;
      powerPlayGoals: number;
      powerPlayAssists: number;
      penaltyMinutes: number;
      faceOffWins: number;
      faceoffTaken: number;
      takeaways: number;
      giveaways: number;
      shortHandedGoals: number;
      shortHandedAssists: number;
      blocked: number;
      plusMinus: number;
      evenTimeOnIce: string;
      powerPlayTimeOnIce: string;
      shortHandedTimeOnIce: string;
      points: number;
    };
  };
}

interface HockeyTeamGameInfo {
  team: { id: number; name: string };
  players: { [id: string]: HockeyPlayerGameInfo };
}

export interface NHLGameInfoResponse {
  teams: {
    away: HockeyTeamGameInfo;
    home: HockeyTeamGameInfo;
  };
}
