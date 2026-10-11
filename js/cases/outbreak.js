/*
 * Case Data: Virus Outbreak (MRV - Meridian Respiratory Virus)
 * Infodemic & Policy Education Game
 */
(function () {
  'use strict';

  window.SN_CASES = window.SN_CASES || {};

  window.SN_CASES.outbreak = {
    id: 'outbreak',
    title: 'Outbreak: Meridian Virus',
    subtitle: 'Track rumors, verified health statements, and media distortion during an emerging respiratory epidemic.',
    estimate: '7–10 minutes',
    number: 1,

    /* ACCOUNTS INVOLVED IN THIS CASE */
    accounts: {
      herald: {
        name: 'Halden Herald', handle: '@HaldenHerald', badge: 'org',
        bio: 'Port Halden daily news. Local reporting, breaking news and verified civic updates.',
        joined: 'March 2009', followers: '412K', following: '1,204', posts: '88.1K',
        role: 'reliable', reveal: 'Verified local news agency.'
      },
      hphs: {
        name: 'Halden Public Health', handle: '@HPHS_official', badge: 'org',
        bio: 'Official public health service for the Port Halden metropolitan region.',
        joined: 'June 2012', followers: '96.4K', following: '310', posts: '6,532',
        role: 'reliable', reveal: 'Official public health authority.'
      },
      truthseeker: {
        name: 'TruthSeeker88', handle: '@truthseeker_88213', badge: null,
        bio: 'Exposing what THEY do not want you to know. Question everything.',
        joinedDaysBeforeStart: 0, postsPerDay: 70, followers: '1,208', following: '3,950',
        role: 'disinfo', reveal: 'Disinformation account created on Day 1 of the outbreak.'
      },
      hphsFake: {
        name: 'Halden Public Health', handle: '@HPHS_offical', badge: 'paid',
        bio: 'Official public health alerts for Port Halden.',
        joinedDaysBeforeStart: 21, postsPerDay: 110, followers: '52', following: '4,870',
        role: 'disinfo', reveal: 'Impostor account using a misspelled handle (@HPHS_offical) and a paid checkmark.'
      },
      voss: {
        name: 'Dr. Marta Voss', handle: '@MartaVoss_epi', badge: null,
        bio: 'Epidemiologist at Halden University. Respiratory pathogen dynamics & public health.',
        joined: 'January 2015', followers: '18.3K', following: '742', posts: '4,105',
        role: 'reliable', reveal: 'Independent academic expert in epidemiology.'
      },
      patel: {
        name: 'Dr. Kiran Patel', handle: '@KPatel_ICU', badge: null,
        bio: 'ICU Senior Physician, Port Halden General Hospital. Critical care medicine.',
        joined: 'July 2018', followers: '12.4K', following: '512', posts: '2,870',
        role: 'reliable', reveal: 'Frontline hospital ICU doctor.'
      },
      mike: {
        name: 'Mike Peterson', handle: '@mikep_halden', badge: null,
        bio: 'Port Halden resident. Local sports fan, coffee enthusiast.',
        joined: 'August 2016', followers: '341', following: '512', posts: '1,644',
        role: 'ordinary', reveal: 'Ordinary citizen reacting to news.'
      },
      tom: {
        name: 'Tom Miller', handle: '@tom_m_halden', badge: null,
        bio: 'Local resident & parent. Just trying to keep my family safe.',
        joined: 'February 2014', followers: '215', following: '402', posts: '1,890',
        role: 'ordinary', reveal: 'Ordinary citizen asking questions.'
      },
      realnews: {
        name: 'Real News Now', handle: '@RealNewsNow_HQ', badge: 'paid',
        bio: 'UNFILTERED TRUTH. What mainstream media hides from you.',
        joinedDaysBeforeStart: 55, postsPerDay: 300, followers: '15.2K', following: '12',
        role: 'disinfo', reveal: 'Fake news outlet that deliberately pushed false stories.'
      },
      hannah: {
        name: 'Hannah Wellness', handle: '@hannah_holistic', badge: 'paid',
        bio: 'Holistic health advocate. Natural immunity. Essential oils & wellness coaching.',
        joined: 'April 2019', followers: '89.4K', following: '1,020', posts: '11.7K',
        role: 'misinfo', reveal: 'Wellness influencer promoting unverified remedies for financial gain.'
      },
      kellan: {
        name: 'Dr. Aris Kellan', handle: '@DrArisKellan', badge: 'paid',
        bio: 'Dr. Aris Kellan PhD. Author & speaker. Truth in science.',
        joined: 'May 2021', followers: '3,880', following: '245', posts: '5,612',
        role: 'misinfo', reveal: 'PhD in mechanical engineering presenting himself as a medical authority.'
      },
      lena: {
        name: 'Lena Berg', handle: '@PharmacistLena', badge: null,
        bio: 'Community Pharmacist at Halden Central. Public health educator.',
        joined: 'July 2018', followers: '127', following: '203', posts: '689',
        role: 'reliable', reveal: 'Local pharmacist giving evidence-based medical guidance.'
      }
    },

    /* STORY PHASES & FEED ITEMS (3 CONCISE PHASES, 9 DECISIONS) */
    phases: [
      /* ------------------------------------------------------------------ PHASE 1 */
      {
        id: 'phase1', label: 'Phase 1: Mysterious Outbreak',
        news: {
          headline: 'Hospital treating 14 patients with pneumonia of unknown cause',
          body: [
            'Port Halden General Hospital admits 14 patients with severe pneumonia over the past week.',
            'The public health service (HPHS) sent samples to the national reference lab. Cause unknown.'
          ],
          source: 'Halden Herald'
        },
        feed: [
          /* Head Post 1 */
          {
            kind: 'post', id: 'd1p1', author: 'herald', time: '1h',
            text: `Port Halden General Hospital confirms 14 patients treated for pneumonia of unknown cause. HPHS has sent samples to the national reference lab; results expected within days.`,
            stats: { replies: '214', reposts: '1.1K', likes: '2.3K' }
          },
          {
            kind: 'post', id: 'd1p1_2', author: 'mike', replyTo: 'd1p1', time: '55m',
            text: `Is this just standard seasonal flu or something we should be worried about?`,
            stats: { replies: '12', reposts: '5', likes: '38' }
          },
          {
            kind: 'post', id: 'd1p1_3', author: 'voss', replyTo: 'd1p1', time: '50m',
            text: `Clusters of pneumonia happen every year, and most turn out to be known pathogens. Let's wait for lab results before drawing conclusions.`,
            stats: { replies: '41', reposts: '380', likes: '1.9K' }
          },
          {
            kind: 'post', id: 'd1p1_4', author: 'tom', replyTo: 'd1p1', time: '45m',
            text: `Appreciate the calm response Dr. Voss. Hope lab results come back soon.`,
            stats: { replies: '3', reposts: '1', likes: '29' }
          },

          /* Head Post 2 */
          {
            kind: 'post', id: 'd1p2', author: 'truthseeker', time: '47m',
            text: `14?? LOL. My cousin's friend works there and says it's 300+ already and people are dying in corridors! They will NEVER tell you the truth. Repost!!`,
            stats: { replies: '388', reposts: '4.6K', likes: '6.1K' }
          },
          {
            kind: 'post', id: 'd1p1_5', author: 'tom', replyTo: 'd1p2', time: '40m',
            text: `Wait 300 dying?? Is the hospital really overflowing?`,
            stats: { replies: '18', reposts: '32', likes: '94' }
          },
          {
            kind: 'post', id: 'd1p1_6b', author: 'mike', replyTo: 'd1p2', time: '35m',
            text: `Any actual proof or photo from inside the hospital? Sounds like pure rumor.`,
            stats: { replies: '14', reposts: '2', likes: '67' }
          },

          /* Head Post 3 */
          {
            kind: 'post', id: 'd1p1_8', author: 'hphs', time: '20m',
            text: `Official statement: 14 patients admitted under isolation. Diagnostic lab analysis underway. No emergency lockdowns or special equipment needed.`,
            stats: { replies: '150', reposts: '1.8K', likes: '4.2K' }
          },
          {
            kind: 'post', id: 'd1p1_7', author: 'lena', replyTo: 'd1p1_8', time: '30m',
            text: `Pharmacies getting flooded with oxygen tank requests. Please don't panic! Basic hand hygiene and staying home if symptomatic is what HPHS recommends.`,
            stats: { replies: '29', reposts: '512', likes: '1.4K' }
          },
          {
            kind: 'post', id: 'd1p1_7b', author: 'mike', replyTo: 'd1p1_8', time: '18m',
            text: `Glad to hear official isolation protocols are active. Will follow HPHS guidance.`,
            stats: { replies: '3', reposts: '4', likes: '45' }
          },

          {
            kind: 'question', id: 'q1', post: null, answer: 'true',
            claim: 'Port Halden General Hospital has confirmed 14 admitted patients, and official guidance recommends basic hygiene over panic buying.',
            explanation: `Reading the feed comments, verified news (@HaldenHerald), experts (@MartaVoss_epi), and public health (@HPHS_official) consistently confirm 14 cases and recommend calm hygiene practices over panic buying.`,
            tags: [],
            signals: ['Consistent claims from named, checkable sources across the comment stream']
          },
          {
            kind: 'question', id: 'q2', post: null, answer: 'false',
            claim: 'Over 300 patients are currently dying in hospital corridors according to emergency department staff.',
            explanation: `The claim originated from an unverified 3-week-old bot account (@truthseeker_88213) sharing second-hand rumors. Verified hospital accounts and health agencies confirm 14 admitted patients under routine care.`,
            tags: ['anecdotal', 'conspiracy', 'urgency'],
            signals: ['Second-hand unsourced claims from new accounts with bot indicators']
          },

          /* Head Post 4 */
          {
            kind: 'post', id: 'd1p2_4', author: 'voss', time: '10m',
            text: `Pathology reports show viral/bacterial indicators, not chemical toxicity. Chemical spill claims circulating online are entirely unsourced.`,
            stats: { replies: '35', reposts: '620', likes: '2.1K' }
          },
          {
            kind: 'post', id: 'd1p2_5', author: 'mike', replyTo: 'd1p2_4', time: '8m',
            text: `Glad Dr. Voss clarified, was getting worried about chemical plant fumes!`,
            stats: { replies: '3', reposts: '12', likes: '54' }
          },
          {
            kind: 'post', id: 'd1p2_6', author: 'herald', replyTo: 'd1p2_4', time: '5m',
            text: `Halden Environmental Protection Agency confirms zero chemical plant leaks detected in the region.`,
            stats: { replies: '80', reposts: '950', likes: '2.8K' }
          },

          {
            kind: 'question', id: 'q_gen1', post: null, answer: 'false',
            claim: 'The outbreak in Port Halden was caused by a toxic chemical plant leak.',
            explanation: `Environmental agencies and epidemiologist Dr. Voss confirmed zero chemical leaks and noted that lab pathology shows biological viral/bacterial indicators rather than chemical toxicity.`,
            tags: ['false-cause', 'conspiracy'],
            signals: ['Environmental agency verification and lab pathology evidence']
          }
        ]
      },

      /* ------------------------------------------------------------------ PHASE 2 */
      {
        id: 'phase2', label: 'Phase 2: Lab Identification & Impostors',
        news: {
          headline: 'Lab identifies new virus behind pneumonia cluster',
          body: [
            'The national lab identified a new respiratory virus: Meridian respiratory virus (MRV).',
            'HPHS reports 41 confirmed cases and 2 deaths among elderly patients with underlying conditions.'
          ],
          source: 'Halden Herald'
        },
        feed: [
          /* Head Post 1 */
          {
            kind: 'post', id: 'd4p1', author: 'hphs', time: '2h',
            text: `UPDATE: Lab tests confirm a new respiratory virus (MRV) as the cause of the pneumonia cluster. 41 confirmed cases. Spreads between close contacts. Wash hands & call GP if coughing.`,
            stats: { replies: '502', reposts: '6.8K', likes: '9.1K' }
          },
          {
            kind: 'post', id: 'd4p2', author: 'patel', replyTo: 'd4p1', time: '1h 50m',
            text: `Treating these patients at Port Halden General. Most improving. Those seriously ill are mainly older people or people with heart/lung conditions. Please don't rush ED with mild symptoms.`,
            stats: { replies: '88', reposts: '2.4K', likes: '7.7K' }
          },
          {
            kind: 'post', id: 'd4p2_2', author: 'tom', replyTo: 'd4p1', time: '1h 30m',
            text: `Thank you Dr. Patel for the clear update. Good to know most patients are improving.`,
            stats: { replies: '4', reposts: '12', likes: '85' }
          },

          /* Head Post 2 */
          {
            kind: 'post', id: 'd4p3', author: 'hphsFake', time: '1h 10m',
            text: `⚠️ URGENT: All residents must stay indoors for 72 hours starting TONIGHT. Army will patrol streets. Stock up on food NOW. Share with everyone! ⚠️`,
            stats: { replies: '1.9K', reposts: '14.2K', likes: '11.3K' }
          },
          {
            kind: 'post', id: 'd4p3_2', author: 'mike', replyTo: 'd4p3', time: '1h',
            text: `Wait, is this real?? Army patrolling the streets starting tonight??`,
            stats: { replies: '45', reposts: '120', likes: '310' }
          },
          {
            kind: 'post', id: 'd4p3_2b', author: 'tom', replyTo: 'd4p3', time: '55m',
            text: `Look closely at the handle (@HPHS_offical)! It's misspelled!`,
            stats: { replies: '12', reposts: '30', likes: '140' }
          },
          {
            kind: 'post', id: 'd4p3_2c', author: 'lena', replyTo: 'd4p3', time: '52m',
            text: `Fake account alert! Do not panic buy food based on this account.`,
            stats: { replies: '15', reposts: '180', likes: '620' }
          },

          /* Head Post 3 */
          {
            kind: 'post', id: 'd4p3_3', author: 'herald', time: '50m',
            text: `ALERT: Fake account @HPHS_offical (misspelled) spreading false curfew rumors. HPHS confirms NO army curfew has been ordered.`,
            stats: { replies: '310', reposts: '4.2K', likes: '8.9K' }
          },
          {
            kind: 'post', id: 'd4p3_4', author: 'voss', replyTo: 'd4p3_3', time: '45m',
            text: `Always check exact handle spelling. Official health agency is @HPHS_official (registered 2012). Fake account has a paid checkmark bought 3 days ago.`,
            stats: { replies: '85', reposts: '1.9K', likes: '5.4K' }
          },

          {
            kind: 'question', id: 'q3', post: null, answer: 'true',
            claim: 'Most MRV patients are improving; severe illness mainly affects older individuals or those with underlying health conditions.',
            explanation: `ICU physician Dr. Patel (@KPatel_ICU) and official health updates confirm most patients are recovering well, with severe illness concentrated among elderly patients or those with existing heart/lung conditions.`,
            tags: [],
            signals: ['First-hand medical professional update consistent with public health reports']
          },
          {
            kind: 'question', id: 'q4', post: 'd4p3', answer: 'false',
            claim: 'All residents must stay indoors for 72 hours from tonight, with the army patrolling the streets.',
            explanation: `The account @HPHS_offical is an impostor (misspelled handle registered 3 days ago with a paid checkmark). Official agency @HPHS_official and news outlets confirmed no curfew or army patrol exists.`,
            tags: ['impersonation', 'appeal-fear', 'urgency'],
            signals: ['Misspelled handle, new registration date, paid checkmark vs official org badge']
          },

          /* Head Post 4 */
          {
            kind: 'post', id: 'd4p4', author: 'voss', time: '28m',
            text: `Interesting early signal: in a few of the 41 MRV cases, it looks like virus may have been passed on before symptoms appeared. Tiny sample, not yet peer-reviewed.`,
            stats: { replies: '120', reposts: '1.6K', likes: '4.2K' }
          },
          {
            kind: 'post', id: 'd4p4_3', author: 'lena', replyTo: 'd4p4', time: '22m',
            text: `Dr. Voss explicitly noted 'small sample, not peer-reviewed'. We must wait for formal studies before declaring it absolute fact.`,
            stats: { replies: '22', reposts: '340', likes: '1.2K' }
          },

          {
            kind: 'question', id: 'q5', post: null, answer: 'unsure',
            claim: 'MRV is definitively proven to spread before symptoms appear in all infected individuals.',
            explanation: `Dr. Voss noted early preliminary signals of pre-symptomatic transmission, but emphasized that data is based on a tiny sample and not yet peer-reviewed. "Unsure" is the accurate evaluation until larger studies confirm it.`,
            tags: [],
            signals: ['Distinguishing preliminary signals from established peer-reviewed facts']
          }
        ]
      },

      /* ------------------------------------------------------------------ PHASE 3 */
      {
        id: 'phase3', label: 'Phase 3: Outbreak Response & Vaccine Approval',
        news: {
          headline: 'Regulator approves MRV vaccine; health services manage outbreak peak',
          body: [
            'HPHS reports regional health services managing outbreak peak with clear guidance.',
            'Medicines regulator approves first MRV vaccine after 30,000-volunteer clinical trial showing 85% efficacy against severe illness.'
          ],
          source: 'Halden Herald'
        },
        feed: [
          /* Head Post 1 */
          {
            kind: 'post', id: 'd9p1', author: 'hannah', time: '3h',
            text: `My neighbour caught MRV, drank hot garlic water & lemon and was cured in 3 days! 🧄🍋 Doctors won't tell you! Buy my natural remedy kit ⬇️`,
            stats: { replies: '640', reposts: '8.9K', likes: '22.4K' }
          },
          {
            kind: 'post', id: 'd9p1_2', author: 'patel', replyTo: 'd9p1', time: '2h 40m',
            text: `Most MRV patients recover naturally within a week. Getting better after garlic water doesn't mean garlic cured it. Garlic has no antiviral effect on MRV.`,
            stats: { replies: '75', reposts: '1.3K', likes: '5.2K' }
          },
          {
            kind: 'post', id: 'd9p1_3', author: 'lena', replyTo: 'd9p1', time: '2h 30m',
            text: `Garlic is great for cooking, but offers zero protection or cure against viral respiratory infections. Don't waste money on unproven remedies.`,
            stats: { replies: '34', reposts: '420', likes: '1.8K' }
          },

          /* Head Post 2 */
          {
            kind: 'post', id: 'd9p4', author: 'kellan', time: '45m',
            text: `As a doctor, let me be clear: masks do NOTHING. A virus particle is 100x smaller than gaps in a mask. Basic physics. Wake up! 😷❌`,
            stats: { replies: '2.1K', reposts: '12.7K', likes: '27.9K' }
          },
          {
            kind: 'post', id: 'd9p4_2', author: 'voss', replyTo: 'd9p4', time: '35m',
            text: `Correction: Dr. Kellan holds a PhD in mechanical engineering, not medicine. Viruses travel inside respiratory droplets which masks block effectively.`,
            stats: { replies: '140', reposts: '2.8K', likes: '8.4K' }
          },
          {
            kind: 'post', id: 'd9p4_3', author: 'lena', replyTo: 'd9p4', time: '30m',
            text: `Quality masks significantly reduce outward droplet emission and inward inhalation in crowded indoor settings.`,
            stats: { replies: '45', reposts: '890', likes: '3.1K' }
          },

          {
            kind: 'question', id: 'q7', post: null, answer: 'false',
            claim: 'Drinking hot garlic water and lemon is a scientifically proven cure for MRV.',
            explanation: `The claim relies on single anecdotal stories. Physician Dr. Patel and pharmacist Lena confirmed that most MRV patients recover naturally and garlic has zero antiviral effect against MRV. Influencer Hannah has a financial conflict of interest selling remedy kits.`,
            tags: ['anecdotal', 'false-cause', 'conflict-interest'],
            signals: ['Anecdotal claims vs professional medical explanations and sales motives']
          },
          {
            kind: 'question', id: 'q9', post: 'd9p4', answer: 'false',
            claim: 'Masks do nothing against MRV, because virus particles are smaller than the gaps in a mask.',
            explanation: `Dr. Kellan is an engineer (appeal to false authority), not a medical doctor. Viruses travel inside respiratory droplets that masks block effectively. Absolute claims like "do NOTHING" oversimplify aerosol physics.`,
            tags: ['fake-expert', 'oversimplification'],
            signals: ['False authority credentials and oversimplified physics claims']
          },

          /* Head Post 3 */
          {
            kind: 'post', id: 'm10p1', author: 'realnews', time: '5h',
            text: `🚨 Buried on page 47: 84 people in vaccine trial had SERIOUS medical events! Approved anyway? Don't be a guinea pig! 💉☠️`,
            stats: { replies: '2.7K', reposts: '18.9K', likes: '25.6K' }
          },
          {
            kind: 'post', id: 'm10p4', author: 'voss', replyTo: 'm10p1', time: '4h',
            text: `Context: 84 serious events occurred among 15,000 vaccinated vs 81 among 15,000 placebo group (dummy injections). Serious background events occur in any 30,000 group over months.`,
            stats: { replies: '140', reposts: '3.8K', likes: '9.2K' }
          },
          {
            kind: 'post', id: 'm10p5', author: 'hphs', replyTo: 'm10p1', time: '2h',
            text: `MRV vaccination starts Monday for over-65s and healthcare workers. Common side effects are mild (sore arm, tiredness). Full trial data public: halden.gov/mrv-vaccine`,
            stats: { replies: '610', reposts: '5.1K', likes: '12.4K' }
          },

          {
            kind: 'question', id: 'q15', post: null, answer: 'false',
            claim: '84 serious medical events in the vaccine trial show the vaccine is dangerous.',
            explanation: `Dr. Voss explained that the trial compared 15,000 vaccinated against 15,000 placebo control subjects (who had 81 events). Showing one number without the placebo baseline is cherry-picking.`,
            tags: ['missing-context', 'cherry-picking', 'appeal-fear'],
            signals: ['Comparing trial data against control/placebo baselines']
          }
        ]
      }
    ]
  };
})();
