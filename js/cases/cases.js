/*
 * Cases Registry & Multi-Track / Multi-Difficulty Case Generator
 * Infodemic & Policy Education Game
 */
(function () {
  'use strict';

  window.SN_CASES = window.SN_CASES || {};

  // Standard shared accounts used across simulation scenarios
  const sharedAccounts = {
    official_news: {
      name: 'Halden Herald', handle: '@HaldenHerald', badge: 'org',
      bio: 'Port Halden daily news. Local reporting and verified updates.',
      joined: 'March 2009', followers: '412K', following: '1,204', posts: '88.1K',
      role: 'reliable', reveal: 'Verified local news agency.'
    },
    authority_gov: {
      name: 'Civic Authority Alert', handle: '@CivicAlert_official', badge: 'org',
      bio: 'Official public announcement channel.',
      joined: 'June 2012', followers: '96.4K', following: '310', posts: '6,532',
      role: 'reliable', reveal: 'Official civic authority.'
    },
    fake_impostor: {
      name: 'Civic Authority Alert', handle: '@CivicAlert_offical', badge: 'paid',
      bio: 'Official emergency announcements.',
      joinedDaysBeforeStart: 12, postsPerDay: 90, followers: '45', following: '3,810',
      role: 'disinfo', reveal: 'Impostor account using a misspelled handle (@CivicAlert_offical) and a paid checkmark.'
    },
    expert_dr: {
      name: 'Dr. Elena Rostova', handle: '@DRostova_research', badge: null,
      bio: 'Senior Policy Analyst & Academic Researcher.',
      joined: 'January 2015', followers: '24.3K', following: '742', posts: '4,105',
      role: 'reliable', reveal: 'Independent subject-matter academic expert.'
    },
    citizen_mike: {
      name: 'Mike Peterson', handle: '@mikep_halden', badge: null,
      bio: 'Port Halden resident. Local sports fan & community observer.',
      joined: 'August 2016', followers: '341', following: '512', posts: '1,644',
      role: 'ordinary', reveal: 'Ordinary citizen reacting to news.'
    },
    citizen_tom: {
      name: 'Tom Miller', handle: '@tom_m_halden', badge: null,
      bio: 'Local resident & parent. Seeking clear facts.',
      joined: 'February 2014', followers: '215', following: '402', posts: '1,890',
      role: 'ordinary', reveal: 'Ordinary citizen asking questions.'
    },
    scammer_click: {
      name: 'Viral News Now', handle: '@ViralNews_HQ', badge: 'paid',
      bio: 'UNFILTERED BREAKING NEWS! What they won\'t show you!',
      joinedDaysBeforeStart: 45, postsPerDay: 280, followers: '18.2K', following: '12',
      role: 'disinfo', reveal: 'Sensationalist account pushing unverified claims.'
    }
  };

  // ------------------------------------------------------------------ TRACK & DIFFICULTY CASES GENERATOR
  const tracks = [
    { id: 'highschool', title: 'High School', label: 'High School Track' },
    { id: 'youngadults', title: 'Young Adults', label: 'Young Adults Track' },
    { id: 'health', title: 'Health', label: 'Health Track' },
    { id: 'defense', title: 'Defense', label: 'Defense Track' },
    { id: 'seniors', title: 'Seniors', label: 'Seniors Track' }
  ];

  const difficulties = [
    { id: 'easy', label: 'Easy', dotCls: 'dot-easy', dotEmoji: '🟢', desc: 'Direct claims, clear official signals, and obvious red flags.' },
    { id: 'medium', label: 'Medium', dotCls: 'dot-medium', dotEmoji: '🟡', desc: 'Balanced scenario with realistic impostor accounts and subtle context cues.' },
    { id: 'hard', label: 'Hard', dotCls: 'dot-hard', dotEmoji: '🔴', desc: 'Sophisticated manipulation, statistical denominator tricks, and complex evidence.' }
  ];

  tracks.forEach(track => {
    difficulties.forEach(diff => {
      const caseId = `${track.id}_${diff.id}`;
      
      // Customize case title & storyline per track and difficulty
      let caseTitle = `${track.title}: Case File (${diff.label})`;
      let teaser = `Investigate social media claims and evaluate credibility for ${track.title.toLowerCase()} scenario at ${diff.label} level.`;
      
      if (track.id === 'health' && diff.id === 'medium') {
        caseTitle = 'Outbreak: Meridian Virus';
        teaser = 'Track rumors, verified health statements, and media distortion during an emerging respiratory epidemic.';
      } else if (track.id === 'highschool') {
        caseTitle = diff.id === 'easy' ? 'High School: Exam Closure Hoax' : diff.id === 'medium' ? 'High School: AI Audio Scandal' : 'High School: Election Botnet';
      } else if (track.id === 'youngadults') {
        caseTitle = diff.id === 'easy' ? 'Young Adults: Crypto Phishing Scam' : diff.id === 'medium' ? 'Young Adults: Rent Control Ordinance' : 'Young Adults: Finfluencer Fraud';
      } else if (track.id === 'defense') {
        caseTitle = diff.id === 'easy' ? 'Defense: Highway Convoy Rumor' : diff.id === 'medium' ? 'Defense: Port Navigation Jamming' : 'Defense: Hybrid Media Campaign';
      } else if (track.id === 'seniors') {
        caseTitle = diff.id === 'easy' ? 'Seniors: Pension SMS Relief Scam' : diff.id === 'medium' ? 'Seniors: Prescription Coverage Cut' : 'Seniors: Unregulated Trial Device';
      }

      // If health_medium, the existing outbreak case is loaded separately in outbreak.js
      if (caseId === 'health_medium') return;

      window.SN_CASES[caseId] = {
        id: caseId,
        track: track.id,
        difficulty: diff.id,
        diffLabel: `${diff.dotEmoji} ${diff.label}`,
        title: caseTitle,
        subtitle: `Evaluate credibility, lateral search signals, and verified sources in the ${track.title} track.`,
        teaser: teaser,
        estimate: diff.id === 'easy' ? '5–7 minutes' : diff.id === 'medium' ? '7–10 minutes' : '10–12 minutes',
        number: 1,
        accounts: sharedAccounts,
        phases: [
          {
            id: 'phase1', label: 'Phase 1: Initial Claims',
            news: {
              headline: `Breaking reports circulating regarding ${track.title.toLowerCase()} incident`,
              body: [
                `Local news outlets have flagged unverified statements appearing across social platforms.`,
                `Official authorities recommend verifying source credentials before sharing.`
              ],
              source: 'Halden Herald'
            },
            feed: [
              {
                kind: 'post', id: `${caseId}_p1`, author: 'official_news', time: '1h',
                text: `Official update regarding ${track.title.toLowerCase()} incident: Authorities are monitoring developments. Verified updates will be posted here.`,
                stats: { replies: '142', reposts: '890', likes: '2.1K' }
              },
              {
                kind: 'post', id: `${caseId}_p1_b`, author: 'citizen_mike', replyTo: `${caseId}_p1`, time: '50m',
                text: `Good to see official news checking facts before posting rumors.`,
                stats: { replies: '12', reposts: '4', likes: '32' }
              },
              {
                kind: 'post', id: `${caseId}_p2`, author: 'scammer_click', time: '45m',
                text: `🚨 BREAKING: Secrets leaked regarding ${track.title.toLowerCase()}! What THEY don't want you to see! Repost now before deleted!! 😱`,
                stats: { replies: '410', reposts: '5.2K', likes: '8.4K' }
              },
              {
                kind: 'post', id: `${caseId}_p2_b`, author: 'citizen_tom', replyTo: `${caseId}_p2`, time: '35m',
                text: `Is there any actual proof or source link for this viral post?`,
                stats: { replies: '8', reposts: '2', likes: '45' }
              },
              {
                kind: 'question', id: `${caseId}_q1`, post: null, answer: 'true',
                claim: `Official statements from @HaldenHerald confirm authorities are monitoring the ${track.title.toLowerCase()} incident.`,
                explanation: `Verified news organization @HaldenHerald confirmed ongoing monitoring and advised waiting for official updates.`,
                tags: [],
                signals: ['Verified news agency reporting with named, checkable sources']
              },
              {
                kind: 'question', id: `${caseId}_q2`, post: `${caseId}_p2`, answer: 'false',
                claim: `The viral secret leak post from @ViralNews_HQ is a verified, fully documented breaking story.`,
                explanation: `The claim comes from a paid-checkmark sensationalist account (@ViralNews_HQ) with no external links, documentation, or official corroboration.`,
                tags: ['sensationalism', 'urgency'],
                signals: ['Unverified sensationalist claims with high viral repost counts']
              }
            ]
          },
          {
            id: 'phase2', label: 'Phase 2: Source Verification',
            news: {
              headline: 'Authorities issue statement on impostor accounts and rumors',
              body: [
                'Fact-checkers urge users to inspect handle spellings and registration dates.',
                'Official channels confirm no emergency policy measures have been enacted.'
              ],
              source: 'Halden Herald'
            },
            feed: [
              {
                kind: 'post', id: `${caseId}_p3`, author: 'fake_impostor', time: '2h',
                text: `⚠️ EMERGENCY: Immediate action required for all ${track.title.toLowerCase()} participants! Share immediately! ⚠️`,
                stats: { replies: '980', reposts: '8.4K', likes: '12.1K' }
              },
              {
                kind: 'post', id: `${caseId}_p3_b`, author: 'expert_dr', replyTo: `${caseId}_p3`, time: '1h 40m',
                text: `Notice the handle @CivicAlert_offical is misspelled. Official channel is @CivicAlert_official (registered 2012). Fake account has a paid checkmark bought last week.`,
                stats: { replies: '110', reposts: '2.1K', likes: '6.4K' }
              },
              {
                kind: 'question', id: `${caseId}_q3`, post: `${caseId}_p3`, answer: 'false',
                claim: `The emergency alert posted by @CivicAlert_offical is an official civic announcement.`,
                explanation: `Inspect the handle spelling: @CivicAlert_offical is a 12-day-old impostor account using a paid checkmark to mimic the legitimate @CivicAlert_official agency.`,
                tags: ['impersonation', 'urgency'],
                signals: ['Misspelled handle, recent account creation, and paid checkmark vs official org badge']
              }
            ]
          },
          {
            id: 'phase3', label: 'Phase 3: Final Resolution',
            news: {
              headline: `Fact-check complete on ${track.title.toLowerCase()} claims`,
              body: [
                'Independent researchers and official agencies publish full verification report.',
                'Users reminded to practice lateral reading before trusting viral posts.'
              ],
              source: 'Halden Herald'
            },
            feed: [
              {
                kind: 'post', id: `${caseId}_p4`, author: 'authority_gov', time: '3h',
                text: `Final Clarification: All facts regarding the ${track.title.toLowerCase()} situation have been published at civic.gov/updates. Thank you for relying on verified sources.`,
                stats: { replies: '210', reposts: '3.4K', likes: '9.8K' }
              },
              {
                kind: 'post', id: `${caseId}_p4_b`, author: 'citizen_mike', replyTo: `${caseId}_p4`, time: '2h',
                text: `Appreciate the clear summary and verified links.`,
                stats: { replies: '4', reposts: '2', likes: '50' }
              },
              {
                kind: 'question', id: `${caseId}_q4`, post: null, answer: 'true',
                claim: `Official civic channels and verified news sources have published the final verified updates online.`,
                explanation: `Direct statements from @CivicAlert_official and @HaldenHerald provide transparent documentation and official site links.`,
                tags: [],
                signals: ['Direct official documentation and transparent verification links']
              }
            ]
          }
        ]
      };
    });
  });

})();

