
# Platform Of Things

My own personal site filled with bits of stuff that might help other people one day

www.rexchoppers.com
## Installation

* Follow the instructions on https://jekyllrb.com/docs/installation/ to install Jekyll
* `gem install eventmachine -v '1.2.7' -- --with-ldflags="-Wl,-undefined,dynamic_lookup"`
* `bundle install` to install gems
* `bundle exec jekyll serve` to run the site in development mode

## Documentation

### Commands
```sh
docker run --rm -it \
  -v $(pwd):/srv/jekyll \
  -p 4000:4000 \
  jekyll/jekyll:4.2.2 \
  jekyll serve --watch --force_polling --host 0.0.0.0
```

### Brain Dump
- Versioned queues
- RabbitMQ Integration
- excimer for Sentry on Elasticbeanstalk
