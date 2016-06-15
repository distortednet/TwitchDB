beta branch. no pull requests until this is live pls thanks


Stuff that needs worked on
 - find way to make certain ajax calls (ie for populating schedule stuff) fire only once
    this has been fixed, but through this discovered other weird bugs. crossroadsjs appears to batch logic inside of routes up when switching between SPA tabs. this causes
    things to be executed more than once (ie clicking between most viewers and random several times will cause both of them to blink in and out for each time you've clicked the tab).
    this effects other things too, such as click events, causing data to get submitted multiple times.
    right now a temporary fix has been made, but I need to re consider a majority of my client side logic, it appears.

    - nav links appear to be non functional
    - check boxes missing?
    - clicking profile subnav causes schedule to duplicate data

 - main index page tab menu overflows on small resolutions
 - add mod bio field
 - make hash tags in video titles on profile link to respective creative directories
 - maybe profile tag cloud for better content sorting in the future?
 - notification system of some sort (maybe issue notifications via whispers?)
 - wider profile page

 some notes for beta stuff

 - rethink 2.2.6 (?) does not work with the latest python driver. pip install rethinkdb==2.2.0.post6


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
