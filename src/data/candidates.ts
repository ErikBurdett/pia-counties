import type { CountySite } from "./counties";

export type CandidateScope = "statewide" | "district" | "county" | "precinct" | "city";

export type Candidate = {
  id: string;
  name: string;
  office: string;
  stateSlug: string;
  scope: CandidateScope;
  countySlug?: string;
  countyName?: string;
  district?: string;
  profileUrl?: string;
};

export const candidates: Candidate[] = [
  { id: "chasity-wedgeworth", name: "Chasity Wedgeworth", office: "Texas Congressional District 13", stateSlug: "texas", scope: "district", district: "Congressional District 13" },
  { id: "jamie-haynes", name: "Jamie Haynes", office: "State Representative District 86", stateSlug: "texas", scope: "district", district: "State Representative District 86" },
  { id: "thomas-smith", name: "Thomas Smith", office: "Texas Supreme Court Criminal Court of Appeals Place 3", stateSlug: "texas", scope: "statewide" },
  { id: "michelle-meredino", name: "Michelle Meredino", office: "Liberty County Judge - 75th District Court", stateSlug: "texas", scope: "county", countySlug: "liberty", countyName: "Liberty County" },
  { id: "paul-herrman", name: "Paul Herrman", office: "Randall County Judge Court 1", stateSlug: "texas", scope: "county", countySlug: "randall", countyName: "Randall County" },
  { id: "mayes-middleton", name: "Mayes Middleton", office: "Texas Attorney General", stateSlug: "texas", scope: "statewide" },
  { id: "jonathan-mitchell", name: "Jonathan Mitchell", office: "Texas Congressional District 36", stateSlug: "texas", scope: "district", district: "Congressional District 36" },
  { id: "apollo-hernandez", name: "Apollo Hernandez", office: "State Senate 5", stateSlug: "texas", scope: "district", district: "State Senate 5" },
  { id: "alan-paige", name: "Alan Paige", office: "Hudspeth County Constable", stateSlug: "texas", scope: "county", countySlug: "hudspeth", countyName: "Hudspeth County" },
  { id: "al-lujan", name: "Al Lujan", office: "El Paso County Chair", stateSlug: "texas", scope: "county", countySlug: "el-paso", countyName: "El Paso County" },
  { id: "brett-ferguson", name: "Brett Ferguson", office: "Kerr County Court of Law", stateSlug: "texas", scope: "county", countySlug: "kerr", countyName: "Kerr County" },
  { id: "shandi-williams", name: "Shandi Williams", office: "Midland City Council Place 3", stateSlug: "texas", scope: "city", countySlug: "midland", countyName: "Midland County" },
  { id: "traci-baxa", name: "Traci Baxa", office: "Lubbock County Justice of the Peace Precinct 3", stateSlug: "texas", scope: "precinct", countySlug: "lubbock", countyName: "Lubbock County" },
  { id: "ken-mathews", name: "Ken Mathews", office: "Fort Bend County Commissioners Place 4", stateSlug: "texas", scope: "county", countySlug: "fort-bend", countyName: "Fort Bend County" },
  { id: "blair-schaefer", name: "Blair Schaefer", office: "Potter County Commissioner Precinct 2", stateSlug: "texas", scope: "precinct", countySlug: "potter", countyName: "Potter County" },
  { id: "amanda-mayfield", name: "Amanda Mayfield", office: "Potter County Justice of The Peace Precinct 1", stateSlug: "texas", scope: "precinct", countySlug: "potter", countyName: "Potter County" },
  { id: "joanna-garcia-flores", name: "Joanna Garcia Flores", office: "Randall County Justice of The Peace Precinct 4", stateSlug: "texas", scope: "precinct", countySlug: "randall", countyName: "Randall County" },
  { id: "rashelle-fetty", name: "Rashelle Fetty", office: "Judge of the Texas 231st District Court", stateSlug: "texas", scope: "district", district: "Texas 231st District Court" },
  { id: "aj-casias", name: "AJ Casias", office: "Potter County Justice of The Peace Precinct 2", stateSlug: "texas", scope: "precinct", countySlug: "potter", countyName: "Potter County" },
  { id: "daniel-w-betts", name: "Daniel W. Betts", office: "Texas Congressional District 21", stateSlug: "texas", scope: "district", district: "Congressional District 21" },
  { id: "james-stewart", name: "James Stewart", office: "Kerr County Judge", stateSlug: "texas", scope: "county", countySlug: "kerr", countyName: "Kerr County" },
  { id: "frank-salazar", name: "Frank Salazar", office: "Texas House District 143", stateSlug: "texas", scope: "district", district: "House District 143" },
  { id: "andrew-smith", name: "Andrew Smith", office: "Randall County Court of Law 1", stateSlug: "texas", scope: "county", countySlug: "randall", countyName: "Randall County" },
  { id: "holly-jeffreys", name: "Holly Jeffreys", office: "Texas House District 86", stateSlug: "texas", scope: "district", district: "House District 86" },
  { id: "gulrez-gus-khan", name: "Gulrez Gus Khan", office: "Texas U.S. Senate", stateSlug: "texas", scope: "statewide" },
  { id: "evelyn-brooks", name: "Evelyn Brooks", office: "Governor of Texas", stateSlug: "texas", scope: "statewide" },
  { id: "jim-baxa", name: "Jim Baxa", office: "Lubbock County Clerk", stateSlug: "texas", scope: "county", countySlug: "lubbock", countyName: "Lubbock County" },
  { id: "sylvester-vanerson", name: "Sylvester Vanerson", office: "Tarrant County Precinct Chair 4250", stateSlug: "texas", scope: "precinct", countySlug: "tarrant", countyName: "Tarrant County" },
  { id: "judge-robert-taylor", name: "Judge Robert Taylor", office: "Potter County Justice of The Peace Precinct 2", stateSlug: "texas", scope: "precinct", countySlug: "potter", countyName: "Potter County" },
  { id: "cathy-welch", name: "Cathy Welch", office: "Randall County Precinct 421 Chair", stateSlug: "texas", scope: "precinct", countySlug: "randall", countyName: "Randall County" },
  { id: "lesli-fitzpatrick", name: "Lesli Fitzpatrick", office: "Judge Court of Criminal Appeals Place 3", stateSlug: "texas", scope: "statewide" },
  { id: "zachary-price", name: "Zachary Price", office: "Palo Pinto County Precinct Chair 1", stateSlug: "texas", scope: "precinct", countySlug: "palo-pinto", countyName: "Palo Pinto County" },
  { id: "chad-seay", name: "Chad Seay", office: "Lubbock County Commissioner Precinct 4", stateSlug: "texas", scope: "precinct", countySlug: "lubbock", countyName: "Lubbock County" },
  { id: "tanya-lovenburg", name: "Tanya Lovenburg", office: "Precinct 14 Chair of Nacogdoches County", stateSlug: "texas", scope: "precinct", countySlug: "nacogdoches", countyName: "Nacogdoches County" },
  { id: "daniel-caldwell", name: "Daniel Caldwell", office: "Denton County Justice of The Peace 3", stateSlug: "texas", scope: "precinct", countySlug: "denton", countyName: "Denton County" },
  { id: "ryan-zink", name: "Ryan Zink", office: "Texas Congressional District 19", stateSlug: "texas", scope: "district", district: "Congressional District 19" },
  { id: "elizabeth-waters", name: "Elizabeth Waters", office: "Freestone County Precinct Chair 1", stateSlug: "texas", scope: "precinct", countySlug: "freestone", countyName: "Freestone County" },
  { id: "judge-gary-jackson", name: "Judge Gary Jackson", office: "Potter County Justice of The Peace Precinct 3", stateSlug: "texas", scope: "precinct", countySlug: "potter", countyName: "Potter County" },
  { id: "sid-miller", name: "Sid Miller", office: "Texas Agriculture Commissioner", stateSlug: "texas", scope: "statewide" },
  { id: "james-matlock", name: "James Matlock", office: "Texas Railroad Commissioner", stateSlug: "texas", scope: "statewide" },
  { id: "jim-wright", name: "Jim Wright", office: "Texas Railroad Commissioner", stateSlug: "texas", scope: "statewide" },
  { id: "quenton-todd-hatter", name: "Quenton Todd Hatter", office: "Randall County Court at Law Place 1", stateSlug: "texas", scope: "county", countySlug: "randall", countyName: "Randall County" },
  { id: "bryan-tackett", name: "Bryan Tackett", office: "Potter County Justice of The Peace Precinct 1", stateSlug: "texas", scope: "precinct", countySlug: "potter", countyName: "Potter County" },
  { id: "zach-harvey", name: "Zach Harvey", office: "Potter County Justice of The Peace Precinct 3", stateSlug: "texas", scope: "precinct", countySlug: "potter", countyName: "Potter County" },
  { id: "jeff-raef", name: "Jeff Raef", office: "Potter County Commissioner Precinct 2", stateSlug: "texas", scope: "precinct", countySlug: "potter", countyName: "Potter County" },
  { id: "gary-house", name: "Gary House", office: "Plainview City Council Place 4", stateSlug: "texas", scope: "city", countySlug: "hale", countyName: "Hale County" },
];

export function getCandidatesForState(stateSlug?: string) {
  if (!stateSlug) return [];
  return sortCandidates(candidates.filter((candidate) => candidate.stateSlug === stateSlug.toLowerCase()));
}

export function getCandidatesForCounty(county: CountySite) {
  return sortCandidates(
    candidates.filter((candidate) => candidate.stateSlug === county.state.slug && candidate.countySlug === county.slug),
  );
}

export function getStatewideCandidates(stateSlug?: string) {
  return getCandidatesForState(stateSlug).filter((candidate) => candidate.scope === "statewide");
}

export function getLocalCandidatesForState(stateSlug?: string) {
  return getCandidatesForState(stateSlug).filter((candidate) => candidate.scope !== "statewide");
}

function sortCandidates(items: Candidate[]) {
  return [...items].sort((first, second) => first.name.localeCompare(second.name));
}
