beta branch. pls.


Stuff that needs worked on

 - make hash tags in video titles on profile link to respective creative directories
 - maybe profile tag cloud for better content sorting in the future?
 - notification system of some sort (maybe issue notifications via whispers?)
 - integrate clippy.js as dank meme https://www.smore.com/clippy-js
 - rename "family friendly" to something more accurate for channels not marked mature
 some notes for beta stuff

 - rethink 2.2.6 (?) does not work with the latest python driver. pip install rethinkdb==2.2.0.post6

bugs?


db prep

this will convert the old database structure to the new one. converts the old intro status system, removes fields no longer in use, renames fields to be more appropiate.
 r.db('introdb').table('users').filter({'intro_approved': true, 'intro_rejected': false}).update({'intro_status': 'approved'});
 r.db('introdb').table('users').filter({'intro_approved': false, 'intro_rejected': false}).update({'intro_status': 'pending'});
 r.db('introdb').table('users').filter({'intro_approved': true, 'intro_rejected': true}).update({'intro_status': 'rejected'});
 r.db('introdb').table('users').replace(r.row.without({'intro_data': 'intro_schedule'}));
 r.db('introdb').table('users').replace(r.row.without('intro_approved'));
 r.db('introdb').table('users').replace(r.row.without('intro_rejected'));
 r.db('introdb').table('users').update({ intro_data: r.row('profile_data') });
 r.db('introdb').table('users').replace(r.row.without('profile_data'));
 r.db('introdb').table('users').filter(function(row) {return row.hasFields('intro_data').not()}).delete();

replace after testing
 r.db('introdb').table('users').replace(r.row.without('feedback_data'))
 r.db('introdb').table('users').replace(r.row.without('votes'))
