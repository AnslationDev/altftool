const seo = {
  title: "Facebook Self Exposure: 13 Search Queries",
  metaDescription:
    "Turn your name, username or profile.php id into 13 site: and quoted-phrase searches covering public group posts, events, the directory and archives.",
  steps: [
    "Fill in Name on your profile and Username, profile link or numeric id — a username needs five or more letters, numbers and full stops.",
    "Add a city and an employer, school or club to unlock the remaining queries, and set Open queries in to your preferred search engine.",
    "Press Copy on any of the 13 queries, or Run it to open the group, event, m.facebook.com, directory or archive search in that engine.",
  ],
  intro:
    "This builder assembles thirteen search-engine queries from your Facebook name, username or numeric profile id, city and employer, using documented operators (site:, quoted phrases, OR, minus) to surface the parts of your account that profile privacy settings do not cover: public group posts, event pages, photo pages, the m.facebook.com mirror, the public people directory, sites that link to your profile and archived snapshots. Usernames are validated against Facebook's rule of at least five characters using letters, numbers and full stops, and profile.php?id= links are handled as numeric ids. It builds strings for you to run; it never searches, scrapes or stores anything.",
  useCases: [
    "Checking what someone sees when they search your name before accepting or sending a friend request.",
    "Finding public group posts and event listings that stay visible however locked-down your profile is.",
    "Locating pages, directories and club sites that link to your profile and broadcast it further than you intended.",
    "Checking the Internet Archive for snapshots of an old profile or page you have since deleted.",
  ],
  benefits: [
    ["Handles both profile forms", "Vanity usernames and numeric profile.php?id= links are each turned into the right kind of query."],
    ["Targets what privacy settings miss", "Groups, events, the public directory and third-party links are searched separately from your profile."],
    ["Private by construction", "Everything is assembled in the browser; no query runs until you click one."],
  ],
  faqs: [
    [
      "How do I see what my Facebook profile looks like to strangers?",
      "Use the 'View as' option on your own profile for the in-app view, then run a site:facebook.com search for your name and username to see the indexed version search engines hold. The two differ: search results can include public group posts, event pages and directory entries that the profile view does not show.",
    ],
    [
      "Can I stop my Facebook profile appearing in Google?",
      "Settings and Privacy > Settings > Privacy has an option controlling whether search engines outside Facebook may link to your profile; switching it off removes the profile from future indexing. It does not affect public group posts, pages that link to you, or copies already archived elsewhere, which each need handling separately.",
    ],
    [
      "What are the rules for a Facebook username?",
      "A username must be at least five characters and can contain only letters, numbers and full stops — no hyphens or underscores — and it forms the facebook.com/username address. Accounts without one use facebook.com/profile.php?id= followed by a numeric account id, which searches for as a quoted phrase rather than a site: path.",
    ],
    [
      "Do my privacy settings cover posts in public groups?",
      "No. A post in a public group is visible to anyone, including people not signed in, and it is indexed independently of your profile settings. If a group's posts matter to you, check the group's privacy setting itself, and remember that changing a group from public to private does not always remove already-indexed pages.",
    ],
  ],
};

export default seo;
