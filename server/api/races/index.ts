import type * as F1Api from "~~/types/f1Api";

export default defineEventHandler(async (_event): Promise<F1Api.Race[]> => {
  const races = getRaces();
  return races.MRData.RaceTable.Races;
});

function getRaces(): F1Api.Response {
  return {
    MRData: {
      xmlns: "",
      series: "f1",
      url: "http://api.jolpi.ca/ergast/f1/2025/races/",
      limit: "30",
      offset: "0",
      total: "24",
      RaceTable: {
        season: "2025",
        Races: [
          {
            season: "2025",
            round: "1",
            raceName: "Australian Grand Prix",
            Circuit: {
              circuitId: "albert_park",
              url: "https://en.wikipedia.org/wiki/Albert_Park_Circuit",
              circuitName: "Albert Park Grand Prix Circuit",
              Location: {
                lat: "-37.8497",
                long: "144.968",
                locality: "Melbourne",
                country: "Australia",
              },
            },
            date: "2025-03-16",
            time: "04:00:00Z",
            FirstPractice: {
              date: "2025-03-14",
              time: "01:30:00Z",
            },
            SecondPractice: {
              date: "2025-03-14",
              time: "05:00:00Z",
            },
            ThirdPractice: {
              date: "2025-03-15",
              time: "01:30:00Z",
            },
            Qualifying: {
              date: "2025-03-15",
              time: "05:00:00Z",
            },
          },
          {
            season: "2025",
            round: "2",
            raceName: "Chinese Grand Prix",
            Circuit: {
              circuitId: "shanghai",
              url: "https://en.wikipedia.org/wiki/Shanghai_International_Circuit",
              circuitName: "Shanghai International Circuit",
              Location: {
                lat: "31.3389",
                long: "121.22",
                locality: "Shanghai",
                country: "China",
              },
            },
            date: "2025-03-23",
            time: "07:00:00Z",
            FirstPractice: {
              date: "2025-03-21",
              time: "03:30:00Z",
            },
            Qualifying: {
              date: "2025-03-22",
              time: "07:00:00Z",
            },
            Sprint: {
              date: "2025-03-22",
              time: "03:00:00Z",
            },
            SprintQualifying: {
              date: "2025-03-21",
              time: "07:30:00Z",
            },
          },
          {
            season: "2025",
            round: "3",
            raceName: "Japanese Grand Prix",
            Circuit: {
              circuitId: "suzuka",
              url: "https://en.wikipedia.org/wiki/Suzuka_International_Racing_Course",
              circuitName: "Suzuka Circuit",
              Location: {
                lat: "34.843100000000014",
                long: "136.541",
                locality: "Suzuka",
                country: "Japan",
              },
            },
            date: "2025-04-06",
            time: "06:00:00Z",
            FirstPractice: {
              date: "2025-04-04",
              time: "03:30:00Z",
            },
            SecondPractice: {
              date: "2025-04-04",
              time: "07:00:00Z",
            },
            ThirdPractice: {
              date: "2025-04-05",
              time: "03:30:00Z",
            },
            Qualifying: {
              date: "2025-04-05",
              time: "07:00:00Z",
            },
          },
          {
            season: "2025",
            round: "4",
            raceName: "Bahrain Grand Prix",
            Circuit: {
              circuitId: "bahrain",
              url: "https://en.wikipedia.org/wiki/Bahrain_International_Circuit",
              circuitName: "Bahrain International Circuit",
              Location: {
                lat: "26.0325",
                long: "50.5106",
                locality: "Sakhir",
                country: "Bahrain",
              },
            },
            date: "2025-04-13",
            time: "16:00:00Z",
            FirstPractice: {
              date: "2025-04-11",
              time: "12:30:00Z",
            },
            SecondPractice: {
              date: "2025-04-11",
              time: "16:00:00Z",
            },
            ThirdPractice: {
              date: "2025-04-12",
              time: "13:30:00Z",
            },
            Qualifying: {
              date: "2025-04-12",
              time: "17:00:00Z",
            },
          },
          {
            season: "2025",
            round: "5",
            raceName: "Saudi Arabian Grand Prix",
            Circuit: {
              circuitId: "jeddah",
              url: "https://en.wikipedia.org/wiki/Jeddah_Corniche_Circuit",
              circuitName: "Jeddah Corniche Circuit",
              Location: {
                lat: "21.631899999999998",
                long: "39.1044",
                locality: "Jeddah",
                country: "Saudi Arabia",
              },
            },
            date: "2025-04-20",
            time: "18:00:00Z",
            FirstPractice: {
              date: "2025-04-18",
              time: "14:30:00Z",
            },
            SecondPractice: {
              date: "2025-04-18",
              time: "18:00:00Z",
            },
            ThirdPractice: {
              date: "2025-04-19",
              time: "14:30:00Z",
            },
            Qualifying: {
              date: "2025-04-19",
              time: "18:00:00Z",
            },
          },
          {
            season: "2025",
            round: "6",
            raceName: "Miami Grand Prix",
            Circuit: {
              circuitId: "miami",
              url: "https://en.wikipedia.org/wiki/Miami_International_Autodrome",
              circuitName: "Miami International Autodrome",
              Location: {
                lat: "25.9581",
                long: "-80.2389",
                locality: "Miami",
                country: "USA",
              },
            },
            date: "2025-05-04",
            time: "21:00:00Z",
            FirstPractice: {
              date: "2025-05-02",
              time: "17:30:00Z",
            },
            Qualifying: {
              date: "2025-05-03",
              time: "21:00:00Z",
            },
            Sprint: {
              date: "2025-05-03",
              time: "17:00:00Z",
            },
            SprintQualifying: {
              date: "2025-05-02",
              time: "21:30:00Z",
            },
          },
          {
            season: "2025",
            round: "7",
            raceName: "Emilia Romagna Grand Prix",
            Circuit: {
              circuitId: "imola",
              url: "https://en.wikipedia.org/wiki/Imola_Circuit",
              circuitName: "Autodromo Enzo e Dino Ferrari",
              Location: {
                lat: "44.343899999999984",
                long: "11.7167",
                locality: "Imola",
                country: "Italy",
              },
            },
            date: "2025-05-18",
            time: "14:00:00Z",
            FirstPractice: {
              date: "2025-05-16",
              time: "12:30:00Z",
            },
            SecondPractice: {
              date: "2025-05-16",
              time: "16:00:00Z",
            },
            ThirdPractice: {
              date: "2025-05-17",
              time: "11:30:00Z",
            },
            Qualifying: {
              date: "2025-05-17",
              time: "15:00:00Z",
            },
          },
          {
            season: "2025",
            round: "8",
            raceName: "Monaco Grand Prix",
            Circuit: {
              circuitId: "monaco",
              url: "https://en.wikipedia.org/wiki/Circuit_de_Monaco",
              circuitName: "Circuit de Monaco",
              Location: {
                lat: "43.7347",
                long: "7.42056",
                locality: "Monte-Carlo",
                country: "Monaco",
              },
            },
            date: "2025-05-25",
            time: "14:00:00Z",
            FirstPractice: {
              date: "2025-05-23",
              time: "12:30:00Z",
            },
            SecondPractice: {
              date: "2025-05-23",
              time: "16:00:00Z",
            },
            ThirdPractice: {
              date: "2025-05-24",
              time: "11:30:00Z",
            },
            Qualifying: {
              date: "2025-05-24",
              time: "15:00:00Z",
            },
          },
          {
            season: "2025",
            round: "9",
            raceName: "Spanish Grand Prix",
            Circuit: {
              circuitId: "catalunya",
              url: "https://en.wikipedia.org/wiki/Circuit_de_Barcelona-Catalunya",
              circuitName: "Circuit de Barcelona-Catalunya",
              Location: {
                lat: "41.57",
                long: "2.26111",
                locality: "Montmeló",
                country: "Spain",
              },
            },
            date: "2025-06-01",
            time: "14:00:00Z",
            FirstPractice: {
              date: "2025-05-30",
              time: "12:30:00Z",
            },
            SecondPractice: {
              date: "2025-05-30",
              time: "16:00:00Z",
            },
            ThirdPractice: {
              date: "2025-05-31",
              time: "11:30:00Z",
            },
            Qualifying: {
              date: "2025-05-31",
              time: "15:00:00Z",
            },
          },
          {
            season: "2025",
            round: "10",
            raceName: "Canadian Grand Prix",
            Circuit: {
              circuitId: "villeneuve",
              url: "https://en.wikipedia.org/wiki/Circuit_Gilles_Villeneuve",
              circuitName: "Circuit Gilles Villeneuve",
              Location: {
                lat: "45.5",
                long: "-73.5228",
                locality: "Montreal",
                country: "Canada",
              },
            },
            date: "2025-06-15",
            time: "19:00:00Z",
            FirstPractice: {
              date: "2025-06-13",
              time: "18:30:00Z",
            },
            SecondPractice: {
              date: "2025-06-13",
              time: "22:00:00Z",
            },
            ThirdPractice: {
              date: "2025-06-14",
              time: "17:30:00Z",
            },
            Qualifying: {
              date: "2025-06-14",
              time: "21:00:00Z",
            },
          },
          {
            season: "2025",
            round: "11",
            raceName: "Austrian Grand Prix",
            Circuit: {
              circuitId: "red_bull_ring",
              url: "https://en.wikipedia.org/wiki/Red_Bull_Ring",
              circuitName: "Red Bull Ring",
              Location: {
                lat: "47.2197",
                long: "14.7647",
                locality: "Spielberg",
                country: "Austria",
              },
            },
            date: "2025-06-29",
            time: "14:00:00Z",
            FirstPractice: {
              date: "2025-06-27",
              time: "12:30:00Z",
            },
            SecondPractice: {
              date: "2025-06-27",
              time: "16:00:00Z",
            },
            ThirdPractice: {
              date: "2025-06-28",
              time: "11:30:00Z",
            },
            Qualifying: {
              date: "2025-06-28",
              time: "15:00:00Z",
            },
          },
          {
            season: "2025",
            round: "12",
            raceName: "British Grand Prix",
            Circuit: {
              circuitId: "silverstone",
              url: "https://en.wikipedia.org/wiki/Silverstone_Circuit",
              circuitName: "Silverstone Circuit",
              Location: {
                lat: "52.0786",
                long: "-1.01694",
                locality: "Silverstone",
                country: "UK",
              },
            },
            date: "2025-07-06",
            time: "15:00:00Z",
            FirstPractice: {
              date: "2025-07-04",
              time: "12:30:00Z",
            },
            SecondPractice: {
              date: "2025-07-04",
              time: "16:00:00Z",
            },
            ThirdPractice: {
              date: "2025-07-05",
              time: "11:30:00Z",
            },
            Qualifying: {
              date: "2025-07-05",
              time: "15:00:00Z",
            },
          },
          {
            season: "2025",
            round: "13",
            raceName: "Belgian Grand Prix",
            Circuit: {
              circuitId: "spa",
              url: "https://en.wikipedia.org/wiki/Circuit_de_Spa-Francorchamps",
              circuitName: "Circuit de Spa-Francorchamps",
              Location: {
                lat: "50.4372",
                long: "5.97139",
                locality: "Spa",
                country: "Belgium",
              },
            },
            date: "2025-07-27",
            time: "14:00:00Z",
            FirstPractice: {
              date: "2025-07-25",
              time: "11:30:00Z",
            },
            Qualifying: {
              date: "2025-07-26",
              time: "15:00:00Z",
            },
            Sprint: {
              date: "2025-07-26",
              time: "11:00:00Z",
            },
            SprintQualifying: {
              date: "2025-07-25",
              time: "15:30:00Z",
            },
          },
          {
            season: "2025",
            round: "14",
            raceName: "Hungarian Grand Prix",
            Circuit: {
              circuitId: "hungaroring",
              url: "https://en.wikipedia.org/wiki/Hungaroring",
              circuitName: "Hungaroring",
              Location: {
                lat: "47.5789",
                long: "19.2486",
                locality: "Budapest",
                country: "Hungary",
              },
            },
            date: "2025-08-03",
            time: "14:00:00Z",
            FirstPractice: {
              date: "2025-08-01",
              time: "12:30:00Z",
            },
            SecondPractice: {
              date: "2025-08-01",
              time: "16:00:00Z",
            },
            ThirdPractice: {
              date: "2025-08-02",
              time: "11:30:00Z",
            },
            Qualifying: {
              date: "2025-08-02",
              time: "15:00:00Z",
            },
          },
          {
            season: "2025",
            round: "15",
            raceName: "Dutch Grand Prix",
            Circuit: {
              circuitId: "zandvoort",
              url: "https://en.wikipedia.org/wiki/Circuit_Zandvoort",
              circuitName: "Circuit Park Zandvoort",
              Location: {
                lat: "52.3888",
                long: "4.54092",
                locality: "Zandvoort",
                country: "Netherlands",
              },
            },
            date: "2025-08-31",
            time: "14:00:00Z",
            FirstPractice: {
              date: "2025-08-29",
              time: "11:30:00Z",
            },
            SecondPractice: {
              date: "2025-08-29",
              time: "15:00:00Z",
            },
            ThirdPractice: {
              date: "2025-08-30",
              time: "10:30:00Z",
            },
            Qualifying: {
              date: "2025-08-30",
              time: "14:00:00Z",
            },
          },
          {
            season: "2025",
            round: "16",
            raceName: "Italian Grand Prix",
            Circuit: {
              circuitId: "monza",
              url: "https://en.wikipedia.org/wiki/Monza_Circuit",
              circuitName: "Autodromo Nazionale di Monza",
              Location: {
                lat: "45.615599999999986",
                long: "9.28111",
                locality: "Monza",
                country: "Italy",
              },
            },
            date: "2025-09-07",
            time: "14:00:00Z",
            FirstPractice: {
              date: "2025-09-05",
              time: "12:30:00Z",
            },
            SecondPractice: {
              date: "2025-09-05",
              time: "16:00:00Z",
            },
            ThirdPractice: {
              date: "2025-09-06",
              time: "11:30:00Z",
            },
            Qualifying: {
              date: "2025-09-06",
              time: "15:00:00Z",
            },
          },
          {
            season: "2025",
            round: "17",
            raceName: "Azerbaijan Grand Prix",
            Circuit: {
              circuitId: "baku",
              url: "https://en.wikipedia.org/wiki/Baku_City_Circuit",
              circuitName: "Baku City Circuit",
              Location: {
                lat: "40.3725",
                long: "49.8533",
                locality: "Baku",
                country: "Azerbaijan",
              },
            },
            date: "2025-09-21",
            time: "12:00:00Z",
            FirstPractice: {
              date: "2025-09-19",
              time: "09:30:00Z",
            },
            SecondPractice: {
              date: "2025-09-19",
              time: "13:00:00Z",
            },
            ThirdPractice: {
              date: "2025-09-20",
              time: "09:30:00Z",
            },
            Qualifying: {
              date: "2025-09-20",
              time: "13:00:00Z",
            },
          },
          {
            season: "2025",
            round: "18",
            raceName: "Singapore Grand Prix",
            Circuit: {
              circuitId: "marina_bay",
              url: "https://en.wikipedia.org/wiki/Marina_Bay_Street_Circuit",
              circuitName: "Marina Bay Street Circuit",
              Location: {
                lat: "1.2914",
                long: "103.864",
                locality: "Marina Bay",
                country: "Singapore",
              },
            },
            date: "2025-10-05",
            time: "13:00:00Z",
            FirstPractice: {
              date: "2025-10-03",
              time: "10:30:00Z",
            },
            SecondPractice: {
              date: "2025-10-03",
              time: "14:00:00Z",
            },
            ThirdPractice: {
              date: "2025-10-04",
              time: "10:30:00Z",
            },
            Qualifying: {
              date: "2025-10-04",
              time: "14:00:00Z",
            },
          },
          {
            season: "2025",
            round: "19",
            raceName: "United States Grand Prix",
            Circuit: {
              circuitId: "americas",
              url: "https://en.wikipedia.org/wiki/Circuit_of_the_Americas",
              circuitName: "Circuit of the Americas",
              Location: {
                lat: "30.1328",
                long: "-97.6411",
                locality: "Austin",
                country: "USA",
              },
            },
            date: "2025-10-19",
            time: "20:00:00Z",
            FirstPractice: {
              date: "2025-10-17",
              time: "18:30:00Z",
            },
            Qualifying: {
              date: "2025-10-18",
              time: "22:00:00Z",
            },
            Sprint: {
              date: "2025-10-18",
              time: "18:00:00Z",
            },
            SprintQualifying: {
              date: "2025-10-17",
              time: "22:30:00Z",
            },
          },
          {
            season: "2025",
            round: "20",
            raceName: "Mexico City Grand Prix",
            Circuit: {
              circuitId: "rodriguez",
              url: "https://en.wikipedia.org/wiki/Aut%C3%B3dromo_Hermanos_Rodr%C3%ADguez",
              circuitName: "Autódromo Hermanos Rodríguez",
              Location: {
                lat: "19.4042",
                long: "-99.0907",
                locality: "Mexico City",
                country: "Mexico",
              },
            },
            date: "2025-10-26",
            time: "20:00:00Z",
            FirstPractice: {
              date: "2025-10-24",
              time: "19:30:00Z",
            },
            SecondPractice: {
              date: "2025-10-24",
              time: "23:00:00Z",
            },
            ThirdPractice: {
              date: "2025-10-25",
              time: "18:30:00Z",
            },
            Qualifying: {
              date: "2025-10-25",
              time: "22:00:00Z",
            },
          },
          {
            season: "2025",
            round: "21",
            raceName: "São Paulo Grand Prix",
            Circuit: {
              circuitId: "interlagos",
              url: "https://en.wikipedia.org/wiki/Interlagos_Circuit",
              circuitName: "Autódromo José Carlos Pace",
              Location: {
                lat: "-23.7036",
                long: "-46.69969999999999",
                locality: "São Paulo",
                country: "Brazil",
              },
            },
            date: "2025-11-09",
            time: "17:00:00Z",
            FirstPractice: {
              date: "2025-11-07",
              time: "14:30:00Z",
            },
            Qualifying: {
              date: "2025-11-08",
              time: "18:00:00Z",
            },
            Sprint: {
              date: "2025-11-08",
              time: "14:00:00Z",
            },
            SprintQualifying: {
              date: "2025-11-07",
              time: "18:30:00Z",
            },
          },
          {
            season: "2025",
            round: "22",
            raceName: "Las Vegas Grand Prix",
            Circuit: {
              circuitId: "vegas",
              url: "https://en.wikipedia.org/wiki/Las_Vegas_Grand_Prix#Circuit",
              circuitName: "Las Vegas Strip Street Circuit",
              Location: {
                lat: "36.1147",
                long: "-115.173",
                locality: "Las Vegas",
                country: "United States",
              },
            },
            date: "2025-11-22",
            time: "04:00:00Z",
            FirstPractice: {
              date: "2025-11-21",
              time: "00:30:00Z",
            },
            SecondPractice: {
              date: "2025-11-21",
              time: "04:00:00Z",
            },
            ThirdPractice: {
              date: "2025-11-22",
              time: "00:30:00Z",
            },
            Qualifying: {
              date: "2025-11-22",
              time: "04:00:00Z",
            },
          },
          {
            season: "2025",
            round: "23",
            raceName: "Qatar Grand Prix",
            Circuit: {
              circuitId: "losail",
              url: "https://en.wikipedia.org/wiki/Lusail_International_Circuit",
              circuitName: "Losail International Circuit",
              Location: {
                lat: "25.48999999999998",
                long: "51.4542",
                locality: "Al Daayen",
                country: "Qatar",
              },
            },
            date: "2025-11-30",
            time: "16:00:00Z",
            FirstPractice: {
              date: "2025-11-28",
              time: "13:30:00Z",
            },
            Qualifying: {
              date: "2025-11-29",
              time: "18:00:00Z",
            },
            Sprint: {
              date: "2025-11-29",
              time: "14:00:00Z",
            },
            SprintQualifying: {
              date: "2025-11-28",
              time: "17:30:00Z",
            },
          },
          {
            season: "2025",
            round: "24",
            raceName: "Abu Dhabi Grand Prix",
            Circuit: {
              circuitId: "yas_marina",
              url: "https://en.wikipedia.org/wiki/Yas_Marina_Circuit",
              circuitName: "Yas Marina Circuit",
              Location: {
                lat: "24.4672",
                long: "54.6031",
                locality: "Abu Dhabi",
                country: "UAE",
              },
            },
            date: "2025-12-07",
            time: "13:00:00Z",
            FirstPractice: {
              date: "2025-12-05",
              time: "09:30:00Z",
            },
            SecondPractice: {
              date: "2025-12-05",
              time: "13:00:00Z",
            },
            ThirdPractice: {
              date: "2025-12-06",
              time: "10:30:00Z",
            },
            Qualifying: {
              date: "2025-12-06",
              time: "14:00:00Z",
            },
          },
        ],
      },
    },
  };
}
