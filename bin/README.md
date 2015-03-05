# Project Tools

## list-projects.js
This script uses the GitHub API to get all of the public org repos for the
listed organizations and outputs JSON on stdout that should be suitable for
use as the top-level `projects.json` data file. Usage:

```
node bin/list-projects.js <org> [<org> ...]

Options:
  -c           specify the CI service to detect [default: "travis"]
  -v           print helpful messages to stderr
  --token, -t  your GitHub API auth token (default: $GITHUB_AUTH_TOKEN)

Not enough non-option arguments: got 0, need at least 1
```

See the [Makefile](../Makefile) for how it's used in this project, or run it
like so, replacing `your-org` with your GitHub organizations id as it appears
in URLs:

```sh
./bin/list-projects.js your-org > org-projects.json
```

This will list the status of each repo in your org as it goes, and write a
project listing to `org-projects.json` for all of the repos that contain a
`.travis.yml` file, which suggests that it's set up for continuous integration
with [Travis].

[Travis]: https://travis-ci.org
