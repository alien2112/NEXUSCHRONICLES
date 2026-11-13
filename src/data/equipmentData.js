export const worldsEquipmentData = {
  moon: {
    id: 'moon',
    name: 'The Moon',
    badge: 'Earth\'s Natural Satellite',
    distance: '384,400 km from Earth',
    gravity: '1.62 m/s² (0.166 g)',
    atmosphere: 'Extremely thin exosphere',
    image: '/moon.png',
    countText: '3+ equipment',
    accentColor: '#38bdf8', // sky-400
    description: 'Humanity\'s primary stepping stone into the cosmos. NASA\'s Apollo missions left behind landing stages, rovers, and scientific packages that continue yielding discoveries.',
    equipment: [
      {
        id: 'apollo11-descent',
        name: 'Apollo 11 Lunar Module Descent Stage ("Eagle")',
        category: 'Lunar Lander Descent Stage',
        mission: 'Apollo 11',
        landingDate: 'July 20, 1969',
        site: 'Mare Tranquillitatis (Sea of Tranquility)',
        coordinates: '0.67408° N, 23.47297° E',
        status: 'Preserved in-situ',
        icon: 'Rocket',
        summary: 'The lower half and landing gear of the Eagle Lunar Module, used by Neil Armstrong and Buzz Aldrin. Serves as the landing base and holds the commemorative stainless-steel plaque.',
        keyFacts: [
          'First crewed spacecraft landing base on another celestial body',
          'Carries the commemorative plaque: "Here men from the planet Earth first set foot upon the Moon. We came in peace for all mankind."',
          'Equipped with Apollo Lunar Surface Experiments Package (ALSEP) sub-assemblies',
        ]
      },
      {
        id: 'laser-retroreflector',
        name: 'Lunar Laser Ranging Retroreflector (LRRR)',
        category: 'Optical Scientific Sensor',
        mission: 'Apollo 11, 14, 15',
        landingDate: 'July 1969 – July 1971',
        site: 'Tranquility Base & Fra Mauro & Hadley Rille',
        coordinates: 'Multiple Apollo Sites',
        status: 'Actively Operational (50+ years)',
        icon: 'Radio',
        summary: 'Precision corner-cube prism arrays that bounce Earth-fired laser pulses back to terrestrial telescopes with picosecond time-of-flight resolution.',
        keyFacts: [
          'The only Apollo experiment that continues to collect scientific telemetry today',
          'Measures the Earth-Moon distance down to a few millimeters',
          'Proven that the Moon is slowly spiraling away from Earth at 3.8 cm per year',
        ]
      },
      {
        id: 'lunar-rover-buggy',
        name: 'Lunar Roving Vehicle (LRV - "Moon Buggy")',
        category: 'Crewed Surface Exploration Vehicle',
        mission: 'Apollo 15, 16, 17',
        landingDate: 'July 31, 1971',
        site: 'Hadley-Apennine (26.1322° N, 3.6339° E)',
        coordinates: 'Hadley Plain, Taurus-Littrow, Descartes Highlands',
        status: 'Parked in-situ',
        icon: 'Car',
        summary: 'Electric four-wheel rover engineered by Boeing and Delco. Allowed astronauts to venture up to 35 kilometers away from the lunar module, carrying geologic drill cores and rock samples.',
        keyFacts: [
          'Capable of 13 km/h speed across jagged regolith slopes',
          'Left permanently parked with high-gain directional antenna aimed at Earth',
          'Apollo 17 rover drove a total record distance of 35.9 km across lunar valleys',
        ]
      },
      {
        id: 'passive-seismic',
        name: 'Passive Seismic Experiment Package (PSEP)',
        category: 'Geophysical Seismometer Array',
        mission: 'Apollo 12, 14, 15, 16',
        landingDate: 'November 1969 – April 1972',
        site: 'Ocean of Storms & Fra Mauro',
        coordinates: 'Multiple Equatorial Lunar Basins',
        status: 'Mission Completed (1969–1977)',
        icon: 'Activity',
        summary: 'High-sensitivity long-period seismometers powered by radioisotope thermoelectric generators (RTGs) to map the Moon\'s deep crustal stratification and core.',
        keyFacts: [
          'Detected over 12,000 seismic events, including deep tidal moonquakes and meteor impacts',
          'Revealed that the Moon has a crust ~60 km thick and a small metallic core',
        ]
      }
    ]
  },
  mars: {
    id: 'mars',
    name: 'The Mars',
    badge: 'The Red Planet',
    distance: '225,000,000 km avg from Earth',
    gravity: '3.72 m/s² (0.379 g)',
    atmosphere: '95% Carbon Dioxide (CO₂)',
    image: '/mars.png',
    countText: '4+ equipment',
    accentColor: '#f97316', // orange-500
    description: 'A rust-colored desert world shaped by ancient rivers, towering volcanoes, and violent dust storms. NASA robotic scouts have traversed hundreds of kilometers across Martian sands.',
    equipment: [
      {
        id: 'perseverance-rover',
        name: 'Perseverance Mars Rover',
        category: 'Nuclear-Powered Heavy Surface Rover',
        mission: 'Mars 2020',
        landingDate: 'February 18, 2021',
        site: 'Jezero Crater (Octavia E. Butler Landing)',
        coordinates: '18.4447° N, 77.4508° E',
        status: 'Active & Traversing',
        icon: 'Compass',
        summary: 'NASA’s most sophisticated planetary explorer, seeking biosignatures of ancient microbial life in a dried river delta lakebed and caching core samples for future retrieval to Earth.',
        keyFacts: [
          'Carries MOXIE: First technology demonstration converting Martian CO₂ into breathable oxygen',
          'Equipped with 23 advanced cameras, SuperCam Raman laser, and PIXL x-ray fluorescence',
          'Cached over 25 pristine hermetic geological core samples for Mars Sample Return',
        ]
      },
      {
        id: 'ingenuity-helicopter',
        name: 'Ingenuity Mars Helicopter ("Ginny")',
        category: 'Autonomous Aerial Rotorcraft',
        mission: 'Mars 2020 / Ingenuity Tech Demo',
        landingDate: 'February 18, 2021',
        site: 'Airfield Valinor / Jezero Crater Delta',
        coordinates: '18.45° N, 77.44° E',
        status: 'Mission Complete (72 Historic Flights)',
        icon: 'Plane',
        summary: 'The historic first rotorcraft in human civilization to achieve controlled, powered flight on another planet, overcoming Mars’s ultra-thin atmosphere (less than 1% of Earth’s density).',
        keyFacts: [
          'Designed for 5 test flights; completed 72 flights spanning 17 kilometers',
          'Dual counter-rotating carbon-fiber blades spinning at 2,400+ RPM',
          'Served as an aerial scout finding traversable pathways for the Perseverance rover',
        ]
      },
      {
        id: 'curiosity-rover',
        name: 'Curiosity Rover (Mars Science Laboratory)',
        category: 'Nuclear-Powered Analytical Laboratory',
        mission: 'MSL / Curiosity',
        landingDate: 'August 6, 2012',
        site: 'Mount Sharp / Gale Crater',
        coordinates: '4.5895° S, 137.4417° E',
        status: 'Active & Climbing (4,000+ Sols)',
        icon: 'Crosshair',
        summary: 'The 1-ton rover that determined ancient Mars had freshwater lakes, neutral pH, and all chemical ingredients required to sustain microbial life billions of years ago.',
        keyFacts: [
          'Climbing Mount Sharp (Aeolis Mons), inspecting millions of years of layered Martian strata',
          'Onboard Sample Analysis at Mars (SAM) laboratory detects organic carbon molecules',
          'Has driven over 31 kilometers and beamed back hundreds of thousands of raw images',
        ]
      },
      {
        id: 'insight-lander',
        name: 'InSight Lander',
        category: 'Geophysical Interior Observatory',
        mission: 'InSight',
        landingDate: 'November 26, 2018',
        site: 'Elysium Planitia',
        coordinates: '4.502° N, 135.623° E',
        status: 'Mission Concluded (December 2022)',
        icon: 'Radio',
        summary: 'NASA\'s planetary crust observatory that listened to the heartbeat of Mars, placing the ultra-sensitive SEIS seismometer under a vacuum wind-shield dome.',
        keyFacts: [
          'Recorded over 1,319 marsquakes, revealing an active, tremor-filled interior',
          'Measured Mars\'s liquid iron-nickel core with a radius of approximately 1,830 kilometers',
        ]
      },
      {
        id: 'viking-landers',
        name: 'Viking 1 & 2 Descent Landers',
        category: 'Historic Pioneer Planetary Landers',
        mission: 'Viking Program',
        landingDate: 'July 20, 1976 (V1) & Sept 3, 1976 (V2)',
        site: 'Chryse Planitia & Utopia Planitia',
        coordinates: '22.697° N, 48.222° W (V1)',
        status: 'Historic Monument in-situ',
        icon: 'Award',
        summary: 'Humanity\'s first successful long-duration surface stations on Mars, transmitting the first high-resolution color surface panoramas and atmospheric weather reports.',
        keyFacts: [
          'Operated for over 6 years on the Martian surface (Viking 1 ceased 1982)',
          'Performed biological pyrolytic release and gas exchange soil experiments',
        ]
      }
    ]
  }
};
