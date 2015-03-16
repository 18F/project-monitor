[![Build Status](https://secure.travis-ci.org/18F/project-monitor.png?branch=master)](http://travis-ci.org/18F/project-monitor)

Description
===========

Project Monitor is a CI display aggregator. It displays the status of multiple
Continuous Integration builds on a single web page.  The intent is that you
display the page on a big screen monitor or TV so that the status of all your
projects' builds are highly visible/glanceable (a "Big Visible Chart").
Project Monitor currently supports only [Travis CI](http://travis-ci.org/).

This project is forked from [codeforamerica/projectmonitor][projectmonitor].
18F uses it to show the status of internal projects.

[projectmonitor]: https://github.com/codeforamerica/projectmonitor

## Add Your Project

Edit [`projects.json`](projects.json) with your project information via a
Github pull request. You will need three pieces of information:

1. A project display name
2. A unique identifier string
3. A Travis URL for the project

Here is an example:

    {
      "name": "Project Monitor",
      "guid": "18F-project-monitor",
      "travis url": "https://travis-ci.org/18F/project-monitor"
    }

The `guid` must be a string of word characters and dashes, matching the regular
expression `^\w+(-\w+)*$`.

In addition to adding your project here, you must also add a [webhook
notification][webhook] to your project's `.travis.yml`. This will allow Travis
to notify Project Monitor of the build status.
Here is an example of a valid wehbook notification setting in a
[Travis configuration file][config]:

```
notifications:
  webhooks: http://project-monitor.cf.18f.us/projects/18F-project-monitor/status
```

[webhook]: http://docs.travis-ci.com/user/notifications/#Webhook-notification
[config]: http://docs.travis-ci.com/user/build-configuration/

## Display
Just open a browser on `/`. The page refreshes every 5 minutes with the latest
status fetched by the cron job or received via Webhook. That is,
refreshing the page doesn't cause the individual builds to be re-polled.

### Layout
The layout consists of a grid of tiles representing the projects. The
number of projects that need to be displayed is determined automatically.

![Project Monitor Dashboard](preview.png)

### Build Statuses
Each project lists the amount of time since the last build in the bottom left
corner. Underneath that is the build status history. The last 5 builds
are displayed from left to right, in reverse chronological order — the most
recent build will be on the left and the least recent on the right.
Successful builds are marked with a check mark, and unsuccessful builds
are marked with an x.

### Readme Statuses
For a project's readme to be valid, it must have an installation section or
has a section indicating the project has been moved. A valid installation
section includes a head with the root word of "Install", "Setup", "Build" or
"Deploy". A section indicating the project has moved must include the phrase
"Repository has moved". A project can have no readme and still be considered
valid if the project is less than a week old.

## Installation

ProjectMonitor is a [Python Flask application][flask].
It relies on [PostreSQL for data storage](https://github.com/codeforamerica/howto/blob/master/PostgreSQL.md).

If you are on OS X, and if you already have [Homebrew][homebrew] installed,
you can install all the dependencies by running this command:
```
script/bootstrap
```

[flask]: https://github.com/codeforamerica/howto/blob/master/Python-Virtualenv.md
[homebrew]: http://brew.sh/

The script will install Postgres, Python, Pip, and Virtualenv if you don't
already have them, as well as Project Monitor's dependencies.

Once the script is done, run the following commands to start the app:
```
export DATABASE_URL="postgresql://localhost/projectmonitor"
source venv-project-monitor/bin/activate
python runserver.py
```

To test the app locally:

1. Simulate Travis sending a POST request to your server:

  `curl -X POST -d 'payload={"build_url":"https://travis-ci.org/18F/openFEC/builds/51547006"}' http://127.0.0.1:5000/projects/18f-open-fec/status --header "Content-Type:application/x-www-form-urlencoded"`

  Note that the Travis project in the command above needs to correspond to a project in your `projects.json`.

2. Open the site at [http://localhost:5000](http://localhost:5000)

Copyright (c) 2014-2015 Code for America / 2015 18F.
This software is licensed under the MIT License.
