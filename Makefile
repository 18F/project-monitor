ORG ?= 18F GSA

all: \
	projects.json \
	clean-css

projects.json: node_modules
	node bin/list-projects.js $(ORG) > $@

node_modules:
	npm install

clean-css: projmon/static/styles.css node_modules
	cp $<{,.orig}
	cat $<.orig | ./node_modules/.bin/beautify-css > $<
	rm $<.orig

clean:
	rm -f projects.json
