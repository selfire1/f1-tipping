export type RaceResponse = ErgastResponse<{
  RaceTable?: RaceTable;
}>;

export type DriverResponse = ErgastResponse<{
  DriverTable: DriverTable;
}>;
export type ConstructorsResponse = ErgastResponse<{
  ConstructorTable: {
    Constructors: {
      constructorId?: string;
      url?: string;
      name: string;
      nationality?: string;
    }[];
  };
}>;

interface MRData {
  xmlns: string;
  series: "f1";
  url: string;
  limit: string;
  offset: string;
  total: string;
}

type ErgastResponse<T> = {
  MRData: MRData & T;
};

interface RaceTable {
  season: string;
  Races: Race[];
}

interface Race {
  season: string;
  round: string;
  raceName: string;
  Circuit: Circuit;
  date: string; // ISO date string
  time?: string; // Optional ISO time string
  FirstPractice?: Session;
  SecondPractice?: Session;
  ThirdPractice?: Session;
  Qualifying?: Session;
  Sprint?: Session;
  SprintQualifying?: Session;
}

interface Circuit {
  circuitId: string;
  url: string;
  circuitName: string;
  Location: Location;
}

interface Location {
  lat: string; // Latitude as a string
  long: string; // Longitude as a string
  locality: string;
  country: string;
}

interface Session {
  date: string; // ISO date string
  time?: string; // Optional ISO time string
}

interface DriverTable {
  season: string;
  Drivers: Driver[];
}

interface Driver {
  driverId: string;
  permanentNumber: string;
  code: string;
  url: string;
  givenName: string;
  familyName: string;
  dateOfBirth: string; // ISO date string
  nationality: string;
}
