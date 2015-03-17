#!/usr/bin/env node
var octonode = require('octonode'),
    colors = require('colors'),
    async = require('async'),
    extend = require('xtend'),
    yargs = require('yargs')
      .usage('$0 <org> [<org> ...]')
      .require(1)
      .describe('c', 'specify the CI service to detect')
        .default('c', 'travis')
      .describe('v', 'print helpful messages to stderr')
        .boolean('v')
      .describe('token', 'your GitHub API auth token (default: $GITHUB_AUTH_TOKEN)')
        .alias('token', 't')
      .alias('h', 'help'),
    options = yargs.argv,
    servicesByName = {
      travis: {
        file: '.travis.yml',
        url: 'https://travis-ci.org/{repo}'
      }
    },
    services = coerceArray(options.c)
      .map(function(name) {
        if (!servicesByName.hasOwnProperty(name)) {
          throw ('no such service: ' + name);
        }
        return extend(servicesByName[name], {name: name});
      }),
    auth = options.token || process.env['GITHUB_AUTH_TOKEN'],
    github = octonode.client(auth),
    orgs = options._;

if (options.help) {
  yargs.showHelp();
  return process.exit(1);
}

var log = console.warn.bind(console),
    write = console.log.bind(console);

async.waterfall([
  loadOrgs,
  loadRepos,
  filterRepos
], function finished(error, repos) {
  if (error) return console.error('error:', error);
  write(JSON.stringify(repos.map(function(d) {
    var service = d.services[0];
    return {
      name: d._info.name,
      description: d._info.description,
      url: 'https://github.com/' + d.name,
      guid: d.name.replace(/\//g, '-'),
      service: service.name,
      service_url: service.url.replace(/{repo}/g, d.name)
    };
  }), null, '  '));
});

function loadOrgs(done) {
  done(null, orgs.map(function(org) {
    return github.org(org);
  }));
}

function loadRepos(orgs, done) {
  async.map(orgs, function getRepos(org, next) {
    log('getting repos for:', org.name);
    org.repos(function(error, repos) {
      if (error) return next(error);
      next(null, org.repos = repos.map(function(info) {
        var repo = github.repo(org.name + '/' + info.name);
        repo._info = info;
        return repo;
      }));
    });
  }, function(error) {
    if (error) return done(error);
    log('rolling up', orgs.length, 'orgs...');
    var repos = orgs.reduce(function(list, org) {
      return list.concat(org.repos);
    }, []);
    log('repos:', repos.length);
    done(null, repos);
  });
}

function filterRepos(repos, done) {
  async.filter(repos, getRepoServices, function(filtered) {
    done(null, filtered);
  });
}

function getRepoServices(repo, done) {
  // log('getting services for repo:', repo.name);
  async.filter(services, function(service, next) {
    repo.contents(service.file, next);
  }, function(filtered) {
    if (filtered.length) {
      log('✓'.green, repo.name, 'has', filtered[0].file);
    }
    repo.services = filtered;
    done(filtered.length);
  });
}

function LOG() {
  if (!options.v) return;
  console.warn.apply(console, arguments);
}

function ERROR() {
  console.error.apply(console, arguments);
}

function coerceArray(d) {
  return Array.isArray(d) ? d : [d];
}

function paginate(fn, args, done) {
  return fn(args, done);
}
