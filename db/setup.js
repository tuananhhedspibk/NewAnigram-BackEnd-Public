let responses = [
  db.createCollection('users'),
  db.createCollection('posts'),
  db.createCollection('comments'),
  db.createCollection('follows'),
  db.createCollection('likes'),
  db.createCollection('notifications'),
  db.createCollection('suggestfriends'),
  db.createCollection('activeaccountkeys'),
  db.createCollection('dailysendmaillogs'),
];

responses.forEach(res => {
  if (res['ok'] !== 1) {
    quit(1);
  }
});

printjson(responses);
